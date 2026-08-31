export type Categoria =
  | "approfondimenti"
  | "recensioni"
  | "consigli"
  | "riflessioni"
  | "classifiche";

export type Articolo = {
  slug: string;
  titolo: string;
  sommario: string;
  categoria: Categoria;
  data: string;
  minuti: number;
  corpo: string[];
};

export const CATEGORIE: {
  chiave: Categoria;
  nome: string;
  descrizione: string;
}[] = [
  {
    chiave: "approfondimenti",
    nome: "Approfondimenti",
    descrizione:
      "Come nascono i giochi: l'idea iniziale, lo sviluppo, le cose cambiate lungo la strada.",
  },
  {
    chiave: "recensioni",
    nome: "Recensioni",
    descrizione: "Giudizi personali, senza voti numerici.",
  },
  {
    chiave: "consigli",
    nome: "Consigli",
    descrizione:
      "Cosa giocare dopo un certo titolo, o se cerchi una certa atmosfera.",
  },
  {
    chiave: "riflessioni",
    nome: "Riflessioni",
    descrizione:
      "Ragionamenti su come stanno cambiando i videogiochi e chi li fa.",
  },
  {
    chiave: "classifiche",
    nome: "Classifiche",
    descrizione: "Liste ragionate su una saga, un autore, un genere.",
  },
];

