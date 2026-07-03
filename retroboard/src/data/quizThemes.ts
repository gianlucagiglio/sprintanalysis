export type QuizTheme = {
  id: string
  label: string
  questions: { question: string; choices: string[]; correct_choice: number }[]
}

export const quizThemes: QuizTheme[] = [
  {
    id: 'gen-z',
    label: 'Gen Z e cultura digitale',
    questions: [
      {
        question: 'Cosa significa "FOMO"?',
        choices: [
          'Fear Of Missing Out',
          'Friends On My Opinion',
          'Fun Over Money Only',
          'First Order Main Object',
        ],
        correct_choice: 0,
      },
      {
        question: 'Su quale piattaforma è nato il formato video breve verticale?',
        choices: ['Instagram', 'YouTube', 'TikTok', 'Snapchat'],
        correct_choice: 2,
      },
      {
        question: 'Cosa significa "ghostare" qualcuno?',
        choices: [
          'Spaventarlo',
          'Interrompere ogni comunicazione senza spiegazioni',
          'Seguirlo sui social',
          'Inviargli messaggi anonimi',
        ],
        correct_choice: 1,
      },
    ],
  },
  {
    id: 'astronomia',
    label: 'Astronomia e Spazio',
    questions: [
      {
        question: 'Quale pianeta del sistema solare è il più grande?',
        choices: ['Saturno', 'Giove', 'Nettuno', 'Urano'],
        correct_choice: 1,
      },
      {
        question: 'In che anno l\'uomo è sbarcato sulla Luna per la prima volta?',
        choices: ['1965', '1967', '1969', '1971'],
        correct_choice: 2,
      },
      {
        question: 'Come si chiama la galassia in cui si trova il nostro sistema solare?',
        choices: ['Andromeda', 'Via Lattea', 'Triangolo', 'Girandola'],
        correct_choice: 1,
      },
    ],
  },
  {
    id: 'fumetti',
    label: 'Fumetti e supereroi',
    questions: [
      {
        question: 'Qual è il vero nome di Spider-Man?',
        choices: ['Bruce Banner', 'Tony Stark', 'Peter Parker', 'Steve Rogers'],
        correct_choice: 2,
      },
      {
        question: 'Quale supereroe DC ha un anello verde?',
        choices: ['Flash', 'Lanterna Verde', 'Aquaman', 'Cyborg'],
        correct_choice: 1,
      },
      {
        question: 'Chi è l\'autore del manga "One Piece"?',
        choices: ['Akira Toriyama', 'Masashi Kishimoto', 'Eiichiro Oda', 'Hajime Isayama'],
        correct_choice: 2,
      },
    ],
  },
  {
    id: 'formula1',
    label: 'Formula 1 e Motori',
    questions: [
      {
        question: 'Quanti mondiali di F1 ha vinto Michael Schumacher?',
        choices: ['5', '6', '7', '8'],
        correct_choice: 2,
      },
      {
        question: 'In quale città si corre il Gran Premio di Monaco?',
        choices: ['Nice', 'Monte Carlo', 'Montecatini', 'Cannes'],
        correct_choice: 1,
      },
      {
        question: 'Quale scuderia ha vinto più campionati costruttori?',
        choices: ['Mercedes', 'Red Bull', 'Ferrari', 'McLaren'],
        correct_choice: 2,
      },
    ],
  },
  {
    id: 'economia',
    label: 'Economia e Finanza',
    questions: [
      {
        question: 'Cosa significa PIL?',
        choices: [
          'Prodotto Interno Lordo',
          'Piano Investimento Locale',
          'Produttività Industriale Lorda',
          'Patrimonio Italiano Liquido',
        ],
        correct_choice: 0,
      },
      {
        question: 'Quale criptovaluta è stata la prima ad essere creata?',
        choices: ['Ethereum', 'Ripple', 'Bitcoin', 'Litecoin'],
        correct_choice: 2,
      },
      {
        question: 'Come si chiama la banca centrale europea?',
        choices: ['EBC', 'BCE', 'BEC', 'CBE'],
        correct_choice: 1,
      },
    ],
  },
  {
    id: 'psicologia',
    label: 'Psicologia',
    questions: [
      {
        question: 'Chi è considerato il padre della psicoanalisi?',
        choices: ['Carl Jung', 'Sigmund Freud', 'Abraham Maslow', 'Ivan Pavlov'],
        correct_choice: 1,
      },
      {
        question: 'Come si chiama la piramide dei bisogni umani?',
        choices: [
          'Piramide di Freud',
          'Piramide di Jung',
          'Piramide di Maslow',
          'Piramide di Pavlov',
        ],
        correct_choice: 2,
      },
      {
        question: 'Cosa studia la psicologia cognitiva?',
        choices: [
          'Le emozioni',
          'I processi mentali come memoria e apprendimento',
          'I comportamenti sociali',
          'I disturbi della personalità',
        ],
        correct_choice: 1,
      },
    ],
  },
  {
    id: 'filosofia',
    label: 'Filosofia',
    questions: [
      {
        question: 'Chi ha detto "Cogito ergo sum" (Penso dunque sono)?',
        choices: ['Platone', 'Aristotele', 'Cartesio', 'Kant'],
        correct_choice: 2,
      },
      {
        question: 'Quale filosofo ha scritto "La Repubblica"?',
        choices: ['Socrate', 'Platone', 'Aristotele', 'Epicuro'],
        correct_choice: 1,
      },
      {
        question: 'Quale corrente filosofica sostiene che "l\'uomo è condannato ad essere libero"?',
        choices: ['Esistenzialismo', 'Stoicismo', 'Idealismo', 'Positivismo'],
        correct_choice: 0,
      },
    ],
  },
  {
    id: 'architettura',
    label: 'Architettura',
    questions: [
      {
        question: 'Chi ha progettato la Sagrada Familia a Barcellona?',
        choices: ['Le Corbusier', 'Frank Lloyd Wright', 'Antoni Gaudí', 'Renzo Piano'],
        correct_choice: 2,
      },
      {
        question: 'In quale città si trova il Burj Khalifa, l\'edificio più alto del mondo?',
        choices: ['Dubai', 'Shanghai', 'New York', 'Tokyo'],
        correct_choice: 0,
      },
      {
        question: 'Quale stile architettonico caratterizza Notre-Dame di Parigi?',
        choices: ['Romanico', 'Gotico', 'Barocco', 'Rinascimentale'],
        correct_choice: 1,
      },
    ],
  },
  {
    id: 'moda',
    label: 'Moda',
    questions: [
      {
        question: 'Quale stilista italiano ha fondato la casa di moda con le due "G" incrociate?',
        choices: ['Giorgio Armani', 'Gianni Versace', 'Guccio Gucci', 'Gianfranco Ferré'],
        correct_choice: 2,
      },
      {
        question: 'In quale città si tiene la Fashion Week più importante?',
        choices: ['Londra', 'Milano', 'Parigi', 'New York'],
        correct_choice: 2,
      },
      {
        question: 'Chi è stata la prima direttrice di Vogue?',
        choices: ['Anna Wintour', 'Diana Vreeland', 'Grace Coddington', 'Josephine Redding'],
        correct_choice: 3,
      },
    ],
  },
  {
    id: 'ai-ml',
    label: 'AI e Machine Learning',
    questions: [
      {
        question: 'Cosa significa AI?',
        choices: [
          'Automatic Integration',
          'Artificial Intelligence',
          'Advanced Information',
          'Algorithmic Interface',
        ],
        correct_choice: 1,
      },
      {
        question: 'Chi ha creato ChatGPT?',
        choices: ['Google', 'Meta', 'OpenAI', 'Microsoft'],
        correct_choice: 2,
      },
      {
        question: 'Cosa significa "training" in machine learning?',
        choices: [
          'Testare il modello',
          'Insegnare al modello usando dati',
          'Correggere gli errori',
          'Eliminare i dati inutili',
        ],
        correct_choice: 1,
      },
    ],
  },
  {
    id: 'design-ux',
    label: 'Design e UX',
    questions: [
      {
        question: 'Cosa significa UX?',
        choices: ['User Experience', 'Universal X-design', 'Unique Extension', 'User eXchange'],
        correct_choice: 0,
      },
      {
        question: 'Quale strumento è più usato per il design di interfacce?',
        choices: ['Photoshop', 'Illustrator', 'Figma', 'AutoCAD'],
        correct_choice: 2,
      },
      {
        question: 'Cosa rappresenta la "regola dei terzi" nel design?',
        choices: [
          'Dividere lo spazio in 3 colonne uguali',
          'Usare 3 colori principali',
          'Griglia 3x3 per composizione visiva',
          'Avere 3 livelli di gerarchia',
        ],
        correct_choice: 2,
      },
    ],
  },
  {
    id: 'ecologia',
    label: 'Ecologia e Ambiente',
    questions: [
      {
        question: 'Quale gas è il principale responsabile dell\'effetto serra?',
        choices: ['Ossigeno', 'Azoto', 'Anidride carbonica', 'Elio'],
        correct_choice: 2,
      },
      {
        question: 'Quanto tempo impiega una bottiglia di plastica a decomporsi?',
        choices: ['10 anni', '50 anni', '100 anni', '450 anni'],
        correct_choice: 3,
      },
      {
        question: 'Quale fonte di energia rinnovabile è la più utilizzata al mondo?',
        choices: ['Solare', 'Eolica', 'Idroelettrica', 'Geotermica'],
        correct_choice: 2,
      },
    ],
  },
  {
    id: 'calcio-italiano',
    label: 'Calcio italiano',
    questions: [
      {
        question: 'Quale squadra italiana ha vinto più scudetti?',
        choices: ['Milan', 'Inter', 'Juventus', 'Roma'],
        correct_choice: 2,
      },
      {
        question: 'In quale anno l\'Italia ha vinto il suo ultimo Mondiale?',
        choices: ['1982', '2000', '2006', '2010'],
        correct_choice: 2,
      },
      {
        question: 'Chi è il miglior marcatore della storia della Serie A?',
        choices: ['Francesco Totti', 'Alessandro Del Piero', 'Silvio Piola', 'Giuseppe Meazza'],
        correct_choice: 2,
      },
    ],
  },
  {
    id: 'food-drink',
    label: 'Food & Drink mondiale',
    questions: [
      {
        question: 'Da quale paese proviene il sushi?',
        choices: ['Cina', 'Giappone', 'Corea', 'Thailandia'],
        correct_choice: 1,
      },
      {
        question: 'Quale bevanda viene chiamata "oro nero"?',
        choices: ['Vino rosso', 'Caffè', 'Coca-Cola', 'Petrolio'],
        correct_choice: 1,
      },
      {
        question: 'Quale spezia è la più costosa al mondo?',
        choices: ['Vaniglia', 'Cardamomo', 'Zafferano', 'Cannella'],
        correct_choice: 2,
      },
    ],
  },
  {
    id: 'social-media',
    label: 'Social Media',
    questions: [
      {
        question: 'In quale anno è stato fondato Facebook?',
        choices: ['2002', '2004', '2006', '2008'],
        correct_choice: 1,
      },
      {
        question: 'Quale social network usa l\'uccellino come logo?',
        choices: ['Twitter/X', 'Instagram', 'LinkedIn', 'Pinterest'],
        correct_choice: 0,
      },
      {
        question: 'Quale piattaforma è stata la prima a introdurre le "storie" a tempo?',
        choices: ['Instagram', 'Facebook', 'Snapchat', 'TikTok'],
        correct_choice: 2,
      },
    ],
  },
  {
    id: 'teatro',
    label: 'Teatro',
    questions: [
      {
        question: 'Chi ha scritto "Romeo e Giulietta"?',
        choices: ['Oscar Wilde', 'William Shakespeare', 'Anton Čechov', 'Molière'],
        correct_choice: 1,
      },
      {
        question: 'Come si chiama il sipario che divide il palco dalla platea?',
        choices: ['Velario', 'Boccascena', 'Quarta parete', 'Arcoscenico'],
        correct_choice: 1,
      },
      {
        question: 'Quale commedia teatrale italiana è la più famosa?',
        choices: [
          'La Locandiera',
          'Sei personaggi in cerca d\'autore',
          'La Mandragola',
          'Arlecchino servitore di due padroni',
        ],
        correct_choice: 3,
      },
    ],
  },
  {
    id: 'strumenti',
    label: 'Strumenti musicali',
    questions: [
      {
        question: 'Quante corde ha un violino?',
        choices: ['4', '5', '6', '8'],
        correct_choice: 0,
      },
      {
        question: 'A quale famiglia appartiene il sassofono?',
        choices: ['Ottoni', 'Legni', 'Percussioni', 'Archi'],
        correct_choice: 1,
      },
      {
        question: 'Quale strumento è considerato il re degli strumenti?',
        choices: ['Pianoforte', 'Organo', 'Violino', 'Tromba'],
        correct_choice: 1,
      },
    ],
  },
  {
    id: 'cybersecurity',
    label: 'Cybersecurity',
    questions: [
      {
        question: 'Cosa significa "phishing"?',
        choices: [
          'Pescare dati personali tramite inganno',
          'Hackerare un sistema',
          'Creare virus',
          'Proteggere i dati',
        ],
        correct_choice: 0,
      },
      {
        question: 'Quale di questi è un tipo di malware?',
        choices: ['Cookie', 'Firewall', 'Ransomware', 'Browser'],
        correct_choice: 2,
      },
      {
        question: 'Cosa protegge un firewall?',
        choices: [
          'La temperatura del computer',
          'La rete da accessi non autorizzati',
          'I file da cancellazioni',
          'Lo schermo da rotture',
        ],
        correct_choice: 1,
      },
    ],
  },
]
