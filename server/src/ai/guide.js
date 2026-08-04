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
 *
 * Both languages are carried in one list rather than two files. A topic is a
 * single piece of knowledge about the product; splitting it in half is how one
 * side ends up describing a button the other side no longer has.
 */

import { DEFAULT_LANG } from "../lib/lang.js";

export const TOPICS = [
  {
    id: "what-is-this",
    keys: {
      en: ["what is ritmo", "what is this", "what does this do", "what are you", "who are you", "how does this work", "explain the app", "purpose", "help", "what can you do", "guide", "features", "ovi", "lost", "confused"],
      es: ["qué es ritmo", "qué es esto", "para qué sirve", "quién eres", "cómo funciona", "explica la app", "ayuda", "qué puedes hacer", "guía", "funciones", "ovi", "perdido", "perdida", "no entiendo", "confundido"],
    },
    answer: {
      en: "Ritmo takes an assignment and works out what it is actually asking for, then hands you one step small enough to start without deciding anything. Over time it builds a description of how you work that belongs to you, and that you can hand to a teacher.\n\nThe three places to look are Work, How I work, and My data.",
      es: "Ritmo coge una tarea y averigua qué está pidiendo en realidad, y luego te da un paso lo bastante pequeño como para empezar sin decidir nada. Con el tiempo construye una descripción de cómo trabajas que es tuya, y que puedes darle a un profesor.\n\nLos tres sitios donde mirar son Trabajo, Cómo trabajo y Mis datos.",
    },
  },
  {
    id: "start-task",
    keys: {
      en: ["start", "begin", "new task", "add task", "first task", "how do i start", "paste", "where do i put", "homework", "assignment", "upload", "enter my work", "submit"],
      es: ["empezar", "empiezo", "cómo empiezo", "nueva tarea", "añadir tarea", "primera tarea", "pegar", "dónde pongo", "deberes", "tarea", "subir", "enviar", "meter mi trabajo"],
    },
    answer: {
      en: "Go to Work and paste the assignment exactly as your teacher gave it to you. Do not tidy the wording up — the messy phrasing is the part this is built to decode.\n\nYou can also drop in a .txt or .md file, or press \"Say it instead\" and talk.",
      es: "Ve a Trabajo y pega la tarea exactamente como te la dio tu profesor. No ordenes el enunciado: el texto enrevesado es justo lo que esto está hecho para descifrar.\n\nTambién puedes soltar un archivo .txt o .md, o pulsar \"Dilo en voz alta\" y hablar.",
    },
  },
  {
    id: "definition-of-done",
    keys: {
      en: ["done", "definition of done", "when do i stop", "finished", "how do i know", "stop when", "you can stop when", "enough", "complete", "how much", "how long should it be"],
      es: ["terminado", "cuándo paro", "cuándo termino", "puedes parar cuando", "parar", "cómo sé", "suficiente", "cuánto tengo que escribir", "qué extensión", "cuándo está acabado"],
    },
    answer: {
      en: "The panel at the top labelled \"You can stop when\" is the definition of done. School assignments almost never say how you would know you had finished, so Ritmo makes that layer explicit and puts it first.\n\nIf what is on your page matches that sentence, you are finished. That is the whole test.",
      es: "El panel de arriba que dice \"Puedes parar cuando\" es la definición de terminado. Las tareas del colegio casi nunca dicen cómo sabrías que has acabado, así que Ritmo saca esa capa a la luz y la pone primero.\n\nSi lo que hay en tu página coincide con esa frase, has terminado. Esa es toda la prueba.",
    },
  },
  {
    id: "one-step",
    keys: {
      en: ["one step", "only one", "why one step", "next step", "other steps", "see all steps", "how many steps", "lantern", "do only this", "step", "rest of the steps", "all the steps", "hidden steps"],
      es: ["un paso", "solo un paso", "por qué un paso", "siguiente paso", "otros pasos", "ver todos los pasos", "cuántos pasos", "haz solo esto", "paso", "los demás pasos", "pasos escondidos"],
    },
    answer: {
      en: "Only one step is lit at a time, on purpose. Seeing twelve steps at once is not extra information, it is an avalanche — and starting is a decision problem, so the first step is guaranteed to need zero decisions from you.\n\nIf you want to see what is coming, there is a \"Show what is coming\" link under the step. The total is hidden by default; you can turn it on under Reading in the header.",
      es: "Solo hay un paso encendido cada vez, a propósito. Ver doce pasos de golpe no es más información, es una avalancha, y empezar es un problema de decisión, así que el primer paso no te exige ninguna decisión.\n\nSi quieres ver lo que viene, hay un enlace \"Ver lo que viene\" debajo del paso. El total está oculto por defecto; puedes activarlo en Lectura, en la cabecera.",
    },
  },
  {
    id: "too-big",
    keys: {
      en: ["too big", "smaller", "shrink", "make it smaller", "cannot start", "step is hard", "overwhelmed by the step", "hard", "difficult", "break it down", "split"],
      es: ["muy grande", "paso muy grande", "demasiado grande", "más pequeño", "paso más pequeño", "hazlo más pequeño", "no puedo empezar", "el paso es difícil", "paso difícil", "difícil", "agobia", "partirlo", "dividirlo"],
    },
    answer: {
      en: "Press \"Too big\" on the lit step and it cuts back to its first instruction only. You can press it more than once.\n\nMaking a step smaller is not giving up, it is aim. It is also the intervention that most people take when they stall.",
      es: "Pulsa \"Muy grande\" en el paso encendido y se recorta a su primera instrucción y nada más. Puedes pulsarlo más de una vez.\n\nHacer un paso más pequeño no es rendirse, es apuntar. Además es la opción que más gente coge cuando se atasca.",
    },
  },
  {
    id: "park-it",
    keys: {
      en: ["park", "skip", "skip step", "park step", "park this step", "skip this step", "come back", "later", "park it"],
      es: ["aparcar", "apárcalo", "aparcar paso", "aparcar este paso", "saltar", "saltar paso", "saltarme el paso", "volver luego", "más tarde", "dejarlo para después"],
    },
    answer: {
      en: "\"Park it\" moves the current step aside and lights the next one. Nothing is lost — a parked step is recorded as skipped, not as failed, and you can come back to it.",
      es: "\"Apárcalo\" aparta el paso actual y enciende el siguiente. No se pierde nada: un paso aparcado se registra como saltado, no como fallado, y puedes volver a él.",
    },
  },
  {
    id: "formats",
    keys: {
      en: ["format", "shape", "skeleton", "dialogue", "map", "panels", "comic", "read aloud format", "different shape", "same words", "switch format", "change format", "change the shape", "rewrite", "another way", "different way", "reformat"],
      es: ["formato", "forma", "esqueleto", "diálogo", "mapa", "viñetas", "cómic", "otra forma", "las mismas palabras", "cambiar formato", "cambiar de forma", "reescribir", "de otra manera"],
    },
    answer: {
      en: "Under \"Same words, different shape\" you can re-render the same material five ways:\n\n· Skeleton — structure only, stripped to the load-bearing lines\n· Dialogue — two people working the problem out loud\n· Map — where the ideas sit relative to each other\n· Panels — six pictures with captions\n· Read aloud — written for the ear, one idea per sentence\n\nNothing is dropped between them. If an idea is hard it stays hard, it just changes form. Switching does not lose your place and the second look at a shape is instant, because it is cached.",
      es: "En \"Las mismas palabras, otra forma\" puedes volver a mostrar el mismo material de cinco maneras:\n\n· Esqueleto — solo la estructura, reducida a las líneas que sostienen el resto\n· Diálogo — dos personas resolviendo el problema en voz alta\n· Mapa — dónde está cada idea respecto a las demás\n· Viñetas — seis dibujos con su texto\n· En voz alta — escrito para el oído, una idea por frase\n\nNo se pierde nada al cambiar. Si una idea es difícil, sigue siéndolo, solo cambia de forma. Cambiar no te hace perder el sitio, y la segunda vez que abres una forma es instantánea porque queda guardada.",
    },
  },
  {
    id: "fastest-format",
    keys: {
      en: ["dot", "orange dot", "fastest", "which format is best", "marked format"],
      es: ["punto", "punto naranja", "más rápido", "qué formato es mejor", "formato marcado"],
    },
    answer: {
      en: "The small dot on a format is the one you read fastest, measured from your own sessions rather than chosen for you. It appears once there is enough recorded to say.",
      es: "El puntito en un formato marca aquel en el que lees más rápido, medido en tus propias sesiones y no elegido por nosotros. Aparece cuando hay bastante registrado para poder decirlo.",
    },
  },
  {
    id: "read-aloud",
    keys: {
      en: ["read it to me", "read aloud", "speech", "voice", "listen", "tts", "text to speech", "hear it", "out loud", "aloud", "narrate", "audio", "sound"],
      es: ["léemelo", "leer en voz alta", "voz alta", "voz", "escuchar", "oírlo", "que me lo lea", "narrar", "audio", "sonido", "lectura en voz alta"],
    },
    answer: {
      en: "Press \"Read it to me\" above the text. It highlights each word as it says it, because unsynced audio plus text is worse than either alone for most dyslexic readers.\n\nIt uses your browser's own voice, so it works with no key and the audio never leaves your device. If the button is missing, your browser does not support it — Chrome and Edge do.",
      es: "Pulsa \"Léemelo\" encima del texto. Va resaltando cada palabra mientras la dice, porque audio y texto sin sincronizar es peor que cualquiera de los dos por separado para la mayoría de lectores disléxicos.\n\nUsa la voz del propio navegador, así que funciona sin ninguna clave y el audio nunca sale de tu dispositivo. Coge la voz del idioma en el que esté la web. Si el botón no aparece, tu navegador no lo admite; Chrome y Edge sí.",
    },
  },
  {
    id: "dictation",
    keys: {
      en: ["say it instead", "dictation", "dictate", "talk", "speak instead", "voice input", "speak it", "type for me"],
      es: ["dilo en voz alta", "dictado", "dictar", "hablar", "decirlo en vez de escribir", "que escriba por mí", "micrófono"],
    },
    answer: {
      en: "\"Say it instead\" on the task box turns on dictation, and writes each sentence as you finish it. Press it again to stop.\n\nIt needs Chrome or Edge. Firefox and Safari do not support it and the button will tell you so.",
      es: "\"Dilo en voz alta\" en la caja de la tarea enciende el dictado y escribe cada frase cuando la terminas. Púlsalo otra vez para parar. Escucha en el idioma en el que esté la web.\n\nNecesita Chrome o Edge. Firefox y Safari no lo admiten y el botón te lo dirá.",
    },
  },
  {
    id: "friction-sheet",
    keys: {
      en: ["popup", "sheet appeared", "why did it ask", "noticed", "interrupted", "asked me if i needed help", "friction", "it interrupted me", "interrupt", "panel interrupted", "panel that interrupted me", "popped up", "appeared", "bothered", "nagging", "stuck"],
      es: ["ventana", "panel", "por qué apareció", "detectado", "me interrumpió", "interrumpe", "fricción", "me preguntó si necesitaba ayuda", "salió un panel", "molesta", "pesado", "atascado"],
    },
    answer: {
      en: "That panel appears when a few signals suggest you have been stuck rather than working — time on one place, typing and deleting, no input at all, the window losing focus, or scrolling back repeatedly.\n\nAll of it is computed in your browser and thrown away after scoring. No camera, no keystroke log, nothing about what you wrote. If it was wrong, press \"No, I am fine\" and it will interrupt less often from then on.",
      es: "Ese panel aparece cuando algunas señales sugieren que estás atascado en vez de trabajando: tiempo en un mismo sitio, escribir y borrar, nada de actividad, la ventana perdiendo el foco, o volver atrás una y otra vez.\n\nTodo eso se calcula en tu navegador y se tira después de puntuar. Sin cámara, sin registro de teclas, nada sobre lo que escribiste. Si se equivocó, pulsa \"No, estoy bien\" y a partir de ahí interrumpirá menos.",
    },
  },
  {
    id: "interventions",
    keys: {
      en: ["options when stuck", "change the options", "intervention", "what appears when stuck", "menu of help"],
      es: ["opciones cuando me atasco", "cambiar las opciones", "qué aparece cuando me atasco", "menú de ayuda", "opciones de ayuda"],
    },
    answer: {
      en: "The options in that panel are the ones you chose during setup, before you needed them — deciding what helps is much harder in the moment.\n\nYou can change which ones are offered from your account settings, and \"No, I am fine\" is always there as a first-class choice.",
      es: "Las opciones de ese panel son las que elegiste al configurar, antes de necesitarlas: decidir qué ayuda es mucho más difícil en el momento.\n\nPuedes cambiar cuáles se ofrecen desde los ajustes de tu cuenta, y \"No, estoy bien\" siempre está ahí como una opción de primera.",
    },
  },
  {
    id: "reading-settings",
    keys: {
      en: ["theme", "dark", "contrast", "colour", "color", "tint", "overlay", "line spacing", "letter spacing", "font", "text size", "reading settings", "hard to read", "background", "brighter", "darker", "bigger text", "spacing", "eyes hurt", "too bright"],
      es: ["tema", "oscuro", "contraste", "color", "filtro", "interlineado", "espacio entre letras", "letra", "tamaño del texto", "ajustes de lectura", "cuesta leer", "fondo", "más claro", "más oscuro", "letra más grande", "me duelen los ojos", "brilla mucho"],
    },
    answer: {
      en: "Press \"Reading\" in the header. You can change the surface (Calm, Dark, High contrast), lay a colour overlay over the page, and adjust line and letter spacing.\n\nIt is in the header rather than buried in settings because the moment you need it is the moment you are struggling to read.",
      es: "Pulsa \"Lectura\" en la cabecera. Puedes cambiar el fondo (Suave, Oscuro, Alto contraste), poner un filtro de color sobre la página y ajustar el interlineado y el espacio entre letras.\n\nEstá en la cabecera y no enterrado en ajustes porque el momento en que lo necesitas es el momento en que te cuesta leer.",
    },
  },
  {
    id: "language",
    keys: {
      en: ["language", "spanish", "english", "change language", "translate", "in spanish", "in english", "idioma"],
      es: ["idioma", "lenguaje", "español", "inglés", "cambiar idioma", "traducir", "en español", "en inglés", "castellano"],
    },
    answer: {
      en: "The EN / ES pair in the header switches the whole app, and it is remembered on this browser. It is out in the open rather than inside the Reading panel, because a control labelled in a language you do not read is a control you cannot find.\n\nIt changes more than the buttons: the steps a task is cut into, my answers, the observations on your profile, the page you give to a teacher, and which voice reads text aloud. Your own rules are never rewritten — those are your sentences.",
      es: "El par EN / ES de la cabecera cambia la app entera, y se recuerda en este navegador. Está a la vista y no dentro del panel de Lectura, porque un control escrito en un idioma que no lees es un control que no puedes encontrar.\n\nCambia más que los botones: los pasos en los que se corta una tarea, mis respuestas, las observaciones de tu perfil, la página que le das a un profesor y qué voz lee el texto en alto. Tus propias reglas no se reescriben nunca: esas son tus frases.",
    },
  },
  {
    id: "step-count",
    keys: {
      en: ["step count", "how many left", "how many steps left", "how many steps are left", "show total", "show how many steps", "progress", "dots", "marks"],
      es: ["cuántos pasos quedan", "cuántos quedan", "mostrar el total", "progreso", "puntos", "marcas"],
    },
    answer: {
      en: "The dots next to the step are the ground behind you. By default nothing is drawn for the steps ahead, because seeing the total made testers stop before starting.\n\nIf you want the total, turn on \"Show how many steps are left\" under Reading in the header.",
      es: "Los puntos que hay junto al paso son el terreno que llevas hecho. Por defecto no se dibuja nada de los pasos que quedan, porque ver el total hacía que la gente de prueba parase antes de empezar.\n\nSi quieres el total, activa \"Mostrar cuántos pasos quedan\" en Lectura, en la cabecera.",
    },
  },
  {
    id: "profile",
    keys: {
      en: ["profile", "how i work", "insights", "observations", "my observations", "what it learned", "measured", "stats", "learn about me", "what it knows", "my results", "progress report"],
      es: ["cómo trabajo", "perfil", "observaciones", "qué ha aprendido", "medido", "estadísticas", "qué sabe de mí", "mis resultados", "informe"],
    },
    answer: {
      en: "\"How I work\" holds everything the sessions have shown: observations with the evidence attached, your focus block, your time to start, and your reading rate.\n\nIf an observation is wrong, press \"Not true\". Dismissed observations are never generated again — if you say something about you is wrong, the software does not argue.",
      es: "\"Cómo trabajo\" tiene todo lo que han mostrado las sesiones: observaciones con su evidencia adjunta, tu bloque de concentración, tu tiempo hasta empezar y tu velocidad de lectura.\n\nSi una observación está mal, pulsa \"No es verdad\". Las observaciones descartadas no se vuelven a generar: si dices que algo sobre ti está mal, el programa no discute.",
    },
  },
  {
    id: "directives",
    keys: {
      en: ["rules", "directives", "instructions for the model", "system prompt", "tell it how to talk", "change how it talks", "my rules", "prompt", "how it speaks", "tone", "stop encouraging me"],
      es: ["reglas", "instrucciones para el modelo", "cómo me habla", "cambiar cómo me habla", "mis reglas", "tono", "que deje de animarme", "que no me anime"],
    },
    answer: {
      en: "On \"How I work\" there is a section called \"The instructions the model gets\". Those sentences are placed above everything we wrote, every single time the model runs.\n\nRules like \"never tell me how many steps are left\" or \"do not encourage me\" go there. You can read, add and delete every line. There is no second, hidden version.",
      es: "En \"Cómo trabajo\" hay una sección llamada \"Las instrucciones que recibe el modelo\". Esas frases se colocan por encima de todo lo que escribimos nosotros, cada vez que se ejecuta el modelo.\n\nAhí van reglas como \"no me digas nunca cuántos pasos quedan\" o \"no me animes\". Puedes leer, añadir y borrar cada línea. No hay una segunda versión oculta.",
    },
  },
  {
    id: "export",
    keys: {
      en: ["export", "teacher", "give to teacher", "handover", "print", "share", "accommodation", "evidence", "hand it in", "show my teacher", "one page", "report"],
      es: ["exportar", "profesor", "profesora", "dárselo a mi profesor", "imprimir", "compartir", "adaptación", "evidencia", "enseñar a mi profesor", "una página", "informe para el profesor"],
    },
    answer: {
      en: "At the bottom of \"How I work\" there is \"Give it to a teacher\". It produces one page in your own voice, with the evidence attached, and you can copy or print it.\n\nThat is the only route by which anything leaves your account, and it only happens when you press it.",
      es: "Al final de \"Cómo trabajo\" está \"Dáselo a un profesor\". Produce una página con tu propia voz, con la evidencia adjunta, y puedes copiarla o imprimirla. Sale en el idioma que tengas puesto, así que ponlo en el que lea la persona que va a recibirla.\n\nEsa es la única vía por la que algo sale de tu cuenta, y solo pasa cuando la pulsas tú.",
    },
  },
  {
    id: "privacy",
    keys: {
      en: ["privacy", "data", "what do you collect", "camera", "spying", "watching me", "tracked", "who can see", "is it private", "my data", "store", "stored", "collect", "know about me", "see my data", "safe", "secure", "anonymous", "webcam", "microphone"],
      es: ["privacidad", "datos", "qué recoges", "qué guardas", "cámara", "espiando", "me vigila", "quién puede ver", "es privado", "mis datos", "guardar", "recoger", "qué sabes de mí", "seguro", "anónimo", "webcam", "micrófono"],
    },
    answer: {
      en: "No camera. No microphone unless you press dictation, and that audio never leaves the device. No keystroke log — friction is five numbers between 0 and 1, computed in your browser and discarded after scoring.\n\nThere is no teacher dashboard and no parent digest. There is no table in the database for a person who is not you. Everything sits in a file on the machine running this app.\n\nThe \"My data\" page says all of this in full, and has the erase button.",
      es: "Sin cámara. Sin micrófono salvo que pulses el dictado, y ese audio nunca sale del dispositivo. Sin registro de teclas: la fricción son cinco números entre 0 y 1, calculados en tu navegador y descartados después de puntuar.\n\nNo hay panel para el profesorado ni resumen para las familias. No hay ninguna tabla en la base de datos para una persona que no seas tú. Todo está en un archivo en la máquina que ejecuta esta app.\n\nLa página \"Mis datos\" lo dice todo con detalle, y tiene el botón de borrar.",
    },
  },
  {
    id: "account",
    keys: {
      en: ["account", "id", "log in", "login", "sign in", "another browser", "another device", "password", "lost my account", "device", "browser", "switch computer", "same account"],
      es: ["cuenta", "identificador", "entrar", "iniciar sesión", "otro navegador", "otro dispositivo", "contraseña", "he perdido mi cuenta", "navegador", "otro ordenador", "la misma cuenta"],
    },
    answer: {
      en: "Your account id is on the \"My data\" page — copy it to open the same account in another browser. There is no password because there is no server holding accounts.\n\nIf you lost the id and cleared the browser, the account cannot be recovered. That is the cost of there being no account server.",
      es: "El id de tu cuenta está en la página \"Mis datos\": cópialo para abrir la misma cuenta en otro navegador. No hay contraseña porque no hay ningún servidor con cuentas.\n\nSi perdiste el id y limpiaste el navegador, la cuenta no se puede recuperar. Ese es el precio de que no haya servidor de cuentas.",
    },
  },
  {
    id: "erase",
    keys: {
      en: ["delete", "erase", "remove everything", "wipe", "start over", "delete my account", "delete my data", "delete all my data", "erase my data", "clear my data", "get rid of"],
      es: ["borrar", "borrarlo todo", "borrar mis datos", "borrar todo", "eliminar", "eliminar mis datos", "empezar de cero", "borrar mi cuenta", "limpiar mis datos", "quitar todo"],
    },
    answer: {
      en: "\"My data\" → \"Erase everything\". It deletes your rules, tasks, sessions, friction rows and observations immediately, and there is no archived copy.\n\nIf you only want to leave this browser without deleting anything, use \"Just sign out on this browser\" instead.",
      es: "\"Mis datos\" → \"Borrarlo todo\". Borra al momento tus reglas, tareas, sesiones, filas de fricción y observaciones, y no hay copia archivada.\n\nSi solo quieres salir de este navegador sin borrar nada, usa \"Solo cerrar sesión en este navegador\".",
    },
  },
  {
    id: "offline-mode",
    keys: {
      en: ["offline", "api key", "anthropic", "no key", "model", "ai mode", "mock", "does it need internet", "live", "internet", "wifi", "free", "cost", "groq", "provider"],
      es: ["sin conexión", "clave de api", "anthropic", "sin clave", "modelo", "necesita internet", "internet", "wifi", "gratis", "coste", "groq", "proveedor"],
    },
    answer: {
      en: "Ritmo runs fully offline by default. Without a key it uses a deterministic engine that runs the same code paths and returns the same shapes as the model — every feature is usable with no key, no network and no cost.\n\nTo use the live model, put an ANTHROPIC_API_KEY in server/.env and restart. The header says which mode you are in.",
      es: "Ritmo funciona del todo sin conexión por defecto. Sin clave usa un motor determinista que recorre los mismos caminos de código y devuelve las mismas formas que el modelo: todas las funciones se pueden usar sin clave, sin red y sin coste.\n\nPara usar el modelo en vivo, pon una ANTHROPIC_API_KEY en server/.env y reinicia. La cabecera dice en qué modo estás.",
    },
  },
  {
    id: "trouble-blank",
    keys: {
      en: ["not loading", "blank page", "nothing happens", "broken", "white screen", "will not load", "stuck loading", "does not work", "blank", "nothing loads", "crash", "wont open", "empty screen", "page is white"],
      es: ["no carga", "página en blanco", "no pasa nada", "roto", "pantalla blanca", "no funciona", "se queda cargando", "no abre", "pantalla vacía", "algo no carga", "se ha roto"],
    },
    answer: {
      en: "Try these in order:\n\n1. Check the API is up — open http://localhost:4000/api/health. It should return ok: true.\n2. If it does not, the server is not running. From the project folder run: npm run dev\n3. Hard refresh the page — Ctrl+Shift+R.\n4. If the page loads but nothing saves, your browser may be blocking local storage in private mode.",
      es: "Prueba esto en orden:\n\n1. Comprueba que la API está viva: abre http://localhost:4000/api/health. Debería devolver ok: true.\n2. Si no lo hace, el servidor no está en marcha. Desde la carpeta del proyecto ejecuta: npm run dev\n3. Recarga forzando: Ctrl+Shift+R.\n4. Si la página carga pero no se guarda nada, puede que tu navegador esté bloqueando el almacenamiento local en modo privado.",
    },
  },
  {
    id: "trouble-server",
    keys: {
      en: ["server error", "did not answer", "500", "502", "cannot reach", "connection refused", "api down", "port", "address in use", "eaddrinuse", "error", "failed", "not responding", "api"],
      es: ["error del servidor", "no respondió", "no responde", "no puedo conectar", "conexión rechazada", "api caída", "puerto", "puerto ocupado", "error", "ha fallado"],
    },
    answer: {
      en: "\"The server did not answer\" means the API on port 4000 is not reachable.\n\n· Make sure npm run dev is running and shows both the API and the app.\n· If it says the port is in use, something else is on 4000. Change PORT in server/.env and restart.\n· Model failures never surface as errors — they fall back to the offline engine — so a visible error is almost always the local server, not the model.",
      es: "\"El servidor no respondió\" significa que no se llega a la API en el puerto 4000.\n\n· Asegúrate de que npm run dev está en marcha y muestra tanto la API como la web.\n· Si dice que el puerto está ocupado, hay otra cosa en el 4000. Cambia PORT en server/.env y reinicia.\n· Los fallos del modelo nunca salen como error: caen al motor sin conexión. Así que un error visible es casi siempre el servidor local, no el modelo.",
    },
  },
  {
    id: "trouble-database",
    keys: {
      en: ["database", "prisma", "sqlite", "reset the database", "seed", "migration", "db"],
      es: ["base de datos", "prisma", "sqlite", "reiniciar la base de datos", "migración", "semilla"],
    },
    answer: {
      en: "From the project folder:\n\n· npm run db:reset — wipes and reseeds, useful if the data got into a strange state\n· npm run db:studio — opens a browser view of everything stored\n\nThe database is a single SQLite file at server/prisma/dev.db. Deleting it and running npm run setup again gives you a clean start.",
      es: "Desde la carpeta del proyecto:\n\n· npm run db:reset — la vacía y la vuelve a sembrar, útil si los datos quedaron en un estado raro\n· npm run db:studio — abre una vista en el navegador de todo lo guardado\n\nLa base de datos es un solo archivo SQLite en server/prisma/dev.db. Borrarlo y ejecutar npm run setup otra vez te deja empezar limpio.",
    },
  },
  {
    id: "trouble-slow",
    keys: {
      en: ["slow", "taking long", "spinning", "loading forever", "hangs", "frozen"],
      es: ["lento", "tarda mucho", "cargando sin parar", "se cuelga", "congelado", "se queda pillado"],
    },
    answer: {
      en: "If it is working out an assignment, the panel lists the real stages as it goes — no bar, because we do not know how long a model takes.\n\nWith a key, calls time out after 30 seconds and fall back to the offline engine rather than hanging. If something sits longer than that, it is the local server rather than the model, so check http://localhost:4000/api/health.",
      es: "Si está averiguando una tarea, el panel va listando las etapas reales según avanza. No hay barra, porque no sabemos cuánto tarda un modelo.\n\nCon clave, las llamadas expiran a los 30 segundos y caen al motor sin conexión en vez de quedarse colgadas. Si algo tarda más que eso, es el servidor local y no el modelo, así que mira http://localhost:4000/api/health.",
    },
  },
  {
    id: "who-made",
    keys: {
      en: ["who made", "who built", "hackathon", "team", "credits", "licence", "license", "open source"],
      es: ["quién lo hizo", "quién lo construyó", "hackathon", "equipo", "créditos", "licencia", "código abierto"],
    },
    answer: {
      en: "Ritmo was built for the IncludAI Neurodiversity Hackathon, Track 1: AI for K–12 Learning. It is MIT licensed.\n\nThe design decisions came out of sessions with neurodivergent students — docs/CO-DESIGN.md records who asked for what, and which of those changed the build.",
      es: "Ritmo se hizo para el IncludAI Neurodiversity Hackathon, pista 1: IA para el aprendizaje de K–12. Tiene licencia MIT.\n\nLas decisiones de diseño salieron de sesiones con estudiantes neurodivergentes; docs/CO-DESIGN.md registra quién pidió qué, y cuáles de esas peticiones cambiaron el producto.",
    },
  },
  {
    id: "greeting",
    keys: {
      en: ["hello", "hi", "hey", "good morning", "good evening", "yo"],
      es: ["hola", "buenas", "buenos días", "buenas tardes", "buenas noches", "qué tal"],
    },
    answer: {
      en: "Hello. Ask me how any part of this works, or what to do when something is not behaving.\n\nIf you are not sure where to start: paste an assignment on the Work page and it will hand you one step.",
      es: "Hola. Pregúntame cómo funciona cualquier parte de esto, o qué hacer cuando algo no va bien.\n\nSi no sabes por dónde empezar: pega una tarea en la página Trabajo y te dará un paso.",
    },
  },
  {
    id: "thanks",
    keys: {
      en: ["thanks", "thank you", "cheers", "ta", "appreciate"],
      es: ["gracias", "muchas gracias", "genial", "perfecto"],
    },
    answer: {
      en: "Any time. I am on the right of the screen whenever you need me.",
      es: "Cuando quieras. Estoy a la derecha de la pantalla siempre que me necesites.",
    },
  },
];

