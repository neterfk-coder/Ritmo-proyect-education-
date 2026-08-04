/**
 * Deterministic stand-in for the model.
 *
 * This exists so the whole product is demonstrable with no API key, no network,
 * and no cost — which matters when your testers are 13 and your reviewer is
 * opening the repo on a train. It is not a toy: it runs the same code path and
 * returns the same shapes as the live client.
 *
 * It is also, on the hosted copy, what everybody actually sees, because no key
 * is set there. So it is bilingual for the same reason the interface is: half
 * of what a student reads on screen is produced in this file.
 */

import { DEFAULT_LANG } from "../lib/lang.js";

const sentences = (text) =>
  text.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);

/**
 * The assignment verb, and what it actually asks you to physically produce.
 *
 * Both languages are matched regardless of which one the interface is in: a
 * Spanish-speaking student is routinely handed an English assignment, and a
 * bilingual school hands out both. What the interface language decides is the
 * language of the *answer*, not which assignments can be read.
 */
const VERB_SETS = [
  {
    pattern:
      /\b(discuss|analy[sz]e|compare|describe|explain|argue|evaluate|summari[sz]e|research|design|solve|write|draw)\b/i,
    canonical: {
      discuss: "discuss", analyse: "analyse", analyze: "analyse", compare: "compare",
      describe: "describe", explain: "explain", argue: "argue", evaluate: "evaluate",
      summarise: "summarise", summarize: "summarise", research: "research",
      design: "design", solve: "solve", write: "write", draw: "draw",
    },
  },
  {
    pattern:
      /\b(analiza|analizar|compara|comparar|describe|describir|explica|explicar|argumenta|argumentar|eval[uú]a|evaluar|resume|resumir|investiga|investigar|dise[nñ]a|dise[nñ]ar|resuelve|resolver|escribe|escribir|dibuja|dibujar|comenta|comentar)\b/i,
    canonical: {
      comenta: "discuss", comentar: "discuss",
      analiza: "analyse", analizar: "analyse",
      compara: "compare", comparar: "compare",
      describe: "describe", describir: "describe",
      explica: "explain", explicar: "explain",
      argumenta: "argue", argumentar: "argue",
      evalua: "evaluate", evaluar: "evaluate",
      resume: "summarise", resumir: "summarise",
      investiga: "research", investigar: "research",
      disena: "design", disenar: "design",
      resuelve: "solve", resolver: "solve",
      escribe: "write", escribir: "write",
      dibuja: "draw", dibujar: "draw",
    },
  },
];

/** Drops accents and ñ, so `evalúa` and `diseña` reach their keys. */
const fold = (word) =>
  word.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function detectVerb(rawText) {
  for (const set of VERB_SETS) {
    const match = rawText.match(set.pattern);
    if (match) {
      const found = match[1].toLowerCase();
      const canonical = set.canonical[found] ?? set.canonical[fold(found)];
      if (canonical) return canonical;
    }
  }
  return "produce";
}

/** What each verb is really asking for, in the language the student reads. */
const TRANSLATIONS = {
  en: {
    discuss: "write several paragraphs that put two or more positions next to each other",
    analyse: "break the thing into parts and say what each part does",
    compare: "list what is the same and what is different, in that order",
    describe: "state the observable features one at a time",
    explain: "give the cause before the effect, in order",
    argue: "pick one position and give reasons that support it",
    evaluate: "judge it against a stated standard and say why",
    summarise: "restate only the load-bearing points, in your own words",
    research: "find sources, then write what they say and where you found them",
    design: "produce a labelled plan of a thing that does not exist yet",
    solve: "show the working, then state the answer",
    write: "produce continuous prose with a beginning and an end",
    draw: "produce a labelled image",
    produce: "make one concrete thing and hand it in",
  },
  es: {
    discuss: "escribir varios párrafos que pongan dos o más posturas una al lado de la otra",
    analyse: "partir la cosa en trozos y decir qué hace cada trozo",
    compare: "enumerar qué es igual y qué es distinto, en ese orden",
    describe: "enunciar los rasgos observables uno a uno",
    explain: "dar la causa antes que el efecto, en orden",
    argue: "elegir una postura y dar razones que la sostengan",
    evaluate: "juzgarlo frente a un criterio dicho en voz alta y decir por qué",
    summarise: "repetir solo los puntos que sostienen el resto, con tus palabras",
    research: "buscar fuentes y luego escribir qué dicen y dónde las encontraste",
    design: "producir un plan etiquetado de algo que todavía no existe",
    solve: "mostrar el desarrollo y luego enunciar la respuesta",
    write: "producir prosa continua con un principio y un final",
    draw: "producir una imagen con sus etiquetas",
    produce: "hacer una cosa concreta y entregarla",
  },
};

