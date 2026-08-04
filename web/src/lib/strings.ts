/**
 * Two languages, one dictionary.
 *
 * Why the pairs live side by side rather than in `en.ts` and `es.ts`: a missing
 * or drifted translation is invisible across two files and obvious in one. Each
 * entry is read as a unit, so a change to the English that never reached the
 * Spanish shows up in the diff on the line below it.
 *
 * The keys are typed, so `t("nav.wrok")` fails the build rather than rendering
 * a raw key at a student.
 *
 * Register, both languages: second person, plain verbs, no exclamation marks,
 * no praise. Spanish uses tú throughout — this is a tool a 13-year-old talks
 * to, and usted would put a desk between them. `server/src/ai/prompts.js` binds
 * the model to the same rules.
 *
 * Kept apart from the provider so that nothing has to import React to read a
 * string, and so the pairs can be checked on their own.
 */

export type Lang = "en" | "es";

export const LANGS: { code: Lang; short: string; name: string }[] = [
  { code: "en", short: "EN", name: "English" },
  { code: "es", short: "ES", name: "Español" },
];

/** BCP-47 tags, for `<html lang>`, speech synthesis and date formatting. */
export const LOCALE: Record<Lang, string> = { en: "en-GB", es: "es-ES" };

const S = {
  /* ---------- shell ---------- */
  "nav.work": { en: "Work", es: "Trabajo" },
  "nav.profile": { en: "How I work", es: "Cómo trabajo" },
  "nav.privacy": { en: "My data", es: "Mis datos" },
  "nav.aria": { en: "Main", es: "Principal" },
  "shell.skip": { en: "Skip to the work", es: "Saltar al trabajo" },
  "shell.offline": { en: "offline engine", es: "motor sin conexión" },
  "shell.offlineTitle": {
    en: "No API key set. Everything still works.",
    es: "Sin clave de API. Todo sigue funcionando.",
  },
  "shell.promise": {
    en: "No camera. No microphone unless you press it. No teacher dashboard.",
    es: "Sin cámara. Sin micrófono salvo que lo pulses. Sin panel para el profesorado.",
  },
  "shell.hosted": {
    en: "This copy stores your work on a server —",
    es: "Esta copia guarda tu trabajo en un servidor —",
  },
  "shell.hostedLink": { en: "what that means", es: "qué significa eso" },
  "shell.local": {
    en: "Nothing leaves this device unless you export it.",
    es: "Nada sale de este dispositivo salvo que lo exportes.",
  },

  /* ---------- language toggle ---------- */
  "lang.aria": { en: "Choose a language", es: "Elegir idioma" },

  /* ---------- reading controls ---------- */
  "a11y.button": { en: "Reading", es: "Lectura" },
  "a11y.surface": { en: "Surface", es: "Fondo" },
  "a11y.theme.calm": { en: "Calm", es: "Suave" },
  "a11y.theme.dark": { en: "Dark", es: "Oscuro" },
  "a11y.theme.contrast": { en: "High contrast", es: "Alto contraste" },
  "a11y.overlay": { en: "Overlay", es: "Filtro de color" },
  "a11y.tint.none": { en: "None", es: "Ninguno" },
  "a11y.tint.amber": { en: "Amber", es: "Ámbar" },
  "a11y.tint.rose": { en: "Rose", es: "Rosa" },
  "a11y.tint.mint": { en: "Mint", es: "Menta" },
  "a11y.tint.slate": { en: "Slate", es: "Azul gris" },
  "a11y.lineSpacing": { en: "Line spacing · {v}", es: "Interlineado · {v}" },
  "a11y.letterSpacing": { en: "Letter spacing · {v}em", es: "Espacio entre letras · {v}em" },
  "a11y.showSteps": { en: "Show how many steps are left", es: "Mostrar cuántos pasos quedan" },
  "a11y.showStepsNote": {
    en: "Off by default. Two testers said seeing the total made them stop before starting.",
    es: "Desactivado por defecto. Dos personas de prueba dijeron que ver el total les hacía parar antes de empezar.",
  },
  "a11y.guide": { en: "Show the guide", es: "Mostrar la guía" },
  "a11y.guideNote": {
    en: "The owl on the right. It never speaks first — it waits to be opened.",
    es: "El búho de la derecha. Nunca habla primero: espera a que lo abras.",
  },
  "a11y.backdrop": { en: "Moving background", es: "Fondo en movimiento" },
  "a11y.backdropNote": {
    en: "It stays behind the cards, never under text. If your system asks for reduced motion it holds still on its own.",
    es: "Se queda detrás de las tarjetas, nunca bajo el texto. Si tu sistema pide menos movimiento, se queda quieto solo.",
  },

  /* ---------- companion ---------- */
  "owl.role": {
    en: "Guide to this app — not to your homework",
    es: "Guía de esta app, no de tus deberes",
  },
  "owl.dialog": { en: "Guide", es: "Guía" },
  "owl.close": { en: "close", es: "cerrar" },
  "owl.closeAria": { en: "Close the guide", es: "Cerrar la guía" },
  "owl.openAria": { en: "Open the guide", es: "Abrir la guía" },
  "owl.askTitle": { en: "Ask the guide", es: "Preguntar a la guía" },
  "owl.another": { en: "another one", es: "otra" },
  "owl.orPick": { en: "Or pick one", es: "O elige una" },
  "owl.inputLabel": { en: "Ask the guide", es: "Pregunta a la guía" },
  "owl.placeholder": { en: "Ask how something works", es: "Pregunta cómo funciona algo" },
  "owl.send": { en: "Ask", es: "Enviar" },
  "owl.thinking": { en: "thinking", es: "pensando" },
  "owl.turnOff": {
    en: "Turn the guide off — you can bring it back under Reading",
    es: "Apagar la guía: puedes recuperarla en Lectura",
  },
  "owl.unreachable": {
    en: "I could not reach the guide just now. If the rest of the app is also not responding, the local server is probably down — from the project folder, run npm run dev.",
    es: "No he podido llegar a la guía ahora mismo. Si el resto de la app tampoco responde, seguramente el servidor local esté caído: desde la carpeta del proyecto, ejecuta npm run dev.",
  },
  // The hosted copy's version of the same failure. Telling somebody on a
  // phone to run npm is advice aimed at a machine they are not sitting at.
  "owl.unreachableHosted": {
    en: "I could not reach the guide just now. That is on the site, not on you — nothing you finished is lost. Try again in a moment, and if the whole app is quiet, a hard refresh usually brings it back.",
    es: "No he podido llegar a la guía ahora mismo. Es cosa del sitio, no tuya: no se ha perdido nada de lo que terminaste. Inténtalo en un momento, y si toda la app está callada, una recarga forzada suele traerla de vuelta.",
  },

  /* ---------- the companion's own lines ---------- */
  "phrase.1": {
    en: "You do not have to feel ready. You only have to start the one step in front of you.",
    es: "No hace falta que te sientas preparado. Solo tienes que empezar el paso que tienes delante.",
  },
  "phrase.2": {
    en: "Starting badly still counts as starting.",
    es: "Empezar mal sigue contando como empezar.",
  },
  "phrase.3": {
    en: "The hard part was never the work. It is the beginning, and you are already past it.",
    es: "La parte difícil nunca fue el trabajo. Es el principio, y ya lo has pasado.",
  },
  "phrase.4": {
    en: "Nobody does this in one clean run. Not one person.",
    es: "Nadie hace esto de una sola vez y limpio. Ni una sola persona.",
  },
  "phrase.5": {
    en: "You are allowed to make it smaller. That is not giving up, that is aim.",
    es: "Tienes permiso para hacerlo más pequeño. Eso no es rendirse, es apuntar.",
  },
  "phrase.6": {
    en: "A page you hate is worth more than a page you have not written.",
    es: "Una página que odias vale más que una página que no has escrito.",
  },
  "phrase.7": { en: "Slow is a pace, not a verdict.", es: "Lento es un ritmo, no un veredicto." },
  "phrase.8": {
    en: "You have finished things before. This is one of those.",
    es: "Has terminado cosas antes. Esta es una de ellas.",
  },
  "phrase.9": {
    en: "If it feels heavy, that is because it matters to you.",
    es: "Si pesa, es porque te importa.",
  },
  "phrase.10": {
    en: "Take the break. The work will still be here, and so will you.",
    es: "Tómate el descanso. El trabajo seguirá aquí, y tú también.",
  },
  "phrase.11": {
    en: "You are not behind. You are somewhere in the middle, like everyone.",
    es: "No vas atrasado. Vas por la mitad, como todo el mundo.",
  },
  "phrase.12": {
    en: "One step, then look up. That is the entire method.",
    es: "Un paso, y luego levanta la vista. Ese es todo el método.",
  },
  "phrase.13": {
    en: "Confusion is what understanding feels like on the way in.",
    es: "La confusión es lo que se siente al entrar en el entendimiento.",
  },
  "phrase.14": {
    en: "You do not owe anyone a perfect version today.",
    es: "Hoy no le debes a nadie una versión perfecta.",
  },
  "phrase.15": {
    en: "Come back to it. Coming back is the skill.",
    es: "Vuelve a ello. Volver es la habilidad.",
  },

  "starter.1": { en: "How do I start a task?", es: "¿Cómo empiezo una tarea?" },
  "starter.2": { en: "Why is only one step showing?", es: "¿Por qué solo veo un paso?" },
  "starter.3": {
    en: "What does the panel that interrupted me do?",
    es: "¿Qué hace el panel que me ha interrumpido?",
  },
  "starter.4": { en: "How do I give this to my teacher?", es: "¿Cómo le doy esto a mi profesor?" },
  "starter.5": { en: "What do you store about me?", es: "¿Qué guardas sobre mí?" },
  "starter.6": { en: "Something is not loading", es: "Algo no carga" },

  /* ---------- guest strip ---------- */
  "guest.copied": {
    en: "Copied. Paste that anywhere you can find it again — it is the only way back to this work.",
    es: "Copiado. Pégalo donde puedas volver a encontrarlo: es la única forma de volver a este trabajo.",
  },
  "guest.only": {
    en: "You went straight in, so this account only exists in this browser.",
    es: "Entraste directamente, así que esta cuenta solo existe en este navegador.",
  },
  "guest.copyId": { en: "Copy my account id", es: "Copiar el id de mi cuenta" },
  "guest.whatStores": { en: "What this stores", es: "Qué guarda esto" },
  "guest.dismiss": { en: "dismiss", es: "descartar" },
  "guest.dismissAria": { en: "Dismiss", es: "Descartar" },
  // Not "Invitado" or "Invitada". Spanish has no neutral form of that noun, and
  // a product whose whole argument is that it assumes nothing about the student
  // should not gender them in the one field it fills in for them. "Yo" is what
  // the setup screen already defaults to.
  "guest.defaultAlias": { en: "Guest", es: "Yo" },
  "setup.defaultAlias": { en: "Me", es: "Yo" },

  /* ---------- the contract ---------- */
  "contract.aria": {
    en: "What this assignment is asking",
    es: "Qué está pidiendo esta tarea",
  },
  "contract.stopWhen": { en: "You can stop when", es: "Puedes parar cuando" },
  "contract.reallyAsking": { en: "What it is really asking", es: "Qué te está pidiendo de verdad" },
  "contract.wordMeans": { en: "The word in the question means:", es: "La palabra del enunciado significa:" },
  "contract.mustExist": { en: "What has to exist", es: "Qué tiene que existir" },
  "contract.traps": {
    en: "Not written down anywhere, but expected",
    es: "No está escrito en ningún sitio, pero se espera",
  },

  /* ---------- the wait ---------- */
  "decomp.legend": { en: "Working", es: "Trabajando" },
  "decomp.1": {
    en: "Reading it the way it was given to you",
    es: "Leyéndolo tal como te lo dieron",
  },
  "decomp.2": {
    en: "Finding what the question actually asks you to produce",
    es: "Buscando qué te pide producir el enunciado en realidad",
  },
  "decomp.3": {
    en: "Working out how you would know you were finished",
    es: "Averiguando cómo sabrías que has terminado",
  },
  "decomp.4": { en: "Cutting it into steps", es: "Cortándolo en pasos" },
  "decomp.5": {
    en: "Checking the first step needs no decision from you",
    es: "Comprobando que el primer paso no te exige decidir nada",
  },
  "decomp.note": {
    en: "No time estimate here on purpose. We do not know how long this takes, and a bar that stops at nearly-full is worse than no bar.",
    es: "Aquí no hay estimación de tiempo, a propósito. No sabemos cuánto tarda esto, y una barra que se queda casi llena es peor que ninguna barra.",
  },

  /* ---------- formats ---------- */
  "fmt.title": { en: "Same words, different shape", es: "Las mismas palabras, otra forma" },
  "fmt.skeleton": { en: "Skeleton", es: "Esqueleto" },
  "fmt.skeleton.blurb": { en: "Structure only", es: "Solo la estructura" },
  "fmt.dialogue": { en: "Dialogue", es: "Diálogo" },
  "fmt.dialogue.blurb": { en: "Two people working it out", es: "Dos personas resolviéndolo" },
  "fmt.map": { en: "Map", es: "Mapa" },
  "fmt.map.blurb": { en: "Where things sit", es: "Dónde está cada cosa" },
  "fmt.comic": { en: "Panels", es: "Viñetas" },
  "fmt.comic.blurb": { en: "Six pictures", es: "Seis dibujos" },
  "fmt.audio": { en: "Read aloud", es: "En voz alta" },
  "fmt.audio.blurb": { en: "Written for the ear", es: "Escrito para el oído" },
  "fmt.fastestTitle": { en: "You read fastest in this one", es: "Es la forma en la que lees más rápido" },
  "fmt.fastestSr": { en: "your fastest format", es: "tu formato más rápido" },
  "fmt.dotNote": {
    en: "The dot marks the format you read fastest, measured from your own sessions.",
    es: "El punto marca el formato en el que lees más rápido, medido en tus propias sesiones.",
  },

  /* ---------- friction sheet ---------- */
  "sheet.aria": { en: "Options", es: "Opciones" },
  "sheet.legend": { en: "Noticed", es: "Detectado" },
  "sheet.scoreTitle": { en: "Score against your own threshold", es: "Puntuación frente a tu propio umbral" },
  "sheet.line": {
    en: "This one has been open a while — {reading}. Anything here help?",
    es: "Esto lleva un rato abierto: {reading}. ¿Te sirve algo de aquí?",
  },
  "sheet.dismiss": {
    en: "No, I am fine — ask me less often",
    es: "No, estoy bien: pregúntame menos",
  },

  /* what the five friction signals are called, translated by key rather than
     by the sentence the server sent, so the reason is in the reader's language */
  "sig.dwell": { en: "stuck on one place", es: "atascado en un mismo sitio" },
  "sig.deleteBurst": { en: "writing and unwriting", es: "escribiendo y borrando" },
  "sig.idle": { en: "nothing moving", es: "nada se mueve" },
  "sig.tabAway": { en: "gone elsewhere", es: "en otra parte" },
  "sig.reread": { en: "going back over it", es: "releyendo lo mismo" },

  /* the six things a student can ask for when stuck, translated by key so a
     rule chosen in one language still reads in the other */
  "iv.shrink": { en: "Make this step smaller", es: "Haz este paso más pequeño" },
  "iv.readAloud": { en: "Read it to me", es: "Léemelo" },
  "iv.speakInstead": {
    en: "Let me say it instead of typing",
    es: "Déjame decirlo en vez de escribirlo",
  },
  "iv.pause": { en: "Two minutes away from this", es: "Dos minutos lejos de esto" },
  "iv.reframe": { en: "Show it a different way", es: "Muéstramelo de otra forma" },
  "iv.skip": { en: "Park this and come back", es: "Aparca esto y vuelve luego" },

  /* ---------- reader ---------- */
  "reader.read": { en: "Read it to me", es: "Léemelo" },
  "reader.stop": { en: "Stop reading", es: "Deja de leer" },

  /* ---------- the lit step ---------- */
  "lantern.aria": { en: "The step you are on", es: "El paso en el que estás" },
  "lantern.emptyLegend": { en: "Nothing left on the list", es: "No queda nada en la lista" },
  "lantern.emptyTitle": { en: "That is everything on the list.", es: "Eso es todo lo que había en la lista." },
  "lantern.emptyBody": {
    en: "Read it once from the top. If it matches the line above, you are finished.",
    es: "Léelo una vez desde arriba. Si coincide con la línea de arriba, has terminado.",
  },
  "lantern.doOnly": { en: "Do only this", es: "Haz solo esto" },
  "lantern.about": { en: "about {n} min", es: "unos {n} min" },
  "lantern.done": { en: "Done — next", es: "Hecho, siguiente" },
  "lantern.tooBig": { en: "Too big", es: "Muy grande" },
  "lantern.park": { en: "Park it", es: "Apárcalo" },
  "lantern.showAhead": { en: "Show what is coming", es: "Ver lo que viene" },
  "lantern.hideAhead": { en: "Hide what is coming", es: "Ocultar lo que viene" },
  "lantern.marksOf": { en: "{done} of {total} steps behind you", es: "{done} de {total} pasos ya hechos" },
  "lantern.marks": { en: "{done} steps behind you", es: "{done} pasos ya hechos" },

  /* ---------- intake ---------- */
  "intake.legend": { en: "The assignment", es: "La tarea" },
  "intake.drop": { en: "Drop it here", es: "Suéltalo aquí" },
  "intake.label": { en: "Paste the assignment", es: "Pega la tarea" },
  "intake.placeholder": {
    en: "Paste the assignment exactly as your teacher wrote it. Do not tidy it up — the messy wording is the part this is for.",
    es: "Pega la tarea exactamente como la escribió tu profesor. No la ordenes: el enunciado enrevesado es justo para lo que sirve esto.",
  },
  "intake.sayIt": { en: "Say it instead", es: "Dilo en voz alta" },
  "intake.stopTalking": { en: "Stop talking", es: "Deja de hablar" },
  // Names PDF explicitly. A student holding one will not try a button that
  // only promises text files.
  "intake.openFile": { en: "Open a PDF or text file", es: "Abrir un PDF o archivo de texto" },
  "intake.word": { en: "word", es: "palabra" },
  "intake.words": { en: "words", es: "palabras" },
  "intake.listening": {
    en: "Listening. It writes as you finish each sentence.",
    es: "Escuchando. Escribe cada vez que terminas una frase.",
  },
  "intake.submit": { en: "Work out what this asks", es: "Averiguar qué pide esto" },
  "intake.needMore": {
    en: "A little more of it, and this turns on.",
    es: "Un poco más y esto se enciende.",
  },
  "intake.tooLarge": {
    en: "That file is larger than this reads. Paste the part you need instead.",
    es: "Ese archivo es más grande de lo que esto lee. Pega solo la parte que necesitas.",
  },
  "intake.noDictation": {
    en: "This browser has no dictation. Chrome and Edge do.",
    es: "Este navegador no tiene dictado. Chrome y Edge sí.",
  },
  "intake.readingPdf": {
    en: "Reading the PDF. This happens on your device — the file itself is not sent anywhere.",
    es: "Leyendo el PDF. Esto pasa en tu dispositivo: el archivo en sí no se envía a ningún sitio.",
  },
  "intake.pdfTooLarge": {
    en: "That PDF is very large. Open it and copy across the pages you actually need.",
    es: "Ese PDF es muy grande. Ábrelo y copia solo las páginas que necesitas de verdad.",
  },
  "intake.pdfLocked": {
    en: "That PDF is password protected, so it cannot be opened here. Open it yourself and paste the text across.",
    es: "Ese PDF está protegido con contraseña, así que no se puede abrir aquí. Ábrelo tú y pega el texto.",
  },
  "intake.pdfScanned": {
    en: "That PDF is a picture of a page rather than text, so there is nothing to read out of it. If you can select the words in a PDF reader, copy them across. If not, the dictation button is faster than typing.",
    es: "Ese PDF es una foto de una página, no texto, así que no hay nada que leer dentro. Si puedes seleccionar las palabras en un lector de PDF, cópialas aquí. Si no, el botón de dictado es más rápido que escribir.",
  },
  "intake.pdfBroken": {
    en: "That PDF could not be opened. Paste the text in instead and it will work the same.",
    es: "No se ha podido abrir ese PDF. Pega el texto y funcionará igual.",
  },

  /* ---------- workspace ---------- */
  "work.nothingOpen": { en: "Nothing open", es: "Nada abierto" },
  "work.whatDoing": {
    en: "What are you supposed to be doing?",
    es: "¿Qué se supone que tienes que hacer?",
  },
  "work.pasteBlurb": {
    en: "Paste it in as it was given to you. The first thing back will be one action small enough to do without deciding anything.",
    es: "Pégalo tal como te lo dieron. Lo primero que recibirás será una acción lo bastante pequeña como para hacerla sin decidir nada.",
  },
  "work.task": { en: "Task", es: "Tarea" },
  "work.totalMinutes": { en: "about {n} min in total", es: "unos {n} min en total" },
  /* the worked solution, opened deliberately */
  "solution.open": { en: "Check my result", es: "Comprobar mi resultado" },
  "solution.close": { en: "Put the solution away", es: "Guardar la solución" },
  "solution.legend": { en: "The solution", es: "La solución" },
  "solution.working": { en: "Working it out", es: "Resolviéndolo" },
  "solution.note": {
    en: "Try the steps first. Comparing a finished attempt against this is worth something; reading it instead of attempting is not.",
    es: "Prueba antes con los pasos. Comparar un intento terminado con esto vale algo; leerlo en vez de intentarlo, no.",
  },
  "solution.methodNote": {
    en: "This assignment asks for your own work, so what follows is the same technique on a different example — not the thing you have to hand in.",
    es: "Esta tarea pide tu propio trabajo, así que lo de abajo es la misma técnica sobre otro ejemplo distinto, no lo que tienes que entregar.",
  },
  "solution.failed": {
    en: "The solution could not be worked out just now. The steps above are unaffected — try again in a moment.",
    es: "No se ha podido resolver ahora mismo. Los pasos de arriba no se ven afectados: inténtalo en un momento.",
  },

  "work.finished": { en: "I am finished with this", es: "He terminado con esto" },
  "work.putAway": { en: "Put it away without finishing", es: "Guardarlo sin terminar" },
  "work.eitherKeeps": {
    en: "Putting it away is not the same as failing it. Either button keeps what you did.",
    es: "Guardarlo no es lo mismo que suspenderlo. Cualquiera de los dos botones conserva lo que hiciste.",
  },
  "pause.legend": { en: "Away from it", es: "Lejos de esto" },
  "pause.left": { en: "{time} left.", es: "Quedan {time}." },
  "pause.body": {
    en: "Nothing is being measured while this is up. The step is where you left it.",
    es: "No se está midiendo nada mientras esto esté aquí. El paso sigue donde lo dejaste.",
  },
  "pause.back": { en: "Back to it now", es: "Volver ya" },

  /* ---------- profile ---------- */
  "profile.sessions": {
    en: "{n} sessions recorded · {f} finished",
    es: "{n} sesiones registradas · {f} terminadas",
  },
  "profile.title": { en: "How I work", es: "Cómo trabajo" },
  "profile.blurb": {
    en: "Everything on this page came from your own sessions. Nothing here was assumed about you before you started.",
    es: "Todo lo de esta página salió de tus propias sesiones. Aquí no se dio nada por supuesto sobre ti antes de que empezaras.",
  },
  "profile.whatShow": { en: "What the sessions show", es: "Lo que muestran las sesiones" },
  "profile.notEnough": {
    en: "Not enough yet. Finish two or three tasks and observations will appear here, each with the evidence attached.",
    es: "Todavía no hay suficiente. Termina dos o tres tareas y aquí aparecerán observaciones, cada una con su evidencia.",
  },
  "profile.notTrue": { en: "Not true", es: "No es verdad" },
  "profile.barNote": {
    en: "The bar is how confident the calculation is, not how true it is. If an observation is wrong, mark it. Dismissed observations are never generated again.",
    es: "La barra es lo segura que está la cuenta, no lo verdadera que es. Si una observación está mal, márcala. Las observaciones descartadas no se vuelven a generar.",
  },
  "profile.confidence": { en: "confidence {n} percent", es: "confianza del {n} por ciento" },
  "profile.instructions": {
    en: "The instructions the model gets",
    es: "Las instrucciones que recibe el modelo",
  },
  "profile.saved": { en: "saved", es: "guardado" },
  "profile.instructionsNote": {
    en: "These sentences are placed above everything we wrote, every time the model runs. This is the whole prompt as far as your preferences go — there is no second, hidden version.",
    es: "Estas frases se colocan por encima de todo lo que escribimos nosotros, cada vez que se ejecuta el modelo. Este es el prompt entero en lo que toca a tus preferencias: no hay una segunda versión oculta.",
  },
  "profile.remove": { en: "remove", es: "quitar" },
  "profile.addRule": { en: "Add a rule", es: "Añadir una regla" },
  "profile.add": { en: "Add", es: "Añadir" },
  "profile.measured": { en: "Measured", es: "Medido" },
  "profile.fromSession": { en: "from {n} session", es: "de {n} sesión" },
  "profile.fromSessions": { en: "from {n} sessions", es: "de {n} sesiones" },
  "profile.focusBlock": { en: "Focus block", es: "Bloque de concentración" },
  "profile.focusBlockNote": { en: "Before friction starts to rise", es: "Antes de que suba la fricción" },
  "profile.timeToStart": { en: "Time to start", es: "Tiempo hasta empezar" },
  "profile.timeToStartNote": {
    en: "From opening a task to first action",
    es: "Desde abrir la tarea hasta la primera acción",
  },
  "profile.readingRate": { en: "Reading rate", es: "Velocidad de lectura" },
  "profile.fastestIn": { en: "Fastest in {format} form", es: "Más rápido en forma de {format}" },
  "profile.medianAcross": { en: "Median across every format", es: "Mediana entre todos los formatos" },
  "profile.unit.min": { en: "min", es: "min" },
  "profile.unit.sec": { en: "s", es: "s" },
  "profile.unit.wpm": { en: "wpm", es: "ppm" },
  "profile.dashNote": {
    en: "A dash means there is not enough recorded to say yet. We would rather show nothing than show a default and call it a measurement.",
    es: "Un guion significa que aún no hay bastante registrado para decirlo. Preferimos no mostrar nada antes que mostrar un valor por defecto y llamarlo medición.",
  },
  "profile.giveTeacher": { en: "Give it to a teacher", es: "Dáselo a un profesor" },
  "profile.givePage": {
    en: "One page, in your words, with the evidence attached. This is the only way anything here leaves your account, and it only happens when you press this.",
    es: "Una página, con tus palabras, con la evidencia adjunta. Es la única forma de que algo de aquí salga de tu cuenta, y solo pasa cuando pulsas esto.",
  },
  "profile.forTeacher": { en: "For my teacher", es: "Para mi profesor" },
  "profile.forFamily": { en: "For my family", es: "Para mi familia" },
  "profile.forSelf": { en: "For myself", es: "Para mí" },
  "profile.copy": { en: "Copy", es: "Copiar" },
  "profile.print": { en: "Print", es: "Imprimir" },
  "profile.printNote": {
    en: "Printing gives you this page on its own — no menus, no colours, nothing but the document.",
    es: "Al imprimir sale solo esta página: sin menús, sin colores, nada más que el documento.",
  },

  /* ---------- privacy ---------- */
  "privacy.eyebrow": { en: "My data", es: "Mis datos" },
  "privacy.title": {
    en: "What this knows, and what it can never do.",
    es: "Qué sabe esto, y qué no podrá hacer nunca.",
  },
  "privacy.notCollected": { en: "What is not collected", es: "Qué no se recoge" },
  "privacy.no1": {
    en: "No camera. Focus is inferred from how you use the page, never from your face.",
    es: "Sin cámara. La concentración se deduce de cómo usas la página, nunca de tu cara.",
  },
  "privacy.no2": {
    en: "No microphone unless you press the dictation button, and the audio never leaves the device.",
    es: "Sin micrófono salvo que pulses el botón de dictado, y el audio nunca sale del dispositivo.",
  },
  "privacy.no3": {
    en: "No keystroke log. Friction is five numbers between 0 and 1, computed in your browser and thrown away after scoring.",
    es: "Sin registro de teclas. La fricción son cinco números entre 0 y 1, calculados en tu navegador y descartados tras puntuar.",
  },
  "privacy.no4": {
    en: "No teacher dashboard, no parent digest, no engagement score. There is no table in the database for a person who is not you.",
    es: "Sin panel para el profesorado, sin resumen para madres y padres, sin puntuación de participación. No hay ninguna tabla en la base de datos para una persona que no seas tú.",
  },
  "privacy.stored": { en: "What is stored", es: "Qué se guarda" },
  "privacy.storedBody": {
    en: "Your rules, your tasks, the steps you finished, and one row per friction moment holding a score and a signal name.",
    es: "Tus reglas, tus tareas, los pasos que terminaste y una fila por cada momento de fricción con una puntuación y el nombre de una señal.",
  },
  "privacy.hostedLegend": { en: "You are on the hosted copy", es: "Estás en la copia alojada" },
  "privacy.hostedBody": {
    en: "This one keeps your rows in a database on a server, not on your machine. Whoever operates this site can reach that database. Everything above about cameras, microphones and keystrokes still holds, and there is still no account for anyone but you — but “it never leaves your device” is not a claim this copy can make.",
    es: "Esta guarda tus filas en una base de datos en un servidor, no en tu máquina. Quien opere este sitio puede llegar a esa base de datos. Todo lo de arriba sobre cámaras, micrófonos y teclas sigue siendo cierto, y sigue sin haber cuenta para nadie más que tú, pero “nunca sale de tu dispositivo” no es algo que esta copia pueda afirmar.",
  },
  "privacy.hostedRun": {
    en: "If you want the version where the data is a file you own, run it yourself. It takes two commands and needs no key:",
    es: "Si quieres la versión en la que los datos son un archivo tuyo, ejecútala tú. Son dos comandos y no hace falta ninguna clave:",
  },
  "privacy.localBody": {
    en: "It sits in a SQLite file on the machine running this app, and you are running it locally, so that machine is yours.",
    es: "Está en un archivo SQLite en la máquina que ejecuta esta app, y la estás ejecutando en local, así que esa máquina es tuya.",
  },
  "privacy.accountId": { en: "Your account id", es: "El id de tu cuenta" },
  "privacy.copy": { en: "Copy", es: "Copiar" },
  "privacy.copied": { en: "Copied", es: "Copiado" },
  // Rewritten when the hosted copy appeared: "there is no server holding
  // accounts" stopped being true there, and the useful fact was never the
  // architecture anyway — it is that the id is the whole key.
  "privacy.keepThis": {
    en: "Keep this to open the same account on another browser or phone. There is no password — the id is the whole key, so keep it somewhere you can find and nobody else can.",
    es: "Guárdalo para abrir la misma cuenta en otro navegador o en el móvil. No hay contraseña: el id es la llave entera, así que guárdalo donde tú lo encuentres y nadie más pueda.",
  },
  "privacy.erase": { en: "Erase everything", es: "Borrarlo todo" },
  "privacy.eraseBody": {
    en: "Deletes your rules, tasks, sessions, friction rows and observations. It is immediate and there is no archived copy.",
    es: "Borra tus reglas, tareas, sesiones, filas de fricción y observaciones. Es inmediato y no hay copia archivada.",
  },
  "privacy.eraseYes": { en: "Yes, erase all of it", es: "Sí, bórralo todo" },
  "privacy.eraseNo": { en: "Keep it", es: "Consérvalo" },
  "privacy.signOut": { en: "Just sign out on this browser", es: "Solo cerrar sesión en este navegador" },

  /* ---------- onboarding ---------- */
  "setup.eyebrow": { en: "Setting up", es: "Configurando" },
  "setup.title": {
    en: "Before anything else, tell the tool how to talk to you.",
    es: "Antes que nada, dile a la herramienta cómo hablarte.",
  },
  "setup.blurb": {
    en: "What you choose here is not a preferences panel. These sentences are handed to the model as its instructions, ahead of everything we wrote. You can read them and change them at any time.",
    es: "Lo que elijas aquí no es un panel de preferencias. Estas frases se le entregan al modelo como instrucciones, por delante de todo lo que escribimos nosotros. Puedes leerlas y cambiarlas cuando quieras.",
  },
  "setup.q1": { en: "What should this call you?", es: "¿Cómo quieres que te llame?" },
  "setup.namePlaceholder": {
    en: "Any name. It never leaves this device.",
    es: "Cualquier nombre. Nunca sale de este dispositivo.",
  },
  "setup.band.elementary": { en: "Primary", es: "Primaria" },
  "setup.band.middle": { en: "Middle", es: "Secundaria" },
  "setup.band.high": { en: "High school", es: "Bachillerato" },
  "setup.q2": { en: "Your rules for the model", es: "Tus reglas para el modelo" },
  "setup.ownRule": { en: "Write your own rule", es: "Escribe tu propia regla" },
  "setup.add": { en: "Add", es: "Añadir" },
  "setup.willBeTold": { en: "What the model will be told", es: "Lo que se le dirá al modelo" },
  "setup.ofYours": { en: "{n} of yours", es: "{n} tuyas" },
  "setup.noRules": {
    en: "Nothing yet. With no rules it keeps everything short and literal.",
    es: "Nada todavía. Sin reglas lo mantiene todo corto y literal.",
  },
  "setup.remove": { en: "remove", es: "quitar" },
  "setup.yoursWins": {
    en: "These sit above our instructions on every call. Where they disagree, yours wins.",
    es: "Estas van por encima de nuestras instrucciones en cada llamada. Donde no coincidan, gana la tuya.",
  },
  "setup.q3": {
    en: "When you get stuck, what should appear?",
    es: "Cuando te atasques, ¿qué debería aparecer?",
  },
  "setup.q3blurb": {
    en: "Choose now, while nothing is wrong. Deciding what helps is much harder in the moment.",
    es: "Elige ahora, mientras no pasa nada. Decidir qué ayuda es mucho más difícil en el momento.",
  },
  "setup.q4": { en: "Where do you want things to start?", es: "¿En qué forma quieres que empiece todo?" },
  "setup.fmt.skeleton": { en: "A bare outline", es: "Un esquema desnudo" },
  "setup.fmt.dialogue": {
    en: "Two people talking it through",
    es: "Dos personas hablándolo",
  },
  "setup.fmt.map": { en: "A map of where things sit", es: "Un mapa de dónde está cada cosa" },
  "setup.fmt.comic": { en: "Six panels", es: "Seis viñetas" },
  "setup.fmt.audio": { en: "Something to listen to", es: "Algo para escuchar" },
  "setup.fmtNote": {
    en: "You can change this on any task, as many times as you want. Nothing is dropped between shapes — if an idea is hard it stays hard, it just changes form.",
    es: "Puedes cambiarlo en cualquier tarea, todas las veces que quieras. No se pierde nada al cambiar de forma: si una idea es difícil, sigue siéndolo, solo cambia de forma.",
  },
  "setup.q5": {
    en: "Anything you want it to know about you?",
    es: "¿Algo que quieras que sepa sobre ti?",
  },
  "setup.q5placeholder": {
    en: "Optional. Free text. Nothing here is a diagnosis field.",
    es: "Opcional. Texto libre. Esto no es una casilla de diagnóstico.",
  },
  "setup.q5note": {
    en: "You can leave this empty and nothing about the tool changes. It is here because some people want to say it, not because we need it.",
    es: "Puedes dejarlo vacío y no cambia nada de la herramienta. Está aquí porque hay quien quiere decirlo, no porque nos haga falta.",
  },
  "setup.start": { en: "Start", es: "Empezar" },
  "setup.starting": { en: "Setting up…", es: "Configurando…" },
  "setup.haveId": { en: "I already have an account id", es: "Ya tengo un id de cuenta" },
  "setup.pasteId": { en: "Paste the id", es: "Pega el id" },
  "setup.open": { en: "Open", es: "Abrir" },

  /* the seven suggested rules — these become the student's own text once
     chosen, so they are written in whichever language they were picked in */
  "rule.1": {
    en: "Never tell me how many steps are left.",
    es: "No me digas nunca cuántos pasos quedan.",
  },
  "rule.2": {
    en: "Do not encourage me. Just tell me the next thing.",
    es: "No me animes. Solo dime lo siguiente.",
  },
  "rule.3": {
    en: "Short sentences. I lose long ones halfway through.",
    es: "Frases cortas. Las largas las pierdo por la mitad.",
  },
  "rule.4": {
    en: "Give me one thing at a time, even if it is slower.",
    es: "Dame una cosa cada vez, aunque sea más lento.",
  },
  "rule.5": {
    en: "If I ask what finished looks like, answer literally.",
    es: "Si pregunto cómo es estar terminado, contéstame literalmente.",
  },
  "rule.6": { en: "No metaphors. Say the actual thing.", es: "Sin metáforas. Di la cosa en sí." },
  "rule.7": {
    en: "Do not tell me something is easy.",
    es: "No me digas que algo es fácil.",
  },

  /* ---------- accounts ---------- */
  "auth.tagline": { en: "One step, lit", es: "Un paso, encendido" },
  "auth.signin.eyebrow": { en: "Welcome back", es: "Bienvenido de nuevo" },
  "auth.signin.title": { en: "Pick up where you left off.", es: "Sigue donde lo dejaste." },
  "auth.signin.blurb": {
    en: "Your rules, your tasks and everything the sessions have shown are waiting.",
    es: "Tus reglas, tus tareas y todo lo que han mostrado las sesiones te están esperando.",
  },
  "auth.signin.submit": { en: "Open my account", es: "Abrir mi cuenta" },
  "auth.register.eyebrow": { en: "New here", es: "Nuevo por aquí" },
  "auth.register.title": { en: "Set up an account.", es: "Crea una cuenta." },
  "auth.register.blurb": {
    en: "One name, one address, one password. Nothing else is asked for, and nothing else is stored.",
    es: "Un nombre, una dirección, una contraseña. No se pide nada más, y no se guarda nada más.",
  },
  "auth.register.submit": { en: "Create it", es: "Crearla" },
  "auth.forgot.eyebrow": { en: "Locked out", es: "Sin acceso" },
  "auth.forgot.title": { en: "Send me a way back in.", es: "Mándame una forma de volver a entrar." },
  "auth.forgot.blurb": {
    en: "Put in the address you used. If there is an account on it, a link goes out that works once.",
    es: "Pon la dirección que usaste. Si hay una cuenta con ella, sale un enlace que funciona una sola vez.",
  },
  "auth.forgot.submit": { en: "Send the link", es: "Enviar el enlace" },
  "auth.reset.eyebrow": { en: "Almost there", es: "Casi está" },
  "auth.reset.title": { en: "Choose a new password.", es: "Elige una contraseña nueva." },
  "auth.reset.blurb": {
    en: "This link stops working the moment you use it.",
    es: "Este enlace deja de funcionar en cuanto lo uses.",
  },
  "auth.reset.submit": { en: "Save it and sign in", es: "Guardarla y entrar" },
  "auth.title.signin": { en: "Sign in", es: "Entrar" },
  "auth.title.register": { en: "Set up an account", es: "Crear una cuenta" },
  "auth.title.forgot": { en: "Get back in", es: "Recuperar el acceso" },
  "auth.title.reset": { en: "New password", es: "Contraseña nueva" },
  "auth.field.alias": { en: "What should this call you?", es: "¿Cómo quieres que te llame?" },
  "auth.field.aliasHint": {
    en: "Any name. It is only ever shown to you.",
    es: "Cualquier nombre. Solo se te muestra a ti.",
  },
  "auth.field.email": { en: "Email", es: "Correo" },
  "auth.field.password": { en: "Password", es: "Contraseña" },
  "auth.field.newPassword": { en: "New password", es: "Contraseña nueva" },
  "auth.field.confirm": { en: "Type it once more", es: "Escríbela otra vez" },
  "auth.show": { en: "show", es: "mostrar" },
  "auth.hide": { en: "hide", es: "ocultar" },
  "auth.working": { en: "Working…", es: "Trabajando…" },
  "auth.haveAccount": { en: "I already have an account", es: "Ya tengo una cuenta" },
  "auth.setOneUp": { en: "Set one up", es: "Crear una" },
  "auth.forgotLink": { en: "I forgot my password", es: "He olvidado mi contraseña" },
  "auth.guestButton": { en: "Go straight in, no account", es: "Entrar directamente, sin cuenta" },
  "auth.guestBlurb": {
    en: "Everything works: tasks, formats, the profile, the page for your teacher. It lives in this browser, and you can pick up an account later without losing it.",
    es: "Funciona todo: tareas, formatos, el perfil, la página para tu profesor. Vive en este navegador, y puedes crear una cuenta más adelante sin perderlo.",
  },
  "auth.setupFirst": { en: "Or answer the setup questions first", es: "O responde antes las preguntas de configuración" },
  "auth.stubNote": {
    en: "These screens are not connected to a database yet. Nothing you type here is saved anywhere — not the address, and not the password. Use the guest button to reach the working app.",
    es: "Estas pantallas todavía no están conectadas a una base de datos. Nada de lo que escribas aquí se guarda en ningún sitio: ni la dirección ni la contraseña. Usa el botón de invitado para llegar a la app que sí funciona.",
  },
  "auth.guest.legend": { en: "Almost in", es: "Casi dentro" },
  "auth.guest.title": { en: "What should this call you?", es: "¿Cómo quieres que te llame?" },
  "auth.guest.blurb": {
    en: "Optional. It is only ever shown to you, and you can change it later.",
    es: "Opcional. Solo se te muestra a ti, y puedes cambiarlo luego.",
  },
  "auth.guest.placeholder": {
    en: "Leave it empty if you would rather not",
    es: "Déjalo vacío si prefieres no ponerlo",
  },
  "auth.guest.enterAs": { en: "Go in as {name}", es: "Entrar como {name}" },
  "auth.guest.enterPlain": { en: "Go in without a name", es: "Entrar sin nombre" },
  "auth.guest.opening": { en: "Opening…", es: "Abriendo…" },
  "auth.guest.back": { en: "Back", es: "Atrás" },
  "auth.done.sent.legend": { en: "Sent", es: "Enviado" },
  "auth.done.sent.title": { en: "Check your email.", es: "Mira tu correo." },
  "auth.done.sent.body": {
    en: "If there is an account on {email}, a link is on its way. It works once and then stops. We do not say whether the address is registered — that would tell anyone who asked.",
    es: "Si hay una cuenta en {email}, ya va un enlace de camino. Funciona una vez y deja de valer. No decimos si la dirección está registrada: eso se lo diría a cualquiera que preguntase.",
  },
  "auth.done.sent.thatAddress": { en: "that address", es: "esa dirección" },
  "auth.done.in.legend": { en: "Ready", es: "Listo" },
  "auth.done.in.title": { en: "That is the account part done.", es: "La parte de la cuenta ya está." },
  "auth.done.in.body": {
    en: "The account layer is not wired to a server yet, so nothing was saved. The app itself works — carry on and set up how it should talk to you.",
    es: "La capa de cuentas todavía no está conectada a un servidor, así que no se guardó nada. La app en sí funciona: sigue y configura cómo debe hablarte.",
  },
  "auth.done.in.action": { en: "Set up how it talks to me", es: "Configurar cómo me habla" },
  "auth.done.reset.legend": { en: "Changed", es: "Cambiada" },
  "auth.done.reset.title": { en: "Your password is set.", es: "Tu contraseña está puesta." },
  "auth.done.reset.body": {
    en: "The link you used has stopped working. Sign in with the new one.",
    es: "El enlace que usaste ya no funciona. Entra con la nueva.",
  },
  "auth.backToSignIn": { en: "Back to sign in", es: "Volver a entrar" },

  /* validation, from lib/auth.ts — those functions return one of these keys
     rather than a sentence, so the same check reads in either language */
  "auth.err.emailEmpty": {
    en: "An address is needed to get back in.",
    es: "Hace falta una dirección para poder volver a entrar.",
  },
  "auth.err.emailShape": {
    en: "That does not look like an address.",
    es: "Eso no parece una dirección.",
  },
  "auth.err.passwordEmpty": { en: "A password is needed.", es: "Hace falta una contraseña." },
  "auth.err.passwordShort": { en: "At least {n} characters.", es: "Al menos {n} caracteres." },
  "auth.err.passwordCommon": {
    en: "That one is guessed early. Try something else.",
    es: "Esa se adivina pronto. Prueba con otra.",
  },
  "auth.err.aliasEmpty": {
    en: "Any name will do. It is only shown to you.",
    es: "Vale cualquier nombre. Solo se te muestra a ti.",
  },
  "auth.err.aliasLong": { en: "A little shorter.", es: "Un poco más corto." },
  "auth.err.mismatch": { en: "These two do not match.", es: "Estas dos no coinciden." },
  "auth.err.noToken": {
    en: "That link is missing its token.",
    es: "A ese enlace le falta su token.",
  },
  "auth.err.generic": { en: "That did not go through.", es: "Eso no salió adelante." },
  "auth.strength.0": { en: "Guessed at once", es: "Se adivina al instante" },
  "auth.strength.1": { en: "Weak", es: "Débil" },
  "auth.strength.2": { en: "Passable", es: "Aceptable" },
  "auth.strength.3": { en: "Good", es: "Buena" },
  "auth.strength.4": { en: "Strong", es: "Fuerte" },
  "auth.strength.hint.fine": {
    en: "Length is what makes this hard to break, and you have it.",
    es: "La longitud es lo que hace que esto sea difícil de romper, y la tienes.",
  },
  "auth.strength.hint.more": {
    en: "{n} more characters.",
    es: "{n} caracteres más.",
  },
  "auth.strength.hint.oneMore": {
    en: "1 more character.",
    es: "1 carácter más.",
  },
  "auth.strength.hint.longer": {
    en: "Longer beats stranger. Three unrelated words is stronger than one word with symbols.",
    es: "Más larga gana a más rara. Tres palabras sin relación son más fuertes que una palabra con símbolos.",
  },

  /* ---------- crash screen ---------- */
  "crash.legend": { en: "Something broke", es: "Algo se rompió" },
  "crash.title": { en: "That was us, not you.", es: "Fuimos nosotros, no tú." },
  "crash.body": {
    en: "Part of the interface stopped working. Nothing you had already finished is lost — the steps you completed and everything the sessions recorded are saved, not held on this screen.",
    es: "Una parte de la interfaz dejó de funcionar. No se ha perdido nada de lo que ya habías terminado: los pasos que completaste y todo lo que registraron las sesiones están guardados, no colgando de esta pantalla.",
  },
  "crash.reload": { en: "Reload the page", es: "Recargar la página" },
  "crash.back": { en: "Back to my work", es: "Volver a mi trabajo" },
  "crash.details": { en: "What went wrong, technically", es: "Qué falló, técnicamente" },
  "crash.console": {
    en: "If this keeps happening, the full trace is in the browser console.",
    es: "Si esto sigue pasando, la traza completa está en la consola del navegador.",
  },

  /* ---------- misc ---------- */
  "app.opening": { en: "Opening", es: "Abriendo" },
  "app.tagline": { en: "Ritmo — one step, lit", es: "Ritmo — un paso, encendido" },
  "api.silent": { en: "The server did not answer.", es: "El servidor no respondió." },
  "guest.noDatabase": {
    en: "This hosted copy has no database attached yet, so it cannot open an account for you. Nothing you did is wrong. Run Ritmo on your own machine and everything works — clone the repository, then `npm run setup && npm run dev`. No key needed.",
    es: "Esta copia alojada todavía no tiene base de datos conectada, así que no puede abrirte una cuenta. No has hecho nada mal. Ejecuta Ritmo en tu propia máquina y funciona todo: clona el repositorio y luego `npm run setup && npm run dev`. No hace falta ninguna clave.",
  },
  "guest.noServer": {
    en: "The app could not reach its own server. If you are running this locally, check that npm run dev is still going.",
    es: "La app no pudo llegar a su propio servidor. Si lo estás ejecutando en local, comprueba que npm run dev sigue en marcha.",
  },
} as const;

export type Key = keyof typeof S;

export type Entry = { en: string; es: string };

/** The dictionary itself, for tooling that needs to walk every pair. */
export const STRINGS: Record<string, Entry> = S;

export function translate(
  lang: Lang,
  key: Key,
  vars?: Record<string, string | number>
): string {
  const entry = S[key];
  let out: string = entry ? entry[lang] : key;
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      out = out.split(`{${name}}`).join(String(value));
    }
  }
  return out;
}