/**
 * Words that carry no signal, so they are dropped before matching.
 *
 * The Spanish list is longer than the English one and that is not an oversight:
 * Spanish questions carry more grammatical scaffolding ("de", "que", "se") than
 * their English equivalents, and leaving it in makes almost every question look
 * like a partial match for almost every topic.
 */
const STOP = {
  en: new Set([
    "the", "a", "an", "is", "are", "was", "do", "does", "did", "how", "what", "why",
    "can", "i", "you", "it", "this", "that", "to", "of", "in", "on", "for", "and",
    "my", "me", "with", "at", "be", "have", "has", "get", "there", "am", "if",
    "when", "where", "so", "but", "or", "not", "no", "yes", "please", "just",
  ]),
  es: new Set([
    "el", "la", "los", "las", "un", "una", "unos", "unas", "lo", "al", "del",
    "de", "a", "en", "con", "por", "para", "que", "y", "o", "u", "e",
    "es", "son", "era", "eran", "esta", "este", "esto", "estos", "estas", "ese",
    "esa", "eso", "hay", "ha", "he", "han", "se", "me", "te", "mi", "mis", "tu",
    "tus", "su", "sus", "yo", "tú", "usted", "muy", "mas", "más", "pero", "si",
    "sí", "no", "ya", "solo", "sólo", "cuando", "donde", "dónde", "cuándo",
    "como", "cómo", "qué", "que", "quién", "quien", "cual", "cuál", "porque",
    "por qué", "puedo", "puede", "puedes", "hacer", "hago", "haces", "tengo",
    "tiene", "tienes", "algo", "nada", "todo", "toda", "ser", "estar", "va",
    "vas", "voy", "favor", "cosa", "cosas", "aquí", "ahí", "también", "sobre",
  ]),
};