const DECOMPOSE_COPY = {
  en: {
    untitled: "Untitled task",
    plainAsk: (what, first) => `You are being asked to ${what}, based on: ${first}`,
    definitionOfDone:
      "You can stop when every item in the list below exists on the page and you have read it once from the top.",
    deliverables: [
      "One written response that answers the question directly",
      "At least two specific details taken from the source material",
      "A closing line that states your position",
    ],
    trapWarnings: [
      "The assignment does not say how long it should be. Aim for one page unless your teacher said otherwise.",
      "Your own opinion is expected here even though nobody wrote that down.",
    ],
    steps: [
      "Open a blank page and copy the assignment question onto the top line, word for word.",
      "Underline every word in the question that names a thing you must produce.",
      "Write one sentence answering the question badly. It is allowed to be wrong.",
      "Add two details from the source underneath that sentence.",
      "Read what you have out loud once and fix only the sentences that stop your mouth.",
      "Write one closing line that says what you think.",
    ],
  },
  es: {
    untitled: "Tarea sin título",
    plainAsk: (what, first) => `Se te está pidiendo ${what}, a partir de: ${first}`,
    definitionOfDone:
      "Puedes parar cuando todo lo de la lista de abajo exista en la página y lo hayas leído una vez desde arriba.",
    deliverables: [
      "Una respuesta escrita que conteste directamente a la pregunta",
      "Al menos dos detalles concretos sacados del material de origen",
      "Una línea de cierre que diga cuál es tu postura",
    ],
    trapWarnings: [
      "El enunciado no dice qué extensión debe tener. Apunta a una página salvo que tu profesor haya dicho otra cosa.",
      "Aquí se espera tu propia opinión aunque nadie lo haya escrito.",
    ],
    steps: [
      "Abre una página en blanco y copia la pregunta de la tarea en la primera línea, palabra por palabra.",
      "Subraya en la pregunta cada palabra que nombre algo que tengas que producir.",
      "Escribe una frase que conteste mal a la pregunta. Tiene permiso para estar equivocada.",
      "Añade debajo de esa frase dos detalles sacados del material.",
      "Lee en voz alta una vez lo que llevas y arregla solo las frases que te traban la boca.",
      "Escribe una línea de cierre que diga lo que piensas.",
    ],
  },
};

const STEP_SECONDS = [60, 90, 150, 240, 180, 120];

export function mockDecompose(rawText, lang = DEFAULT_LANG) {
  const copy = DECOMPOSE_COPY[lang] ?? DECOMPOSE_COPY[DEFAULT_LANG];
  const words = TRANSLATIONS[lang] ?? TRANSLATIONS[DEFAULT_LANG];

  const parts = sentences(rawText);
  const first = parts[0] ?? rawText.slice(0, 120);
  const what = words[detectVerb(rawText)];

  return {
    title: first.split(/\s+/).slice(0, 7).join(" ").replace(/[:.]$/, "") || copy.untitled,
    subject: null,
    hiddenVerb: what,
    plainAsk: copy.plainAsk(what, first),
    definitionOfDone: copy.definitionOfDone,
    deliverables: [...copy.deliverables],
    trapWarnings: [...copy.trapWarnings],
    estimatedMinutes: Math.min(60, Math.max(10, Math.round(rawText.length / 45))),
    steps: copy.steps.map((text, i) => ({
      text,
      estimatedSeconds: STEP_SECONDS[i] ?? 120,
    })),
    model: "mock",
  };
}

/**
 * The labels inside each shape.
 *
 * Structural furniture rather than prose, and the part a student navigates by —
 * "PANEL 3" is how you find your place in the comic form. Leaving them in
 * English inside otherwise-Spanish material is the kind of half-translation
 * that reads as broken.
 */
const SHAPE_COPY = {
  en: {
    ask: "So what is actually going on with this:",
    centre: "CENTRE — the claim everything else hangs off",
    nothing: "(nothing yet)",
    around: "AROUND IT — the supports",
    edges: "EDGES — details you can come back to",
    panel: "PANEL",
    shows: "Shows: a single scene holding one idea",
    caption: "Caption:",
  },
  es: {
    ask: "A ver, qué está pasando aquí en realidad:",
    centre: "CENTRO — la afirmación de la que cuelga todo lo demás",
    nothing: "(todavía nada)",
    around: "ALREDEDOR — los apoyos",
    edges: "BORDES — detalles a los que puedes volver luego",
    panel: "VIÑETA",
    shows: "Se ve: una sola escena que sostiene una idea",
    caption: "Texto:",
  },
};