export const ARTICOLI: Articolo[] = [
  {
    slug: "silent-hill-2-stanza-chiusa-a-chiave",
    titolo:
      "Silent Hill 2 e la stanza chiusa a chiave che nessuno doveva aprire",
    sommario:
      "Un team piccolo, un motore grafico che non reggeva la nebbia e una sceneggiatura riscritta tre volte. La storia di come un limite tecnico è diventato il linguaggio di un gioco.",
    categoria: "approfondimenti",
    data: "2026-09-20",
    minuti: 12,
    corpo: [
      "Quando Team Silent iniziò a lavorare su Silent Hill 2, la console di riferimento era una PlayStation 2 appena uscita, e le sue capacità reali erano ancora un terreno sconosciuto. Il team aveva un obiettivo ambizioso e una manciata di persone per realizzarlo, e ben presto si scontrò con un problema molto concreto: il motore grafico non riusciva a disegnare gli ambienti esterni oltre una certa distanza senza far crollare il framerate.",
      "La soluzione che oggi viene ricordata come una scelta artistica geniale nacque, in realtà, da questa limitazione. La nebbia che avvolge le strade di Silent Hill non era pensata all'inizio come elemento narrativo, ma come un modo economico per nascondere il pop-in degli oggetti e ridurre il numero di poligoni da renderizzare in ogni frame.",
      "Solo in un secondo momento gli sceneggiatori capirono che quella coltre bianca poteva diventare qualcos'altro: uno strumento per isolare il giocatore, per fargli percepire la città come un labirinto che si rivela un passo alla volta. Da vincolo tecnico, la nebbia si trasformò nel linguaggio visivo dell'intero gioco.",
      "Anche la sceneggiatura ebbe una gestazione tutt'altro che lineare. Le prime bozze del rapporto tra James e Mary erano più esplicite, quasi didascaliche nello spiegare il senso di colpa del protagonista. Vennero riscritte almeno tre volte, ogni volta togliendo qualcosa, fino ad arrivare a un testo che lascia più spazio alle inferenze del giocatore che alle spiegazioni dirette.",
      "Una delle stanze del Grand Hotel, mostrata in alcune build interne ma mai completata per l'uscita, doveva contenere un flashback giocabile che chiariva apertamente cosa fosse successo a Mary. Il team decise di tagliarla: non serviva più, una volta che l'ambiguità era diventata la vera struttura portante del racconto.",
      "È un caso che si ripete spesso nello sviluppo di un videogioco: un limite che sembra solo un ostacolo da aggirare finisce per definire l'identità dell'opera più di qualunque scelta di design pensata a tavolino.",
    ],
  },
  {
    slug: "clair-obscur-expedition-33",
    titolo: "Clair Obscur: Expedition 33",
    sommario:
      "Un gioco di ruolo a turni che ha il coraggio di chiedere attenzione, in un anno in cui quasi nessuno la chiede più.",
    categoria: "recensioni",
    data: "2026-09-14",
    minuti: 9,
    corpo: [
      "Ci sono giochi che si lasciano attraversare, e giochi che chiedono di essere abitati. Clair Obscur: Expedition 33 appartiene decisamente alla seconda categoria, ed è una scelta che si sente fin dalle prime ore, quando il ritmo delle battaglie a turni ti costringe a rallentare e a guardare davvero quello che succede sullo schermo.",
      "Il sistema di combattimento è la parte più riuscita: unisce la struttura classica del turn-based a un livello di reattività quasi da action game, con parate e schivate temporizzate che trasformano ogni scontro in una piccola coreografia da imparare a memoria.",
      "La direzione artistica fa il resto. Non è semplicemente 'bella', è coerente: ogni ambiente racconta qualcosa sullo stato del mondo, e i colori tenui, quasi acquerellati, restano impressi molto più di tanti scenari fotorealistici visti negli ultimi anni.",
      "Dove il gioco rischia di perdere qualcuno è nel ritmo narrativo, deliberatamente lento nella prima metà. Non è un difetto, ma è una richiesta esplicita fatta al giocatore: fidati, arriva da qualche parte. E infatti ci arriva, con una seconda metà che ripaga ampiamente la pazienza richiesta.",
      "In un panorama in cui la maggior parte dei giochi di ruolo tende a semplificarsi per allargare il pubblico, Clair Obscur va nella direzione opposta, e lo fa senza sembrare mai un esercizio di nostalgia fine a se stesso.",
    ],
  },
  {
    slug: "cyberpunk-2077-tagli-costo",
    titolo: "Quanto è costato tagliare metà di Cyberpunk 2077",
    sommario:
      "Le funzioni annunciate e mai arrivate, quelle rimosse a sei mesi dall'uscita, e cosa racconta questo sul modo in cui si programma il lavoro in uno studio grande.",
    categoria: "approfondimenti",
    data: "2026-09-09",
    minuti: 8,
    corpo: [
      "Le demo di Cyberpunk 2077 mostrate prima dell'uscita contenevano sistemi che non sono mai arrivati nel gioco finale, o che sono arrivati in una forma molto ridotta: l'intelligenza artificiale del traffico, le interazioni ambientali con gli NPC, alcune diramazioni delle missioni secondarie.",
      "Non si è trattato di bugie deliberate, quanto di un problema di pianificazione: molte di quelle funzioni erano ancora prototipi quando sono state mostrate al pubblico, e prototipare qualcosa è molto più semplice che integrarlo in un gioco open world già enorme, con decine di sistemi che devono parlarsi tra loro.",
      "Alcuni tagli sono arrivati tardissimo, quando mancavano pochi mesi al lancio. In quella fase, rimuovere una funzione non significa solo toglierla: significa rivedere ogni missione che la usava, ogni linea di dialogo che la presupponeva, ogni asset costruito intorno a un'idea che non esisterà più.",
      "È il tipo di costo che raramente viene comunicato all'esterno, perché non produce un titolo di notizia interessante quanto 'la funzione X non c'è'. Ma è quello che assorbe la maggior parte del tempo di un team negli ultimi mesi di sviluppo di un gioco di quella scala.",
      "La lezione che molti studi hanno provato a trarne, incluso lo stesso CD Projekt Red nei progetti successivi, è che mostrare qualcosa prima che sia stato validato dentro al motore di gioco, e non solo in un video costruito ad hoc, è un rischio che si paga due volte: al lancio, e per anni dopo.",
    ],
  },
  {
    slug: "cosa-giocare-dopo-disco-elysium",
    titolo: "Cosa giocare dopo Disco Elysium",
    sommario:
      "Sei titoli per chi è uscito da Revachol e adesso trova tutto il resto un po' silenzioso.",
    categoria: "consigli",
    data: "2026-09-03",
    minuti: 6,
    corpo: [
      "Disco Elysium lascia un vuoto particolare: non tanto per la trama investigativa in sé, quanto per la densità della sua scrittura, per il modo in cui ogni oggetto dell'ambiente e ogni frammento del tuo stesso cervello può diventare una battuta di dialogo giocabile.",
      "Non esiste un sostituto diretto, ma esistono giochi che condividono alcuni dei suoi pezzi. Alcuni per la scrittura politica e stratificata, altri per la libertà di costruire un personaggio attraverso le parole più che attraverso le statistiche, altri ancora per l'atmosfera di una città che sembra viva anche quando non succede nulla.",
      "Vale la pena cercare titoli che non abbiano paura del testo: giochi in cui leggere è l'azione principale, non un intermezzo tra un combattimento e l'altro. È lì che si trova la parte più vicina a quello che rende speciale Revachol.",
      "Allo stesso modo, conviene guardare a produzioni indipendenti più che a grandi giochi di ruolo mainstream: la libertà di scrivere dialoghi lunghi, ambigui, a tratti scomodi, è più facile da trovare in team piccoli che non devono rispondere a un pubblico enorme e eterogeneo.",
      "Nessuno di questi giochi replica Disco Elysium, ed è giusto così. Ma tutti condividono l'idea che un videogioco possa essere prima di tutto un testo da abitare, e questo, per chi arriva da Revachol, è già un buon punto di partenza.",
    ],
  },
  {
    slug: "accesso-anticipato-giochi-non-finiti",
    titolo:
      "L'accesso anticipato ci ha abituati a giocare cose non finite",
    sommario:
      "Comprare un gioco a metà era un'eccezione, poi è diventato un modello di sviluppo. Cosa ci abbiamo guadagnato e cosa no.",
    categoria: "riflessioni",
    data: "2026-08-28",
    minuti: 7,
    corpo: [
      "Fino a poco più di un decennio fa, comprare un gioco significava comprare un prodotto finito, o quantomeno presentato come tale. L'accesso anticipato ha ribaltato questa aspettativa: oggi è normale pagare per qualcosa che lo sviluppatore stesso definisce incompleto, con la promessa di updates futuri.",
      "Per certi generi, in particolare i giochi gestionali e i survival, questo modello ha funzionato benissimo: il feedback della community è diventato parte del processo di design, e alcuni dei titoli più interessanti degli ultimi anni sono cresciuti pubblicamente, correggendo la rotta grazie a chi ci giocava fin dalle prime versioni.",
      "Ma il modello ha anche normalizzato pratiche più discutibili: giochi rimasti in accesso anticipato per anni senza una direzione chiara, altri abbandonati del tutto dopo l'incasso iniziale, altri ancora usati come test di mercato più che come vero dialogo con i giocatori.",
      "Il rischio più sottile è culturale: ci siamo abituati a considerare 'normale' l'idea che un gioco arrivi incompleto, spostando sul giocatore il compito che una volta spettava al controllo qualità interno di uno studio.",
      "Non è un modello da condannare in blocco, ma vale la pena chiedersi, titolo per titolo, se l'accesso anticipato sia uno strumento di sviluppo condiviso con la community o semplicemente un modo elegante per vendere prima di aver finito di costruire.",
    ],
  },
  {
    slug: "dieci-momenti-resident-evil",
    titolo: "I dieci momenti che hanno definito Resident Evil",
    sommario:
      "Dai cani che saltano dalla finestra al villaggio in cui il tempo si ferma: trent'anni di paura, messi in fila.",
    categoria: "classifiche",
    data: "2026-08-21",
    minuti: 10,
    corpo: [
      "Trent'anni di Resident Evil sono anche trent'anni di momenti che hanno insegnato al pubblico come funziona lo spavento in un videogioco: non solo il jump scare, ma la costruzione lenta della tensione che lo rende efficace.",
      "Il primo corridoio della villa Spencer, con i cani che sfondano le finestre, resta uno dei momenti più imitati della storia del medium: non tanto per l'evento in sé, quanto per il modo in cui il gioco ti aveva già insegnato a diffidare di ogni spazio apparentemente tranquillo.",
      "Il villaggio di Resident Evil 4 introduce la paura in una forma diversa, corale: non un singolo nemico, ma una folla che ti circonda, che parla, che coordina i suoi movimenti. È il momento in cui la serie ha dimostrato di saper reinventare cosa significhi avere paura in un gioco d'azione.",
      "Il ritorno all'horror puro di Resident Evil 7, visto in prima persona dentro la casa dei Baker, ha riportato la serie alle sue radici proprio mentre sembrava essersi allontanata definitivamente verso l'azione spettacolare.",
      "Ognuno di questi momenti, messo in fila con gli altri, racconta una serie che si è reinventata più volte senza mai perdere del tutto la propria identità: la sensazione, sempre uguale nella sostanza, di essere in un posto dove qualcosa non va, molto prima che quel qualcosa si mostri.",
    ],
  },
];

export function tuttiGliArticoli(): Articolo[] {
  return [...ARTICOLI].sort((a, b) => (a.data < b.data ? 1 : -1));
}

export function articoliPerCategoria(categoria: Categoria): Articolo[] {
  return tuttiGliArticoli().filter(
    (articolo) => articolo.categoria === categoria
  );
}

export function articoloPerSlug(slug: string): Articolo | undefined {
  return ARTICOLI.find((articolo) => articolo.slug === slug);
}

export function nomeCategoria(categoria: Categoria): string {
  return CATEGORIE.find((c) => c.chiave === categoria)?.nome ?? categoria;
}

export function dataLeggibile(iso: string): string {
  return new Intl.DateTimeFormat("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${iso}T00:00:00`));
}
