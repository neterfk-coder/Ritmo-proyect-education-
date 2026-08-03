/**
 * What the companion knows about Ritmo, without a model.
 *
 * This is the offline half of the guide, and it is the default. A student who
 * cannot get the app to load is exactly the student who most needs the help
 * topic about the app not loading — so support answers cannot depend on the
 * network, on a key, or on anything that might be the thing that broke.
 *
 * With a key, `companion.js` asks the model first and falls back here. Both
 * paths return the same shape.
 */

export const TOPICS = [
  {
    id: "what-is-this",
    keys: ["what is ritmo", "what is this", "what does this do", "what are you", "who are you", "how does this work", "explain the app", "purpose", "help", "what can you do", "guide", "features", "ovi", "lost", "confused"],
    answer:
      "Ritmo takes an assignment and works out what it is actually asking for, then hands you one step small enough to start without deciding anything. Over time it builds a description of how you work that belongs to you, and that you can hand to a teacher.\n\nThe three places to look are Work, How I work, and My data.",
  },
  {
    id: "start-task",
    keys: ["start", "begin", "new task", "add task", "first task", "how do i start", "paste", "where do i put", "homework", "assignment", "upload", "enter my work", "submit"],
    answer:
      "Go to Work and paste the assignment exactly as your teacher gave it to you. Do not tidy the wording up — the messy phrasing is the part this is built to decode.\n\nYou can also drop in a .txt or .md file, or press \"Say it instead\" and talk.",
  },
  {
    id: "definition-of-done",
    keys: ["done", "definition of done", "when do i stop", "finished", "how do i know", "stop when", "you can stop when", "enough", "complete", "how much", "how long should it be"],
    answer:
      "The panel at the top labelled \"You can stop when\" is the definition of done. School assignments almost never say how you would know you had finished, so Ritmo makes that layer explicit and puts it first.\n\nIf what is on your page matches that sentence, you are finished. That is the whole test.",
  },
  {
    id: "one-step",
    keys: ["one step", "only one", "why one step", "next step", "other steps", "see all steps", "how many steps", "lantern", "do only this", "step", "rest of the steps", "all the steps", "hidden steps"],
    answer:
      "Only one step is lit at a time, on purpose. Seeing twelve steps at once is not extra information, it is an avalanche — and starting is a decision problem, so the first step is guaranteed to need zero decisions from you.\n\nIf you want to see what is coming, there is a \"Show what is coming\" link under the step. The total is hidden by default; you can turn it on under Reading in the header.",
  },
  {
    id: "too-big",
    keys: ["too big", "smaller", "shrink", "make it smaller", "cannot start", "step is hard", "overwhelmed by the step", "hard", "difficult", "break it down", "split"],
    answer:
      "Press \"Too big\" on the lit step and it cuts back to its first instruction only. You can press it more than once.\n\nMaking a step smaller is not giving up, it is aim. It is also the intervention that most people take when they stall.",
  },
  {
    id: "park-it",
    keys: ["park", "skip", "skip step", "come back", "later", "park it"],
    answer:
      "\"Park it\" moves the current step aside and lights the next one. Nothing is lost — a parked step is recorded as skipped, not as failed, and you can come back to it.",
  },
  {
    id: "formats",
    keys: ["format", "shape", "skeleton", "dialogue", "map", "panels", "comic", "read aloud format", "different shape", "same words", "switch format", "change format", "change the shape", "rewrite", "another way", "different way", "reformat"],
    answer:
      "Under \"Same words, different shape\" you can re-render the same material five ways:\n\n· Skeleton — structure only, stripped to the load-bearing lines\n· Dialogue — two people working the problem out loud\n· Map — where the ideas sit relative to each other\n· Panels — six pictures with captions\n· Read aloud — written for the ear, one idea per sentence\n\nNothing is dropped between them. If an idea is hard it stays hard, it just changes form. Switching does not lose your place and the second look at a shape is instant, because it is cached.",
  },
  {
    id: "fastest-format",
    keys: ["dot", "orange dot", "fastest", "which format is best", "marked format"],
    answer:
      "The small dot on a format is the one you read fastest, measured from your own sessions rather than chosen for you. It appears once there is enough recorded to say.",
  },
  {
    id: "read-aloud",
    keys: ["read it to me", "read aloud", "speech", "voice", "listen", "tts", "text to speech", "hear it", "out loud", "aloud", "narrate", "audio", "sound"],
    answer:
      "Press \"Read it to me\" above the text. It highlights each word as it says it, because unsynced audio plus text is worse than either alone for most dyslexic readers.\n\nIt uses your browser's own voice, so it works with no key and the audio never leaves your device. If the button is missing, your browser does not support it — Chrome and Edge do.",
  },
  {
    id: "dictation",
    keys: ["say it instead", "dictation", "dictate", "talk", "speak instead", "voice input", "speak it", "type for me"],
    answer:
      "\"Say it instead\" on the task box turns on dictation, and writes each sentence as you finish it. Press it again to stop.\n\nIt needs Chrome or Edge. Firefox and Safari do not support it and the button will tell you so.",
  },
  {
    id: "friction-sheet",
    keys: ["popup", "sheet appeared", "why did it ask", "noticed", "interrupted", "asked me if i needed help", "friction", "it interrupted me", "interrupt", "popped up", "appeared", "bothered", "nagging", "stuck"],
    answer:
      "That panel appears when a few signals suggest you have been stuck rather than working — time on one place, typing and deleting, no input at all, the window losing focus, or scrolling back repeatedly.\n\nAll of it is computed in your browser and thrown away after scoring. No camera, no keystroke log, nothing about what you wrote. If it was wrong, press \"No, I am fine\" and it will interrupt less often from then on.",
  },
  {
    id: "interventions",
    keys: ["options when stuck", "change the options", "intervention", "what appears when stuck", "menu of help"],
    answer:
      "The options in that panel are the ones you chose during setup, before you needed them — deciding what helps is much harder in the moment.\n\nYou can change which ones are offered from your account settings, and \"No, I am fine\" is always there as a first-class choice.",
  },
  {
    id: "reading-settings",
    keys: ["theme", "dark", "contrast", "colour", "color", "tint", "overlay", "line spacing", "letter spacing", "font", "text size", "reading settings", "hard to read", "background", "brighter", "darker", "bigger text", "spacing", "eyes hurt", "too bright"],
    answer:
      "Press \"Reading\" in the header. You can change the surface (Calm, Dark, High contrast), lay a colour overlay over the page, and adjust line and letter spacing.\n\nIt is in the header rather than buried in settings because the moment you need it is the moment you are struggling to read.",
  },
  {
    id: "step-count",
    keys: ["step count", "how many left", "show total", "progress", "dots", "marks"],
    answer:
      "The dots next to the step are the ground behind you. By default nothing is drawn for the steps ahead, because seeing the total made testers stop before starting.\n\nIf you want the total, turn on \"Show how many steps are left\" under Reading in the header.",
  },
  {
    id: "profile",
    keys: ["how i work", "profile", "insights", "observations", "what it learned", "measured", "stats", "learn about me", "what it knows", "my results", "progress report"],
    answer:
      "\"How I work\" holds everything the sessions have shown: observations with the evidence attached, your focus block, your time to start, and your reading rate.\n\nIf an observation is wrong, press \"Not true\". Dismissed observations are never generated again — if you say something about you is wrong, the software does not argue.",
  },
  {
    id: "directives",
    keys: ["rules", "directives", "instructions for the model", "system prompt", "tell it how to talk", "change how it talks", "my rules", "prompt", "how it speaks", "tone", "stop encouraging me"],
    answer:
      "On \"How I work\" there is a section called \"The instructions the model gets\". Those sentences are placed above everything we wrote, every single time the model runs.\n\nRules like \"never tell me how many steps are left\" or \"do not encourage me\" go there. You can read, add and delete every line. There is no second, hidden version.",
  },
  {
    id: "export",
    keys: ["export", "teacher", "give to teacher", "handover", "print", "share", "accommodation", "evidence", "hand it in", "show my teacher", "one page", "report"],
    answer:
      "At the bottom of \"How I work\" there is \"Give it to a teacher\". It produces one page in your own voice, with the evidence attached, and you can copy or print it.\n\nThat is the only route by which anything leaves your account, and it only happens when you press it.",
  },
  {
    id: "privacy",
    keys: ["privacy", "data", "what do you collect", "camera", "spying", "watching me", "tracked", "who can see", "is it private", "my data", "store", "stored", "collect", "know about me", "see my data", "safe", "secure", "anonymous", "webcam", "microphone"],
    answer:
      "No camera. No microphone unless you press dictation, and that audio never leaves the device. No keystroke log — friction is five numbers between 0 and 1, computed in your browser and discarded after scoring.\n\nThere is no teacher dashboard and no parent digest. There is no table in the database for a person who is not you. Everything sits in a file on the machine running this app.\n\nThe \"My data\" page says all of this in full, and has the erase button.",
  },
  {
    id: "account",
    keys: ["account", "id", "log in", "login", "sign in", "another browser", "another device", "password", "lost my account", "device", "browser", "switch computer", "same account"],
    answer:
      "Your account id is on the \"My data\" page — copy it to open the same account in another browser. There is no password because there is no server holding accounts.\n\nIf you lost the id and cleared the browser, the account cannot be recovered. That is the cost of there being no account server.",
  },
  {
    id: "erase",
    keys: ["delete", "erase", "remove everything", "wipe", "start over", "delete my account", "clear my data", "get rid of"],
    answer:
      "\"My data\" → \"Erase everything\". It deletes your rules, tasks, sessions, friction rows and observations immediately, and there is no archived copy.\n\nIf you only want to leave this browser without deleting anything, use \"Just sign out on this browser\" instead.",
  },
  {
    id: "offline-mode",
    keys: ["offline", "api key", "anthropic", "no key", "model", "ai mode", "mock", "does it need internet", "live", "internet", "wifi", "free", "cost", "groq", "provider"],
    answer:
      "Ritmo runs fully offline by default. Without a key it uses a deterministic engine that runs the same code paths and returns the same shapes as the model — every feature is usable with no key, no network and no cost.\n\nTo use the live model, put an ANTHROPIC_API_KEY in server/.env and restart. The header says which mode you are in.",
  },
  {
    id: "trouble-blank",
    keys: ["not loading", "blank page", "nothing happens", "broken", "white screen", "will not load", "stuck loading", "does not work", "blank", "nothing loads", "crash", "wont open", "empty screen", "page is white"],
    answer:
      "Try these in order:\n\n1. Check the API is up — open http://localhost:4000/api/health. It should return ok: true.\n2. If it does not, the server is not running. From the project folder run: npm run dev\n3. Hard refresh the page — Ctrl+Shift+R.\n4. If the page loads but nothing saves, your browser may be blocking local storage in private mode.",
  },
  {
    id: "trouble-server",
    keys: ["server error", "did not answer", "500", "502", "cannot reach", "connection refused", "api down", "port", "address in use", "eaddrinuse", "error", "failed", "not responding", "api"],
    answer:
      "\"The server did not answer\" means the API on port 4000 is not reachable.\n\n· Make sure npm run dev is running and shows both the API and the app.\n· If it says the port is in use, something else is on 4000. Change PORT in server/.env and restart.\n· Model failures never surface as errors — they fall back to the offline engine — so a visible error is almost always the local server, not the model.",
  },
  {
    id: "trouble-database",
    keys: ["database", "prisma", "sqlite", "reset the database", "seed", "migration", "db"],
    answer:
      "From the project folder:\n\n· npm run db:reset — wipes and reseeds, useful if the data got into a strange state\n· npm run db:studio — opens a browser view of everything stored\n\nThe database is a single SQLite file at server/prisma/dev.db. Deleting it and running npm run setup again gives you a clean start.",
  },
  {
    id: "trouble-slow",
    keys: ["slow", "taking long", "spinning", "loading forever", "hangs", "frozen"],
    answer:
      "If it is working out an assignment, the panel lists the real stages as it goes — no bar, because we do not know how long a model takes.\n\nWith a key, calls time out after 30 seconds and fall back to the offline engine rather than hanging. If something sits longer than that, it is the local server rather than the model, so check http://localhost:4000/api/health.",
  },
  {
    id: "who-made",
    keys: ["who made", "who built", "hackathon", "team", "credits", "licence", "license", "open source"],
    answer:
      "Ritmo was built for the IncludAI Neurodiversity Hackathon, Track 1: AI for K–12 Learning. It is MIT licensed.\n\nThe design decisions came out of sessions with neurodivergent students — docs/CO-DESIGN.md records who asked for what, and which of those changed the build.",
  },
  {
    id: "greeting",
    keys: ["hello", "hi", "hey", "good morning", "good evening", "yo"],
    answer:
      "Hello. Ask me how any part of this works, or what to do when something is not behaving.\n\nIf you are not sure where to start: paste an assignment on the Work page and it will hand you one step.",
  },
  {
    id: "thanks",
    keys: ["thanks", "thank you", "cheers", "ta", "appreciate"],
    answer: "Any time. I am on the right of the screen whenever you need me.",
  },
];