export function mockReformat(rawText, format, lang = DEFAULT_LANG) {
  const copy = SHAPE_COPY[lang] ?? SHAPE_COPY[DEFAULT_LANG];
  const parts = sentences(rawText);
  const take = parts.slice(0, 8);

  if (format === "dialogue") {
    return take.map((s, i) => (i % 2 === 0 ? `A. ${copy.ask} ${s}` : `B. ${s}`)).join("\n\n");
  }
  if (format === "map") {
    return [
      copy.centre,
      `  ${take[0] ?? copy.nothing}`,
      "",
      copy.around,
      ...take.slice(1, 5).map((s) => `  · ${s}`),
      "",
      copy.edges,
      ...take.slice(5).map((s) => `  · ${s}`),
    ].join("\n");
  }
  if (format === "comic") {
    return take
      .slice(0, 6)
      .map((s, i) => `${copy.panel} ${i + 1}\n  ${copy.shows}\n  ${copy.caption} ${s}`)
      .join("\n\n");
  }
  if (format === "audio") {
    return take.map((s) => s.replace(/,\s*/g, ",\n")).join("\n\n");
  }
  return take.map((s) => `— ${s}`).join("\n");
}

/**
 * The observations on the profile page — and, through the export, the sentences
 * a student hands to a teacher. Those have to be in a language the teacher in
 * front of them reads.
 */
const INSIGHT_COPY = {
  en: {
    format: (fmt, wpm) => `You read fastest in ${fmt} format — about ${wpm} words a minute.`,
    formatEvidence: (n) => `Measured across ${n} ${n === 1 ? "session" : "sessions"}.`,
    initiation: (s) =>
      `Once the first step needs no decision from you, you start in about ${s} seconds.`,
    initiationEvidence: "Median time from opening a task to your first action.",
    pacing: (m) => `Your focus holds for about ${m} minutes before friction rises.`,
    pacingEvidence: "Averaged across your recorded sessions.",
  },
  es: {
    format: (fmt, wpm) => `Lees más rápido en formato ${fmt}: unas ${wpm} palabras por minuto.`,
    formatEvidence: (n) => `Medido en ${n} ${n === 1 ? "sesión" : "sesiones"}.`,
    initiation: (s) =>
      `Cuando el primer paso no te exige decidir nada, empiezas en unos ${s} segundos.`,
    initiationEvidence: "Tiempo mediano desde abrir una tarea hasta tu primera acción.",
    pacing: (m) => `Tu concentración aguanta unos ${m} minutos antes de que suba la fricción.`,
    pacingEvidence: "Promediado entre tus sesiones registradas.",
  },
};

/** Format names as they read inside a sentence. */
export const FORMAT_WORDS = {
  en: { skeleton: "skeleton", dialogue: "dialogue", map: "map", comic: "panels", audio: "read-aloud" },
  es: { skeleton: "esqueleto", dialogue: "diálogo", map: "mapa", comic: "viñetas", audio: "voz alta" },
};

export function mockInsights(summary, lang = DEFAULT_LANG) {
  const copy = INSIGHT_COPY[lang] ?? INSIGHT_COPY[DEFAULT_LANG];
  const names = FORMAT_WORDS[lang] ?? FORMAT_WORDS[DEFAULT_LANG];
  const out = [];

  if (summary.formatRates?.length > 1) {
    const best = summary.formatRates[0];
    out.push({
      kind: "format",
      statement: copy.format(names[best.format] ?? best.format, Math.round(best.wpm)),
      evidence: copy.formatEvidence(summary.sessions),
      confidence: 0.6,
    });
  }
  if (summary.medianFirstActionMs) {
    out.push({
      kind: "initiation",
      statement: copy.initiation(Math.round(summary.medianFirstActionMs / 1000)),
      evidence: copy.initiationEvidence,
      confidence: 0.55,
    });
  }
  if (summary.bestBlockMinutes) {
    out.push({
      kind: "pacing",
      statement: copy.pacing(summary.bestBlockMinutes),
      evidence: copy.pacingEvidence,
      confidence: 0.5,
    });
  }
  return out;
}
