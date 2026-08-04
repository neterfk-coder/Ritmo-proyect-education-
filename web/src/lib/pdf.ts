/**
 * Pulling the text out of a PDF, in the browser.
 *
 * Assignments arrive as PDFs more often than as anything else, and the student
 * this is built for is exactly the one who will not retype two pages of one to
 * get started. Refusing the format most homework actually arrives in put the
 * product's own wall back at its front door.
 *
 * Extraction happens on the device, not on the server. Only the extracted text
 * is sent onward, which is the same thing that happens when somebody pastes —
 * so the PDF itself, with whatever school letterhead, name and class it
 * carries, never leaves the machine. Doing this server-side would have been
 * less code and a worse promise.
 *
 * The library is loaded on first use rather than imported at the top. It is
 * about a megabyte, and a student who never opens a PDF should never pay for
 * it.
 */

/** Roughly two hundred pages. Past this it is not homework, it is a textbook. */
export const MAX_PDF_BYTES = 20_000_000;

export class PdfError extends Error {
  constructor(public reason: "encrypted" | "empty" | "broken") {
    super(reason);
  }
}

let loading: Promise<typeof import("pdfjs-dist")> | null = null;

async function library() {
  if (!loading) {
    loading = (async () => {
      const pdfjs = await import("pdfjs-dist");
      // Vite gives the worker its own URL so it is fetched as a separate file
      // rather than inlined; without a worker pdf.js parses on the main thread
      // and a long document freezes the page.
      const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
      pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
      return pdfjs;
    })();
  }
  return loading;
}

/**
 * @param onProgress fraction 0..1, so a long document can say it is moving.
 *   A wait with no sign of life is the thing that makes people press again.
 */
export async function extractPdfText(
  file: File,
  onProgress?: (fraction: number) => void
): Promise<string> {
  const pdfjs = await library();

  let doc;
  try {
    doc = await pdfjs.getDocument({
      data: new Uint8Array(await file.arrayBuffer()),
      // No cMapUrl and no standardFontDataUrl on purpose: given either, pdf.js
      // fetches them from a CDN at parse time. We only want the characters, and
      // a page that quietly calls out to a third party is not something this
      // product gets to do. Font rendering is what suffers, and we render none.
      disableFontFace: true,
      // Errors only. Without this the library warns about the font data we
      // deliberately did not give it, once per document, in the console of a
      // student who cannot act on it and did nothing wrong.
      verbosity: 0,
    }).promise;
  } catch (err) {
    const name = (err as { name?: string })?.name;
    throw new PdfError(name === "PasswordException" ? "encrypted" : "broken");
  }

  const pages: string[] = [];
  for (let n = 1; n <= doc.numPages; n += 1) {
    const page = await doc.getPage(n);
    const content = await page.getTextContent();

    // pdf.js returns positioned fragments, not lines. Joining them blindly
    // runs every line of the page into one paragraph, which destroys exactly
    // the structure the decompiler reads. So: break when the vertical
    // position moves, which is where the line ended.
    let text = "";
    let lastY: number | null = null;
    for (const item of content.items) {
      if (!("str" in item)) continue;
      const y = item.transform[5] as number;
      if (lastY !== null && Math.abs(y - lastY) > 2) text += "\n";
      else if (text && !text.endsWith(" ") && !text.endsWith("\n")) text += " ";
      text += item.str;
      lastY = y;
    }
    pages.push(text.trim());
    onProgress?.(n / doc.numPages);
  }

  const joined = pages.filter(Boolean).join("\n\n").replace(/\n{3,}/g, "\n\n").trim();

  // A PDF made by scanning a worksheet has no text layer at all. Saying "it is
  // a picture" is actionable; handing back an empty box is not.
  if (!joined) throw new PdfError("empty");
  return joined;
}