/**
 * Folds accents and ñ before matching.
 *
 * The old normaliser replaced anything outside a-z with a space, which turned
 * "diseña" into two fragments and "qué" into "qu". Decomposing first means an
 * accent is dropped rather than splitting the word that carries it — and it
 * makes the match forgiving of a student who did not reach for the accent key,
 * which on a phone keyboard is most of them.
 */
const normalise = (text) =>
  String(text ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/**
 * Light stemming, applied to both sides.
 *
 * Without it the guide fails on the way people actually type: "nothing loads"
 * misses a key of "not loading", and "why did it interrupt me" misses
 * "interrupted". Anyone who has to guess the phrasing the software wants has
 * already been failed by it.
 *
 * Spanish needs its own list — it inflects far more, and an English stemmer
 * applied to it does nothing useful: "cambiar", "cambia" and "cambiando" would
 * stay three different words.
 */
const SUFFIXES = {
  en: ["ing", "ied", "ies", "ed", "es", "s"],
  es: [
    "andose", "iendose", "aciones", "amiento", "imiento",
    "ando", "iendo", "ados", "idos", "adas", "idas", "ares",
    "ado", "ido", "ada", "ida", "ar", "er", "ir", "es", "as", "os", "s",
  ],
};

function stemmer(lang) {
  const suffixes = SUFFIXES[lang] ?? SUFFIXES[DEFAULT_LANG];
  return (word) => {
    if (word.length <= 4) return word;
    for (const suffix of suffixes) {
      if (word.endsWith(suffix) && word.length - suffix.length >= 3) {
        return word.slice(0, -suffix.length);
      }
    }
    return word;
  };
}

function tokens(text, lang, drop = true) {
  const stop = STOP[lang] ?? STOP[DEFAULT_LANG];
  const stem = stemmer(lang);
  return normalise(text)
    .split(" ")
    .filter((w) => w.length > 1 && (!drop || !stop.has(w)))
    .map(stem);
}

const meaningful = (text, lang) => tokens(text, lang, true);

/**
 * Scores every topic against the question and returns the best, or null when
 * nothing clears the bar.
 *
 * Key phrases match as an unordered set of stems rather than as a substring,
 * so "the page is blank and nothing loads" still reaches the key "blank page".
 * Longer phrases score higher, which keeps "read aloud" ahead of a stray
 * "read" that happens to sit in a question about something else.
 */
export function findTopic(question, lang = DEFAULT_LANG) {
  /*
    Some perfectly ordinary questions are made entirely of stop words: "what is
    this", "how does this work", "qué es esto". Dropping the scaffolding leaves
    nothing to match on, and the guide answered the most basic question anyone
    asks it with a shrug — in both languages.

    So when the filtered bag comes back empty, match again with nothing
    dropped. It only ever runs when the alternative was giving up, and it is
    scored against key signatures built the same way, so a question that is all
    scaffolding is compared against keys that are also all scaffolding.
  */
  const filtered = tokens(question, lang, true);
  const drop = filtered.length > 0;
  const asked = drop ? filtered : tokens(question, lang, false);
  if (!asked.length) return null;
  const bag = new Set(asked);

  const flat = normalise(question);
  let best = null;
  let bestScore = 0;
  let bestLiteral = false;

  for (const topic of TOPICS) {
    let score = 0;
    // Several phrasings of one key collapse to the same stems — "stop when",
    // "when do i stop" and "you can stop when" are all just ["stop"]. Scoring
    // each of them separately would let a topic outrank a longer, more
    // specific match purely by having been written three ways.
    for (const signature of signaturesFor(topic, lang, drop)) {
      const parts = signature.split(" ");
      if (parts.every((p) => bag.has(p))) {
        score += parts.length === 1 ? 2 : parts.length * 3;
      }
    }
    if (score === 0) continue;

    /*
      Ties are broken by whether a key appears in the question as written.

      Some pairs are genuinely indistinguishable once stop words are gone:
      "how i work" is the name of a page, "how does this work" is a general
      question, and both reduce to the single stem ["work"]. Stems alone cannot
      separate them, and whichever topic happened to be declared first won —
      which is not a reason.

      The phrase being physically present in what the student typed is a
      reason. It only ever applies at equal score, so it cannot outrank a
      longer or more specific stem match.
    */
    const literal = hasLiteralKey(topic, lang, flat);
    if (score > bestScore || (score === bestScore && literal && !bestLiteral)) {
      bestScore = score;
      bestLiteral = literal;
      best = topic;
    }
  }

  return bestScore >= 2 ? best : null;
}

const literalCache = new WeakMap();

function hasLiteralKey(topic, lang, flat) {
  let byLang = literalCache.get(topic);
  if (!byLang) {
    byLang = new Map();
    literalCache.set(topic, byLang);
  }
  let phrases = byLang.get(lang);
  if (!phrases) {
    phrases = (topic.keys[lang] ?? topic.keys[DEFAULT_LANG]).map(normalise).filter(Boolean);
    byLang.set(lang, phrases);
  }
  return phrases.some((phrase) => flat.includes(phrase));
}

/** Cached per topic, per language, and per stop-word mode. */
const signatureCache = new WeakMap();

function signaturesFor(topic, lang, drop) {
  let byLang = signatureCache.get(topic);
  if (!byLang) {
    byLang = new Map();
    signatureCache.set(topic, byLang);
  }
  const cacheKey = `${lang}:${drop ? 1 : 0}`;
  let cached = byLang.get(cacheKey);
  if (!cached) {
    const keys = topic.keys[lang] ?? topic.keys[DEFAULT_LANG];
    cached = new Set(
      keys.map((key) => tokens(key, lang, drop).sort().join(" ")).filter(Boolean)
    );
    byLang.set(cacheKey, cached);
  }
  return cached;
}

/** The answer for a topic, in the language asked for. */
export function answerFor(topic, lang = DEFAULT_LANG) {
  return topic.answer[lang] ?? topic.answer[DEFAULT_LANG];
}

const FALLBACKS = {
  en: "I did not catch which part that is about. I can help with any of these:\n\n· Starting a task, and what \"you can stop when\" means\n· Why only one step is lit, and how to make it smaller\n· Switching the shape of the material, or having it read aloud\n· Why that panel appeared when you were stuck\n· Your rules for the model, and giving a page to a teacher\n· What is stored, and how to erase it\n· Something not working: blank page, server errors, the database\n\nAsk about one of those in your own words and I will find it.",
  es: "No he pillado de qué parte va eso. Puedo ayudarte con cualquiera de estas:\n\n· Empezar una tarea, y qué significa \"puedes parar cuando\"\n· Por qué solo hay un paso encendido, y cómo hacerlo más pequeño\n· Cambiar la forma del material, o que te lo lean en voz alta\n· Por qué apareció ese panel cuando estabas atascado\n· Tus reglas para el modelo, y darle una página a un profesor\n· Qué se guarda, y cómo borrarlo\n· Algo que no funciona: página en blanco, errores del servidor, la base de datos\n\nPregúntame por una de esas con tus palabras y la encuentro.",
};

export const fallbackFor = (lang = DEFAULT_LANG) => FALLBACKS[lang] ?? FALLBACKS[DEFAULT_LANG];

/** A short, capability-shaped list used to prime the live model. */
export const CAPABILITY_SUMMARY = TOPICS.map(
  (t) => `${t.id}: ${t.keys.en.slice(0, 4).join(", ")}`
).join("\n");
