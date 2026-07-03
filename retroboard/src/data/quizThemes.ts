export type QuizCategory =
  | 'gen-z-tech'
  | 'scienze-umane'
  | 'cultura-geografia'
  | 'entertainment-pop'
  | 'sport-tempo-libero'
  | 'arte-creativita'
  | 'scienza-natura'
  | 'cultura-italiana'
  | 'nerd-geek'
  | 'curiosita'

export type QuizTheme = {
  id: string
  label: string
  category: QuizCategory
  questions: { question: string; choices: string[]; correct_choice: number }[]
}

export const quizCategories: Record<QuizCategory, string> = {
  'gen-z-tech': '🧑‍💻 Gen Z & Tech',
  'scienze-umane': '🧠 Scienze Umane & Società',
  'cultura-geografia': '🌍 Cultura & Geografia',
  'entertainment-pop': '🎮 Entertainment & Pop',
  'sport-tempo-libero': '🏃 Sport & Tempo Libero',
  'arte-creativita': '🎨 Arte & Creatività',
  'scienza-natura': '🔬 Scienza & Natura',
  'cultura-italiana': '🎭 Cultura Italiana',
  'nerd-geek': '🤓 Nerd & Geek',
  'curiosita': '💡 Curiosità',
}

export const quizThemes: QuizTheme[] = [
  {
    id: 'gen-z',
    label: 'Gen Z e cultura digitale',
    category: 'gen-z-tech',
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
    category: 'scienza-natura',
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
    category: 'arte-creativita',
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
    category: 'sport-tempo-libero',
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
    category: 'scienze-umane',
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
    category: 'scienze-umane',
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
    category: 'scienze-umane',
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
    category: 'arte-creativita',
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
    category: 'arte-creativita',
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
    category: 'gen-z-tech',
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
    category: 'gen-z-tech',
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
    category: 'scienza-natura',
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
    category: 'sport-tempo-libero',
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
    category: 'cultura-geografia',
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
    category: 'gen-z-tech',
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
    category: 'arte-creativita',
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
    category: 'arte-creativita',
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
    category: 'gen-z-tech',
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
  {
    id: 'capitali',
    label: 'Capitali del mondo',
    category: 'cultura-geografia',
    questions: [
      {
        question: 'Qual è la capitale del Kazakistan?',
        choices: ['Almaty', 'Astana', 'Bishkek', 'Tashkent'],
        correct_choice: 1,
      },
      {
        question: 'Quale di queste è la capitale della Svizzera?',
        choices: ['Zurigo', 'Ginevra', 'Berna', 'Losanna'],
        correct_choice: 2,
      },
      {
        question: 'Qual è la capitale del Myanmar (ex Birmania)?',
        choices: ['Yangon', 'Naypyidaw', 'Mandalay', 'Bangkok'],
        correct_choice: 1,
      },
    ],
  },
  {
    id: 'bandiere',
    label: 'Bandiere e simboli',
    category: 'cultura-geografia',
    questions: [
      {
        question: 'Quale paese ha una bandiera con una foglia d\'acero?',
        choices: ['USA', 'Canada', 'Irlanda', 'Nuova Zelanda'],
        correct_choice: 1,
      },
      {
        question: 'Quante stelle ha la bandiera europea?',
        choices: ['12', '15', '27', '28'],
        correct_choice: 0,
      },
      {
        question: 'Quale paese ha una bandiera completamente non rettangolare?',
        choices: ['Svizzera', 'Nepal', 'Vaticano', 'Monaco'],
        correct_choice: 1,
      },
    ],
  },
  {
    id: 'unesco',
    label: 'Patrimoni UNESCO',
    category: 'cultura-geografia',
    questions: [
      {
        question: 'In quale paese si trova Machu Picchu?',
        choices: ['Messico', 'Bolivia', 'Perù', 'Ecuador'],
        correct_choice: 2,
      },
      {
        question: 'Quale città italiana ha più siti UNESCO?',
        choices: ['Roma', 'Venezia', 'Firenze', 'Napoli'],
        correct_choice: 0,
      },
      {
        question: 'In quale anno è stata costruita la Grande Muraglia Cinese?',
        choices: ['III secolo a.C.', 'V secolo d.C.', 'X secolo d.C.', 'XV secolo d.C.'],
        correct_choice: 0,
      },
    ],
  },
  {
    id: 'lingue',
    label: 'Lingue del mondo',
    category: 'cultura-geografia',
    questions: [
      {
        question: 'Quante lingue ufficiali ha l\'India?',
        choices: ['1', '2', '22', '100+'],
        correct_choice: 2,
      },
      {
        question: 'Quale alfabeto usa la lingua russa?',
        choices: ['Latino', 'Cirillico', 'Greco', 'Arabo'],
        correct_choice: 1,
      },
      {
        question: 'Quale lingua artificiale è stata creata per facilitare la comunicazione internazionale?',
        choices: ['Latino', 'Esperanto', 'Klingon', 'Elvish'],
        correct_choice: 1,
      },
    ],
  },
  {
    id: 'cucina-regionale',
    label: 'Cucina regionale italiana',
    category: 'cultura-geografia',
    questions: [
      {
        question: 'Da quale regione proviene la pizza napoletana?',
        choices: ['Lazio', 'Campania', 'Sicilia', 'Puglia'],
        correct_choice: 1,
      },
      {
        question: 'Quale regione è famosa per il risotto alla milanese?',
        choices: ['Piemonte', 'Veneto', 'Lombardia', 'Emilia-Romagna'],
        correct_choice: 2,
      },
      {
        question: 'Quale pasta tipica viene dalla Sardegna?',
        choices: ['Orecchiette', 'Fregola', 'Trofie', 'Pici'],
        correct_choice: 1,
      },
    ],
  },
  {
    id: 'vini',
    label: 'Vini e bevande',
    category: 'cultura-geografia',
    questions: [
      {
        question: 'Da quale uva si produce il Barolo?',
        choices: ['Sangiovese', 'Nebbiolo', 'Barbera', 'Montepulciano'],
        correct_choice: 1,
      },
      {
        question: 'Quale ingrediente caratterizza il cocktail Mojito?',
        choices: ['Basilico', 'Menta', 'Rosmarino', 'Timo'],
        correct_choice: 1,
      },
      {
        question: 'In quale paese è nata la birra Guinness?',
        choices: ['Scozia', 'Inghilterra', 'Irlanda', 'Galles'],
        correct_choice: 2,
      },
    ],
  },
  {
    id: 'anime',
    label: 'Anime e Manga',
    category: 'entertainment-pop',
    questions: [
      {
        question: 'Chi è il protagonista di "Naruto"?',
        choices: ['Sasuke Uchiha', 'Naruto Uzumaki', 'Kakashi Hatake', 'Itachi Uchiha'],
        correct_choice: 1,
      },
      {
        question: 'Quale anime ha come protagonista un alchimista con un braccio meccanico?',
        choices: ['Attack on Titan', 'Fullmetal Alchemist', 'Death Note', 'Bleach'],
        correct_choice: 1,
      },
      {
        question: 'Quale studio ha prodotto "Il mio vicino Totoro"?',
        choices: ['Studio Pierrot', 'Studio Ghibli', 'Madhouse', 'Toei Animation'],
        correct_choice: 1,
      },
    ],
  },
  {
    id: 'meme',
    label: 'Meme e Internet Culture',
    category: 'entertainment-pop',
    questions: [
      {
        question: 'Quale animale è protagonista del meme "Doge"?',
        choices: ['Gatto', 'Cane Shiba Inu', 'Criceto', 'Panda'],
        correct_choice: 1,
      },
      {
        question: 'Cosa significa "F" nella chat per mostrare rispetto?',
        choices: [
          'Forever',
          'Fail',
          'Press F to pay respects',
          'Friendship',
        ],
        correct_choice: 2,
      },
      {
        question: 'Quale social ha reso popolare il Rickrolling?',
        choices: ['Facebook', 'YouTube', 'Twitter', 'Reddit'],
        correct_choice: 1,
      },
    ],
  },
  {
    id: 'podcasting',
    label: 'Podcasting',
    category: 'entertainment-pop',
    questions: [
      {
        question: 'Quale podcast italiano è il più ascoltato?',
        choices: ['Muschio Selvaggio', 'Il Podcast di Alessandro Barbero', 'Tintoria', 'Decanter'],
        correct_choice: 0,
      },
      {
        question: 'In quale anno è nato il primo podcast?',
        choices: ['2000', '2004', '2008', '2010'],
        correct_choice: 1,
      },
      {
        question: 'Cosa significa "podcast"?',
        choices: [
          'Portable On Demand Broadcast',
          'Public Online Digital Cast',
          'iPod + Broadcast',
          'Personal Online Discussion Cast',
        ],
        correct_choice: 2,
      },
    ],
  },
  {
    id: 'streaming',
    label: 'Streaming Wars',
    category: 'entertainment-pop',
    questions: [
      {
        question: 'Quale è stata la prima serie originale Netflix?',
        choices: ['Stranger Things', 'House of Cards', 'Orange is the New Black', 'Narcos'],
        correct_choice: 1,
      },
      {
        question: 'Quale piattaforma ha prodotto "The Mandalorian"?',
        choices: ['Netflix', 'Amazon Prime', 'Disney+', 'HBO Max'],
        correct_choice: 2,
      },
      {
        question: 'In quale anno è stato lanciato Netflix streaming?',
        choices: ['2005', '2007', '2010', '2012'],
        correct_choice: 1,
      },
    ],
  },
  {
    id: 'esports',
    label: 'Gaming eSports',
    category: 'entertainment-pop',
    questions: [
      {
        question: 'Quale gioco ha il torneo "The International"?',
        choices: ['League of Legends', 'Dota 2', 'Counter-Strike', 'Fortnite'],
        correct_choice: 1,
      },
      {
        question: 'Quale paese domina negli eSports?',
        choices: ['USA', 'Giappone', 'Corea del Sud', 'Cina'],
        correct_choice: 2,
      },
      {
        question: 'Quale gioco è più popolare negli eSports FPS?',
        choices: ['Valorant', 'CS:GO', 'Call of Duty', 'Overwatch'],
        correct_choice: 1,
      },
    ],
  },
  {
    id: 'youtube',
    label: 'YouTube e Creator',
    category: 'entertainment-pop',
    questions: [
      {
        question: 'Chi è lo YouTuber con più iscritti al mondo?',
        choices: ['PewDiePie', 'MrBeast', 'T-Series', 'Dude Perfect'],
        correct_choice: 2,
      },
      {
        question: 'Quale fu il primo video caricato su YouTube?',
        choices: [
          'Charlie bit my finger',
          'Me at the zoo',
          'Evolution of Dance',
          'Numa Numa',
        ],
        correct_choice: 1,
      },
      {
        question: 'In quale anno è stato fondato YouTube?',
        choices: ['2003', '2005', '2007', '2009'],
        correct_choice: 1,
      },
    ],
  },
  {
    id: 'nba',
    label: 'NBA e Basket',
    category: 'sport-tempo-libero',
    questions: [
      {
        question: 'Chi ha vinto più titoli NBA?',
        choices: ['Michael Jordan', 'Bill Russell', 'LeBron James', 'Kobe Bryant'],
        correct_choice: 1,
      },
      {
        question: 'Quale squadra ha vinto più campionati NBA?',
        choices: ['Los Angeles Lakers', 'Boston Celtics', 'Chicago Bulls', 'Golden State Warriors'],
        correct_choice: 1,
      },
      {
        question: 'Quanti giocatori ci sono in campo per squadra nel basket?',
        choices: ['4', '5', '6', '7'],
        correct_choice: 1,
      },
    ],
  },
  {
    id: 'tennis',
    label: 'Tennis',
    category: 'sport-tempo-libero',
    questions: [
      {
        question: 'Quanti tornei del Grande Slam ci sono in un anno?',
        choices: ['2', '3', '4', '5'],
        correct_choice: 2,
      },
      {
        question: 'Quale tennista italiano ha vinto più tornei Slam?',
        choices: ['Adriano Panatta', 'Nicola Pietrangeli', 'Jannik Sinner', 'Matteo Berrettini'],
        correct_choice: 0,
      },
      {
        question: 'Su quale superficie si gioca Wimbledon?',
        choices: ['Terra battuta', 'Erba', 'Cemento', 'Sintetico'],
        correct_choice: 1,
      },
    ],
  },
  {
    id: 'motogp',
    label: 'MotoGP',
    category: 'sport-tempo-libero',
    questions: [
      {
        question: 'Quanti mondiali MotoGP ha vinto Valentino Rossi?',
        choices: ['7', '9', '11', '13'],
        correct_choice: 1,
      },
      {
        question: 'Quale numero ha reso famoso Valentino Rossi?',
        choices: ['9', '27', '46', '93'],
        correct_choice: 2,
      },
      {
        question: 'In quale circuito si corre il GP d\'Italia?',
        choices: ['Misano', 'Mugello', 'Monza', 'Imola'],
        correct_choice: 1,
      },
    ],
  },
  {
    id: 'rugby',
    label: 'Rugby',
    category: 'sport-tempo-libero',
    questions: [
      {
        question: 'Quanti giocatori ci sono in una squadra di rugby?',
        choices: ['11', '13', '15', '17'],
        correct_choice: 2,
      },
      {
        question: 'Quale nazione domina il rugby mondiale?',
        choices: ['Inghilterra', 'Australia', 'Nuova Zelanda', 'Sudafrica'],
        correct_choice: 2,
      },
      {
        question: 'Come si chiama il torneo delle 6 nazioni europee?',
        choices: ['Six Nations Championship', 'European Rugby Cup', 'Continental Trophy', 'Euro Rugby'],
        correct_choice: 0,
      },
    ],
  },
  {
    id: 'olimpiadi',
    label: 'Olimpiadi',
    category: 'sport-tempo-libero',
    questions: [
      {
        question: 'In quale città si sono tenute le prime Olimpiadi moderne?',
        choices: ['Parigi', 'Londra', 'Atene', 'Roma'],
        correct_choice: 2,
      },
      {
        question: 'Chi detiene il record dei 100 metri?',
        choices: ['Carl Lewis', 'Usain Bolt', 'Asafa Powell', 'Tyson Gay'],
        correct_choice: 1,
      },
      {
        question: 'Quale atleta ha vinto più medaglie olimpiche?',
        choices: ['Usain Bolt', 'Michael Phelps', 'Simone Biles', 'Carl Lewis'],
        correct_choice: 1,
      },
    ],
  },
  {
    id: 'sport-estremi',
    label: 'Sport estremi',
    category: 'sport-tempo-libero',
    questions: [
      {
        question: 'Cosa significa "BASE" in BASE jumping?',
        choices: [
          'Basic Air Sports Equipment',
          'Building, Antenna, Span, Earth',
          'Brave Athletes Stunts Extreme',
          'Below Air Space Equipment',
        ],
        correct_choice: 1,
      },
      {
        question: 'Quale sport estremo prevede discese su roccia?',
        choices: ['Bungee jumping', 'Parapendio', 'Free climbing', 'Parkour'],
        correct_choice: 2,
      },
      {
        question: 'In quale sport si usa una tavola su onde giganti?',
        choices: ['Windsurf', 'Kitesurf', 'Big wave surfing', 'Wakeboard'],
        correct_choice: 2,
      },
    ],
  },
  {
    id: 'fotografia',
    label: 'Fotografia',
    category: 'arte-creativita',
    questions: [
      {
        question: 'Cosa indica il valore ISO in fotografia?',
        choices: [
          'La messa a fuoco',
          'La sensibilità alla luce',
          'La velocità dell\'otturatore',
          'L\'apertura del diaframma',
        ],
        correct_choice: 1,
      },
      {
        question: 'Quale formato di file è senza perdita di qualità?',
        choices: ['JPEG', 'PNG', 'RAW', 'GIF'],
        correct_choice: 2,
      },
      {
        question: 'Chi ha inventato la fotografia?',
        choices: ['George Eastman', 'Louis Daguerre', 'Thomas Edison', 'Alexander Graham Bell'],
        correct_choice: 1,
      },
    ],
  },
  {
    id: 'fumetti-italiani',
    label: 'Fumetti italiani',
    category: 'arte-creativita',
    questions: [
      {
        question: 'Chi è l\'autore di Dylan Dog?',
        choices: ['Sergio Bonelli', 'Tiziano Sclavi', 'Guido Crepax', 'Hugo Pratt'],
        correct_choice: 1,
      },
      {
        question: 'Quale personaggio vive a Darkwood?',
        choices: ['Tex Willer', 'Zagor', 'Dylan Dog', 'Martin Mystère'],
        correct_choice: 2,
      },
      {
        question: 'Chi ha creato Corto Maltese?',
        choices: ['Dino Battaglia', 'Hugo Pratt', 'Milo Manara', 'Guido Crepax'],
        correct_choice: 1,
      },
    ],
  },
  {
    id: 'street-art',
    label: 'Street Art',
    category: 'arte-creativita',
    questions: [
      {
        question: 'Quale città è considerata la capitale mondiale della street art?',
        choices: ['New York', 'Berlino', 'Londra', 'San Paolo'],
        correct_choice: 1,
      },
      {
        question: 'Quale artista di strada è rimasto anonimo?',
        choices: ['Shepard Fairey', 'Banksy', 'Keith Haring', 'Jean-Michel Basquiat'],
        correct_choice: 1,
      },
      {
        question: 'Cosa significa "tag" nella street art?',
        choices: [
          'Un\'opera complessa',
          'La firma dell\'artista',
          'Un murale grande',
          'Uno stencil',
        ],
        correct_choice: 1,
      },
    ],
  },
  {
    id: 'cinema-italiano',
    label: 'Cinema italiano',
    category: 'arte-creativita',
    questions: [
      {
        question: 'Chi ha diretto "La vita è bella"?',
        choices: ['Nanni Moretti', 'Roberto Benigni', 'Giuseppe Tornatore', 'Paolo Sorrentino'],
        correct_choice: 1,
      },
      {
        question: 'Quale attore italiano ha vinto più Oscar?',
        choices: ['Marcello Mastroianni', 'Roberto Benigni', 'Sophia Loren', 'Anna Magnani'],
        correct_choice: 1,
      },
      {
        question: 'Chi ha diretto "Nuovo Cinema Paradiso"?',
        choices: ['Federico Fellini', 'Vittorio De Sica', 'Giuseppe Tornatore', 'Luchino Visconti'],
        correct_choice: 2,
      },
    ],
  },
  {
    id: 'oscar',
    label: 'Oscar e premi',
    category: 'arte-creativita',
    questions: [
      {
        question: 'Quale film ha vinto più Oscar nella storia?',
        choices: ['Titanic', 'Ben-Hur', 'Il Signore degli Anelli: Il ritorno del re', 'Tutti e tre con 11'],
        correct_choice: 3,
      },
      {
        question: 'Chi ha vinto più Oscar come attore?',
        choices: ['Jack Nicholson', 'Daniel Day-Lewis', 'Meryl Streep', 'Katharine Hepburn'],
        correct_choice: 3,
      },
      {
        question: 'Quale film ha vinto il primo Oscar per il miglior film?',
        choices: ['Wings', 'Sunrise', 'The Jazz Singer', 'Metropolis'],
        correct_choice: 0,
      },
    ],
  },
  {
    id: 'medicina',
    label: 'Medicina',
    category: 'scienza-natura',
    questions: [
      {
        question: 'Quanti gruppi sanguigni esistono nel sistema ABO?',
        choices: ['2', '4', '6', '8'],
        correct_choice: 1,
      },
      {
        question: 'Chi ha scoperto la penicillina?',
        choices: ['Louis Pasteur', 'Alexander Fleming', 'Robert Koch', 'Edward Jenner'],
        correct_choice: 1,
      },
      {
        question: 'Quale organo produce l\'insulina?',
        choices: ['Fegato', 'Pancreas', 'Reni', 'Milza'],
        correct_choice: 1,
      },
    ],
  },
  {
    id: 'dinosauri',
    label: 'Dinosauri',
    category: 'scienza-natura',
    questions: [
      {
        question: 'Quale dinosauro aveva il collo più lungo?',
        choices: ['Brachiosaurus', 'Diplodocus', 'Apatosaurus', 'Argentinosauro'],
        correct_choice: 3,
      },
      {
        question: 'In quale periodo vivevano i dinosauri?',
        choices: ['Paleozoico', 'Mesozoico', 'Cenozoico', 'Precambriano'],
        correct_choice: 1,
      },
      {
        question: 'Cosa significa "Tyrannosaurus Rex"?',
        choices: [
          'Lucertola gigante',
          'Re lucertola tiranno',
          'Predatore supremo',
          'Bestia terribile',
        ],
        correct_choice: 1,
      },
    ],
  },
  {
    id: 'fisica-quantistica',
    label: 'Fisica quantistica',
    category: 'scienza-natura',
    questions: [
      {
        question: 'Chi ha formulato il principio di indeterminazione?',
        choices: ['Albert Einstein', 'Niels Bohr', 'Werner Heisenberg', 'Erwin Schrödinger'],
        correct_choice: 2,
      },
      {
        question: 'Cosa descrive l\'esperimento del gatto di Schrödinger?',
        choices: [
          'La gravità',
          'La sovrapposizione quantistica',
          'La teoria della relatività',
          'L\'energia nucleare',
        ],
        correct_choice: 1,
      },
      {
        question: 'Cosa sono i quanti?',
        choices: [
          'Particelle grandissime',
          'Pacchetti discreti di energia',
          'Onde luminose',
          'Atomi pesanti',
        ],
        correct_choice: 1,
      },
    ],
  },
  {
    id: 'chimica-organica',
    label: 'Chimica organica',
    category: 'scienza-natura',
    questions: [
      {
        question: 'Quale elemento è alla base della chimica organica?',
        choices: ['Ossigeno', 'Idrogeno', 'Carbonio', 'Azoto'],
        correct_choice: 2,
      },
      {
        question: 'Cosa sono gli idrocarburi?',
        choices: [
          'Composti di carbonio e ossigeno',
          'Composti di carbonio e idrogeno',
          'Composti di idrogeno e ossigeno',
          'Composti di carbonio e azoto',
        ],
        correct_choice: 1,
      },
      {
        question: 'Quale formula ha il metano?',
        choices: ['CH4', 'C2H6', 'CH3OH', 'CO2'],
        correct_choice: 0,
      },
    ],
  },
  {
    id: 'biologia-marina',
    label: 'Biologia marina',
    category: 'scienza-natura',
    questions: [
      {
        question: 'Quale animale marino ha tre cuori?',
        choices: ['Polpo', 'Calamaro gigante', 'Balena', 'Delfino'],
        correct_choice: 0,
      },
      {
        question: 'Qual è l\'animale marino più grande?',
        choices: ['Squalo balena', 'Balenottera azzurra', 'Capodoglio', 'Calamaro gigante'],
        correct_choice: 1,
      },
      {
        question: 'A quale profondità si trovano gli abissi oceanici?',
        choices: ['500 metri', '1000 metri', '2000 metri', '6000+ metri'],
        correct_choice: 3,
      },
    ],
  },
  {
    id: 'meteorologia',
    label: 'Meteorologia',
    category: 'scienza-natura',
    questions: [
      {
        question: 'Cosa causa il vento?',
        choices: [
          'La rotazione terrestre',
          'Le differenze di pressione atmosferica',
          'La Luna',
          'Le correnti oceaniche',
        ],
        correct_choice: 1,
      },
      {
        question: 'Come si forma un uragano?',
        choices: [
          'Dall\'incontro di aria calda e fredda',
          'Dall\'evaporazione dell\'acqua oceanica calda',
          'Dai terremoti sottomarini',
          'Dalle eruzioni vulcaniche',
        ],
        correct_choice: 1,
      },
      {
        question: 'Quale strumento misura la pressione atmosferica?',
        choices: ['Termometro', 'Barometro', 'Anemometro', 'Igrometro'],
        correct_choice: 1,
      },
    ],
  },
  {
    id: 'cinema-italiano-vintage',
    label: 'Cinema italiano anni \'60-\'80',
    category: 'cultura-italiana',
    questions: [
      {
        question: 'Chi ha diretto "8½"?',
        choices: ['Federico Fellini', 'Michelangelo Antonioni', 'Luchino Visconti', 'Pier Paolo Pasolini'],
        correct_choice: 0,
      },
      {
        question: 'Quale attore ha interpretato Don Camillo?',
        choices: ['Totò', 'Alberto Sordi', 'Fernandel', 'Vittorio Gassman'],
        correct_choice: 2,
      },
      {
        question: 'Chi ha diretto "C\'eravamo tanto amati"?',
        choices: ['Dino Risi', 'Ettore Scola', 'Mario Monicelli', 'Luigi Comencini'],
        correct_choice: 1,
      },
    ],
  },
  {
    id: 'cantautori',
    label: 'Cantautori italiani',
    category: 'cultura-italiana',
    questions: [
      {
        question: 'Chi ha scritto "La canzone del maggio"?',
        choices: ['Francesco Guccini', 'Fabrizio De André', 'Giorgio Gaber', 'Lucio Battisti'],
        correct_choice: 0,
      },
      {
        question: 'Quale cantautore è nato a Genova?',
        choices: ['Lucio Dalla', 'Fabrizio De André', 'Francesco De Gregori', 'Antonello Venditti'],
        correct_choice: 1,
      },
      {
        question: 'Chi ha scritto "Caruso"?',
        choices: ['Lucio Battisti', 'Lucio Dalla', 'Claudio Baglioni', 'Renato Zero'],
        correct_choice: 1,
      },
    ],
  },
  {
    id: 'dialetti',
    label: 'Dialetti e modi di dire',
    category: 'cultura-italiana',
    questions: [
      {
        question: 'Cosa significa "boh" in milanese?',
        choices: ['Non lo so', 'Forse', 'Probabilmente', 'Difficile'],
        correct_choice: 0,
      },
      {
        question: 'Quale città usa il detto "A facc\' ro cazone"?',
        choices: ['Roma', 'Milano', 'Napoli', 'Palermo'],
        correct_choice: 2,
      },
      {
        question: 'Cosa significa "Belin" in genovese?',
        choices: ['Ciao', 'Esclamazione generica', 'Grazie', 'Arrivederci'],
        correct_choice: 1,
      },
    ],
  },
  {
    id: 'storia-italia',
    label: 'Storia d\'Italia',
    category: 'cultura-italiana',
    questions: [
      {
        question: 'In quale anno è nata la Repubblica Italiana?',
        choices: ['1945', '1946', '1947', '1948'],
        correct_choice: 1,
      },
      {
        question: 'Chi fu il primo Re d\'Italia?',
        choices: ['Vittorio Emanuele I', 'Vittorio Emanuele II', 'Umberto I', 'Carlo Alberto'],
        correct_choice: 1,
      },
      {
        question: 'In quale anno avvenne l\'Unità d\'Italia?',
        choices: ['1848', '1861', '1870', '1918'],
        correct_choice: 1,
      },
    ],
  },
  {
    id: 'sanremo',
    label: 'Sanremo',
    category: 'cultura-italiana',
    questions: [
      {
        question: 'In quale anno è nato il Festival di Sanremo?',
        choices: ['1945', '1951', '1960', '1965'],
        correct_choice: 1,
      },
      {
        question: 'Chi ha vinto più volte Sanremo?',
        choices: ['Domenico Modugno', 'Claudio Villa', 'Eros Ramazzotti', 'Laura Pausini'],
        correct_choice: 1,
      },
      {
        question: 'In quale teatro si svolge il Festival?',
        choices: ['Teatro Ariston', 'Teatro alla Scala', 'Teatro dell\'Opera', 'Teatro Regio'],
        correct_choice: 0,
      },
    ],
  },
  {
    id: 'tv-italiana',
    label: 'TV italiana',
    category: 'cultura-italiana',
    questions: [
      {
        question: 'Chi ha condotto "Lascia o raddoppia"?',
        choices: ['Mike Bongiorno', 'Raimondo Vianello', 'Corrado', 'Enzo Tortora'],
        correct_choice: 0,
      },
      {
        question: 'Quale programma ha lanciato Raffaella Carrà?',
        choices: ['Fantastico', 'Carramba che sorpresa', 'Pronto, Raffaella?', 'Tutti e tre'],
        correct_choice: 3,
      },
      {
        question: 'In quale anno è iniziata la TV a colori in Italia?',
        choices: ['1970', '1975', '1977', '1980'],
        correct_choice: 2,
      },
    ],
  },
  {
    id: 'star-wars',
    label: 'Star Wars Extended',
    category: 'nerd-geek',
    questions: [
      {
        question: 'Come si chiama il pianeta natale di Luke Skywalker?',
        choices: ['Tatooine', 'Alderaan', 'Naboo', 'Coruscant'],
        correct_choice: 0,
      },
      {
        question: 'Quale è il vero nome di Darth Vader?',
        choices: ['Anakin Skywalker', 'Obi-Wan Kenobi', 'Qui-Gon Jinn', 'Mace Windu'],
        correct_choice: 0,
      },
      {
        question: 'Chi è il maestro di Yoda?',
        choices: ['Nessuno', 'N\'Kata Del Gormo', 'Qui-Gon Jinn', 'Count Dooku'],
        correct_choice: 1,
      },
    ],
  },
  {
    id: 'harry-potter',
    label: 'Harry Potter',
    category: 'nerd-geek',
    questions: [
      {
        question: 'Quale casa di Hogwarts ha come animale il tasso?',
        choices: ['Grifondoro', 'Serpeverde', 'Corvonero', 'Tassorosso'],
        correct_choice: 3,
      },
      {
        question: 'Come si chiama il gufo di Harry?',
        choices: ['Edvige', 'Errol', 'Pigwidgeon', 'Hermes'],
        correct_choice: 0,
      },
      {
        question: 'Quale incantesimo evoca un Patronus?',
        choices: ['Expecto Patronum', 'Wingardium Leviosa', 'Expelliarmus', 'Lumos'],
        correct_choice: 0,
      },
    ],
  },
  {
    id: 'lotr',
    label: 'Il Signore degli Anelli',
    category: 'nerd-geek',
    questions: [
      {
        question: 'Come si chiama la spada di Aragorn?',
        choices: ['Anduril', 'Narsil', 'Sting', 'Glamdring'],
        correct_choice: 0,
      },
      {
        question: 'Quale razza appartiene Gimli?',
        choices: ['Elfo', 'Nano', 'Hobbit', 'Uomo'],
        correct_choice: 1,
      },
      {
        question: 'Chi è l\'autore de "Il Signore degli Anelli"?',
        choices: ['C.S. Lewis', 'J.R.R. Tolkien', 'George R.R. Martin', 'J.K. Rowling'],
        correct_choice: 1,
      },
    ],
  },
  {
    id: 'mcu',
    label: 'Marvel Cinematic Universe',
    category: 'nerd-geek',
    questions: [
      {
        question: 'Quale è stato il primo film del MCU?',
        choices: ['Iron Man', 'Hulk', 'Thor', 'Captain America'],
        correct_choice: 0,
      },
      {
        question: 'Quante Gemme dell\'Infinito esistono?',
        choices: ['4', '5', '6', '7'],
        correct_choice: 2,
      },
      {
        question: 'Chi è il regista di Avengers: Endgame?',
        choices: ['Joss Whedon', 'Fratelli Russo', 'Jon Favreau', 'James Gunn'],
        correct_choice: 1,
      },
    ],
  },
  {
    id: 'dnd',
    label: 'D&D e Giochi di ruolo',
    category: 'nerd-geek',
    questions: [
      {
        question: 'Quale dado si usa più spesso in D&D?',
        choices: ['d4', 'd8', 'd20', 'd100'],
        correct_choice: 2,
      },
      {
        question: 'Come si chiama il narratore in D&D?',
        choices: ['Game Master', 'Dungeon Master', 'Story Teller', 'Narrator'],
        correct_choice: 1,
      },
      {
        question: 'Quale classe usa magie arcane?',
        choices: ['Guerriero', 'Ladro', 'Mago', 'Barbaro'],
        correct_choice: 2,
      },
    ],
  },
  {
    id: 'retro-computing',
    label: 'Retro Computing',
    category: 'nerd-geek',
    questions: [
      {
        question: 'Quale computer Commodore fu il più venduto?',
        choices: ['Commodore 64', 'Amiga 500', 'VIC-20', 'PET'],
        correct_choice: 0,
      },
      {
        question: 'Quale sistema operativo usava MS-DOS?',
        choices: ['Unix', 'Linux', 'DOS', 'Windows 95'],
        correct_choice: 2,
      },
      {
        question: 'In quale anno è uscito il primo IBM PC?',
        choices: ['1977', '1981', '1984', '1990'],
        correct_choice: 1,
      },
    ],
  },
  {
    id: 'guinness',
    label: 'Guinness dei primati',
    category: 'curiosita',
    questions: [
      {
        question: 'Qual è l\'uomo più alto della storia?',
        choices: ['Robert Wadlow (2.72m)', 'Sultan Kösen (2.51m)', 'John Rogan (2.67m)', 'Väinö Myllyrinne (2.51m)'],
        correct_choice: 0,
      },
      {
        question: 'Quale è il record di hot dog mangiati in 10 minuti?',
        choices: ['50', '66', '76', '83'],
        correct_choice: 2,
      },
      {
        question: 'Qual è l\'animale più veloce del mondo?',
        choices: ['Ghepardo', 'Falco pellegrino', 'Pesce vela', 'Antilope'],
        correct_choice: 1,
      },
    ],
  },
  {
    id: 'complotti',
    label: 'Complotti e leggende',
    category: 'curiosita',
    questions: [
      {
        question: 'Quale teoria sostiene che la Terra sia piatta?',
        choices: ['Terrapiattismo', 'Geocentrismo', 'Creazionismo', 'Illuminismo'],
        correct_choice: 0,
      },
      {
        question: 'In quale anno sarebbe avvenuto il finto allunaggio secondo i complottisti?',
        choices: ['1965', '1969', '1972', '1975'],
        correct_choice: 1,
      },
      {
        question: 'Quale gruppo segreto dominerebbe il mondo secondo le teorie?',
        choices: ['Illuminati', 'Freemasons', 'Bilderberg', 'Tutti e tre'],
        correct_choice: 3,
      },
    ],
  },
  {
    id: 'true-crime',
    label: 'True Crime',
    category: 'curiosita',
    questions: [
      {
        question: 'Chi era lo Squartatore di Whitechapel?',
        choices: ['Jack lo Squartatore', 'Lo Zodiaco', 'Ted Bundy', 'Jeffrey Dahmer'],
        correct_choice: 0,
      },
      {
        question: 'Quale serial killer italiano è noto come "Il Mostro di Firenze"?',
        choices: ['Mai identificato', 'Donato Bilancia', 'Roberto Succo', 'Ludwig'],
        correct_choice: 0,
      },
      {
        question: 'Quale psicologo ha studiato la mente criminale?',
        choices: ['Sigmund Freud', 'Carl Jung', 'Robert Hare', 'B.F. Skinner'],
        correct_choice: 2,
      },
    ],
  },
  {
    id: 'paranormale',
    label: 'Paranormale e misteri',
    category: 'curiosita',
    questions: [
      {
        question: 'Dove si trova il Triangolo delle Bermuda?',
        choices: ['Oceano Pacifico', 'Oceano Atlantico', 'Mar Mediterraneo', 'Oceano Indiano'],
        correct_choice: 1,
      },
      {
        question: 'Quale castello italiano è considerato il più infestato?',
        choices: ['Castello di Bran', 'Castello di Montebello', 'Castello di Edimburgo', 'Torre di Londra'],
        correct_choice: 1,
      },
      {
        question: 'Come si chiamano i cerchi nel grano?',
        choices: ['Crop circles', 'Grain circles', 'Field marks', 'UFO signs'],
        correct_choice: 0,
      },
    ],
  },
  {
    id: 'pub-trivia',
    label: 'Quiz da pub trivia',
    category: 'curiosita',
    questions: [
      {
        question: 'Quale è l\'unico cibo che non va mai a male?',
        choices: ['Sale', 'Riso', 'Miele', 'Zucchero'],
        correct_choice: 2,
      },
      {
        question: 'Quante volte al giorno le lancette dell\'orologio si sovrappongono?',
        choices: ['22', '24', '12', '11'],
        correct_choice: 0,
      },
      {
        question: 'Quale frutto ha i semi all\'esterno?',
        choices: ['Fragola', 'Lampone', 'Melograno', 'Kiwi'],
        correct_choice: 0,
      },
    ],
  },
]