const STOP = new Set([
  "the", "a", "an", "is", "are", "was", "do", "does", "did", "how", "what", "why",
  "can", "i", "you", "it", "this", "that", "to", "of", "in", "on", "for", "and",
  "my", "me", "with", "at", "be", "have", "has", "get", "there", "am", "if",
  "when", "where", "so", "but", "or", "not", "no", "yes", "please", "just",
]);

const normalise = (text) =>
  String(text ?? "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();

/**
 * Light stemming, applied to both sides.
 *
 * Without it the guide fails on the way people actually type: "nothing loads"
 * misses a key of "not loading", and "why did it interrupt me" misses
 * "interrupted". Anyone who has to guess the phrasing the software wants has
 * already been failed by it.
 */
function stem(word) {
  if (word.length <= 4) return word;
  for (const suffix of ["ing", "ied", "ies", "ed", "es", "s"]) {
    if (word.endsWith(suffix) && word.length - suffix.length >= 3) {
      return word.slice(0, -suffix.length);
    }
  }
  return word;
}

const meaningful = (text) =>
  normalise(text)
    .split(" ")
    .filter((w) => w.length > 1 && !STOP.has(w))
    .map(stem);

/**
 * Scores every topic against the question and returns the best, or null when
 * nothing clears the bar.
 *
 * Key phrases match as an unordered set of stems rather than as a substring,
 * so "the page is blank and nothing loads" still reaches the key "blank page".
 * Longer phrases score higher, which keeps "read aloud" ahead of a stray
 * "read" that happens to sit in a question about something else.
 */
export function findTopic(question) {
  const asked = meaningful(question);
  if (!asked.length) return null;
  const bag = new Set(asked);

  let best = null;
  let bestScore = 0;

  for (const topic of TOPICS) {
    let score = 0;
    // Several phrasings of one key collapse to the same stems — "stop when",
    // "when do i stop" and "you can stop when" are all just ["stop"]. Scoring
    // each of them separately would let a topic outrank a longer, more
    // specific match purely by having been written three ways.
    for (const signature of signaturesFor(topic)) {
      const parts = signature.split(" ");
      if (parts.every((p) => bag.has(p))) {
        score += parts.length === 1 ? 2 : parts.length * 3;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      best = topic;
    }
  }

  return bestScore >= 2 ? best : null;
}

const signatureCache = new WeakMap();

function signaturesFor(topic) {
  let cached = signatureCache.get(topic);
  if (!cached) {
    cached = new Set(
      topic.keys
        .map((key) => meaningful(key).sort().join(" "))
        .filter(Boolean)
    );
    signatureCache.set(topic, cached);
  }
  return cached;
}

export const FALLBACK =
  "I did not catch which part that is about. I can help with any of these:\n\n· Starting a task, and what \"you can stop when\" means\n· Why only one step is lit, and how to make it smaller\n· Switching the shape of the material, or having it read aloud\n· Why that panel appeared when you were stuck\n· Your rules for the model, and giving a page to a teacher\n· What is stored, and how to erase it\n· Something not working: blank page, server errors, the database\n\nAsk about one of those in your own words and I will find it.";

/** A short, capability-shaped list used to prime the live model. */
export const CAPABILITY_SUMMARY = TOPICS.map((t) => `${t.id}: ${t.keys.slice(0, 4).join(", ")}`).join("\n");
