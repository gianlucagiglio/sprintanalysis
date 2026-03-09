export type QuizTheme = {
  id: string
  label: string
  questions: { question: string; choices: string[]; correct_choice: number }[]
}

export const quizThemes: QuizTheme[] = [
  {
    id: 'tech',
    label: 'Tech / Programmazione',
    questions: [
      {
        question: 'Quale linguaggio di programmazione è stato creato per primo?',
        choices: ['Python', 'Java', 'C', 'JavaScript'],
        correct_choice: 2,
      },
      {
        question: 'Cosa significa HTML?',
        choices: [
          'Hyper Text Markup Language',
          'High Tech Modern Language',
          'Home Tool Markup Language',
          'Hyperlink and Text Markup Language',
        ],
        correct_choice: 0,
      },
      {
        question: 'Quanti bit ci sono in un byte?',
        choices: ['4', '8', '16', '32'],
        correct_choice: 1,
      },
    ],
  },
  {
    id: 'agile',
    label: 'Agile / Scrum',
    questions: [
      {
        question: 'Cosa significa "Scrum" nel contesto Agile?',
        choices: [
          'Un tipo di bug',
          'Una mischia nel rugby',
          'Un linguaggio',
          'Un database',
        ],
        correct_choice: 1,
      },
      {
        question: 'Quanto dura tipicamente uno Sprint in Scrum?',
        choices: ['1 giorno', '1-4 settimane', '3 mesi', '6 mesi'],
        correct_choice: 1,
      },
      {
        question: 'Chi è responsabile del Product Backlog?',
        choices: [
          'Lo Scrum Master',
          'Il team di sviluppo',
          'Il Product Owner',
          'Il CEO',
        ],
        correct_choice: 2,
      },
    ],
  },
  {
    id: 'sport',
    label: 'Sport',
    questions: [
      {
        question: 'Quanti giocatori ci sono in una squadra di calcio in campo?',
        choices: ['9', '10', '11', '12'],
        correct_choice: 2,
      },
      {
        question: 'In quale sport si usa il termine "ace"?',
        choices: ['Calcio', 'Tennis', 'Basket', 'Nuoto'],
        correct_choice: 1,
      },
      {
        question: 'Ogni quanti anni si svolgono le Olimpiadi estive?',
        choices: ['2', '3', '4', '5'],
        correct_choice: 2,
      },
    ],
  },
  {
    id: 'cinema',
    label: 'Cinema',
    questions: [
      {
        question: 'Chi ha diretto "Il Padrino"?',
        choices: [
          'Martin Scorsese',
          'Francis Ford Coppola',
          'Steven Spielberg',
          'Stanley Kubrick',
        ],
        correct_choice: 1,
      },
      {
        question: 'Quale film ha vinto il primo Oscar come Miglior Film?',
        choices: ['Ali', 'Sunrise', 'The Jazz Singer', 'Metropolis'],
        correct_choice: 0,
      },
      {
        question: 'In quale anno è uscito il primo film di Star Wars?',
        choices: ['1975', '1977', '1979', '1980'],
        correct_choice: 1,
      },
    ],
  },
  {
    id: 'musica',
    label: 'Musica',
    questions: [
      {
        question: 'Quante corde ha una chitarra classica?',
        choices: ['4', '5', '6', '8'],
        correct_choice: 2,
      },
      {
        question: 'Di quale città erano originari i Beatles?',
        choices: ['Londra', 'Manchester', 'Liverpool', 'Birmingham'],
        correct_choice: 2,
      },
      {
        question: 'Quale nota musicale viene dopo il "Do"?',
        choices: ['Mi', 'Re', 'Fa', 'Sol'],
        correct_choice: 1,
      },
    ],
  },
  {
    id: 'geografia',
    label: 'Geografia',
    questions: [
      {
        question: "Qual è la capitale dell'Australia?",
        choices: ['Sydney', 'Melbourne', 'Canberra', 'Perth'],
        correct_choice: 2,
      },
      {
        question: 'Quale è il fiume più lungo del mondo?',
        choices: ['Mississipi', 'Nilo', 'Rio delle Amazzoni', 'Yangtze'],
        correct_choice: 1,
      },
      {
        question: 'Quanti continenti ci sono?',
        choices: ['5', '6', '7', '8'],
        correct_choice: 2,
      },
    ],
  },
  {
    id: 'scienza',
    label: 'Scienza',
    questions: [
      {
        question: "Qual è il simbolo chimico dell'oro?",
        choices: ['Or', 'Au', 'Ag', 'Go'],
        correct_choice: 1,
      },
      {
        question: 'Quale pianeta è il più vicino al Sole?',
        choices: ['Venere', 'Terra', 'Mercurio', 'Marte'],
        correct_choice: 2,
      },
      {
        question: "Qual è la velocità della luce in km/s (approssimata)?",
        choices: ['100.000', '200.000', '300.000', '400.000'],
        correct_choice: 2,
      },
    ],
  },
  {
    id: 'storia',
    label: 'Storia',
    questions: [
      {
        question: 'In che anno è caduto il Muro di Berlino?',
        choices: ['1987', '1989', '1991', '1993'],
        correct_choice: 1,
      },
      {
        question: "Chi era il primo imperatore dell'Impero Romano?",
        choices: ['Giulio Cesare', 'Augusto', 'Nerone', 'Traiano'],
        correct_choice: 1,
      },
      {
        question: "In quale anno Colombo raggiunse l'America?",
        choices: ['1482', '1492', '1502', '1512'],
        correct_choice: 1,
      },
    ],
  },
  {
    id: 'cucina',
    label: 'Cucina italiana',
    questions: [
      {
        question: 'Quale formaggio si usa tradizionalmente nella carbonara?',
        choices: ['Parmigiano', 'Pecorino Romano', 'Grana Padano', 'Mozzarella'],
        correct_choice: 1,
      },
      {
        question: 'Da quale regione proviene la focaccia?',
        choices: ['Toscana', 'Liguria', 'Campania', 'Sicilia'],
        correct_choice: 1,
      },
      {
        question: "Qual è l'ingrediente principale del pesto alla genovese?",
        choices: ['Prezzemolo', 'Rucola', 'Basilico', 'Menta'],
        correct_choice: 2,
      },
    ],
  },
  {
    id: 'cultura-pop',
    label: 'Cultura pop',
    questions: [
      {
        question: 'Come si chiama il protagonista di Breaking Bad?',
        choices: [
          'Jesse Pinkman',
          'Walter White',
          'Saul Goodman',
          'Hank Schrader',
        ],
        correct_choice: 1,
      },
      {
        question: 'Quale azienda ha creato il personaggio di Mario?',
        choices: ['Sega', 'Atari', 'Nintendo', 'Sony'],
        correct_choice: 2,
      },
      {
        question: 'In che anno è stato lanciato il primo iPhone?',
        choices: ['2005', '2006', '2007', '2008'],
        correct_choice: 2,
      },
    ],
  },
  {
    id: 'animali',
    label: 'Animali e Natura',
    questions: [
      {
        question: "Qual è l'animale terrestre più veloce?",
        choices: ['Leone', 'Ghepardo', 'Cavallo', 'Antilope'],
        correct_choice: 1,
      },
      {
        question: 'Quanti stomaci ha una mucca?',
        choices: ['1', '2', '3', '4'],
        correct_choice: 3,
      },
      {
        question: 'Quale animale può dormire fino a 22 ore al giorno?',
        choices: ['Gatto', 'Bradipo', 'Koala', 'Pipistrello'],
        correct_choice: 2,
      },
    ],
  },
  {
    id: 'videogiochi',
    label: 'Videogiochi',
    questions: [
      {
        question: 'In quale anno è uscito il primo gioco di The Legend of Zelda?',
        choices: ['1984', '1986', '1988', '1990'],
        correct_choice: 1,
      },
      {
        question: 'Quale gioco ha venduto più copie nella storia?',
        choices: ['Tetris', 'Minecraft', 'GTA V', 'Wii Sports'],
        correct_choice: 1,
      },
      {
        question: 'Come si chiama la principessa che Mario deve salvare?',
        choices: ['Daisy', 'Rosalinda', 'Peach', 'Zelda'],
        correct_choice: 2,
      },
    ],
  },
  {
    id: 'serie-tv',
    label: 'Serie TV',
    questions: [
      {
        question: 'In quale città è ambientata la serie "Friends"?',
        choices: ['Los Angeles', 'Chicago', 'New York', 'Boston'],
        correct_choice: 2,
      },
      {
        question: 'Quante stagioni ha la serie "Game of Thrones"?',
        choices: ['6', '7', '8', '9'],
        correct_choice: 2,
      },
      {
        question: 'Come si chiama la città fittizia di "Stranger Things"?',
        choices: ['Riverdale', 'Hawkins', 'Springfield', 'Derry'],
        correct_choice: 1,
      },
    ],
  },
  {
    id: 'matematica',
    label: 'Matematica',
    questions: [
      {
        question: 'Quanto fa la radice quadrata di 144?',
        choices: ['10', '11', '12', '14'],
        correct_choice: 2,
      },
      {
        question: "Qual è il valore approssimato di Pi greco?",
        choices: ['2.14', '3.14', '4.14', '3.41'],
        correct_choice: 1,
      },
      {
        question: 'Come si chiama un poligono con 8 lati?',
        choices: ['Esagono', 'Ettagono', 'Ottagono', 'Decagono'],
        correct_choice: 2,
      },
    ],
  },
  {
    id: 'arte',
    label: 'Arte',
    questions: [
      {
        question: 'Chi ha dipinto la Gioconda?',
        choices: ['Michelangelo', 'Raffaello', 'Leonardo da Vinci', 'Caravaggio'],
        correct_choice: 2,
      },
      {
        question: 'In quale museo si trova la Venere di Milo?',
        choices: ['Uffizi', 'British Museum', 'Louvre', 'Prado'],
        correct_choice: 2,
      },
      {
        question: "Quale movimento artistico è associato a Salvador Dalí?",
        choices: ['Cubismo', 'Impressionismo', 'Surrealismo', 'Pop Art'],
        correct_choice: 2,
      },
    ],
  },
  {
    id: 'devops',
    label: 'DevOps / Cloud',
    questions: [
      {
        question: 'Cosa significa CI/CD?',
        choices: [
          'Computer Integration / Computer Delivery',
          'Continuous Integration / Continuous Delivery',
          'Code Inspection / Code Deployment',
          'Central Interface / Central Database',
        ],
        correct_choice: 1,
      },
      {
        question: 'Quale di questi NON è un provider cloud?',
        choices: ['AWS', 'Azure', 'GCP', 'Jenkins'],
        correct_choice: 3,
      },
      {
        question: 'Cosa fa il comando "docker ps"?',
        choices: [
          'Ferma tutti i container',
          'Mostra i container in esecuzione',
          'Crea un nuovo container',
          'Elimina le immagini',
        ],
        correct_choice: 1,
      },
    ],
  },
  {
    id: 'letteratura',
    label: 'Letteratura',
    questions: [
      {
        question: 'Chi ha scritto "La Divina Commedia"?',
        choices: ['Petrarca', 'Boccaccio', 'Dante Alighieri', 'Manzoni'],
        correct_choice: 2,
      },
      {
        question: 'Quale romanzo inizia con "Quel ramo del lago di Como"?',
        choices: [
          'I Malavoglia',
          'I Promessi Sposi',
          'Il Gattopardo',
          'Il Nome della Rosa',
        ],
        correct_choice: 1,
      },
      {
        question: 'Chi ha scritto "1984"?',
        choices: ['Aldous Huxley', 'Ray Bradbury', 'George Orwell', 'Isaac Asimov'],
        correct_choice: 2,
      },
    ],
  },
  {
    id: 'mitologia',
    label: 'Mitologia',
    questions: [
      {
        question: "Chi è il re degli dèi nell'Olimpo greco?",
        choices: ['Poseidone', 'Ade', 'Zeus', 'Apollo'],
        correct_choice: 2,
      },
      {
        question: 'Quale eroe greco ha sconfitto la Medusa?',
        choices: ['Teseo', 'Perseo', 'Eracle', 'Achille'],
        correct_choice: 1,
      },
      {
        question: 'Come si chiama il martello di Thor nella mitologia norrena?',
        choices: ['Gungnir', 'Excalibur', 'Mjolnir', 'Aegis'],
        correct_choice: 2,
      },
    ],
  },
  {
    id: 'startup',
    label: 'Startup / Innovazione',
    questions: [
      {
        question: 'In quale garage è nata Apple?',
        choices: [
          'Menlo Park',
          'Los Altos, California',
          'Seattle',
          'Palo Alto',
        ],
        correct_choice: 1,
      },
      {
        question: "Cosa significa l'acronimo MVP nel contesto startup?",
        choices: [
          'Most Valuable Player',
          'Minimum Viable Product',
          'Maximum Value Proposition',
          'Market Verified Product',
        ],
        correct_choice: 1,
      },
      {
        question: 'Quale azienda ha fondato Elon Musk prima di Tesla?',
        choices: ['SpaceX', 'PayPal', 'Neuralink', 'X.com'],
        correct_choice: 3,
      },
    ],
  },
  {
    id: 'curiosita',
    label: 'Curiosità dal mondo',
    questions: [
      {
        question: 'Quale paese ha più fusi orari?',
        choices: ['Russia', 'USA', 'Francia', 'Cina'],
        correct_choice: 2,
      },
      {
        question: "Qual è l'unico alimento che non scade mai?",
        choices: ['Riso', 'Sale', 'Miele', 'Zucchero'],
        correct_choice: 2,
      },
      {
        question: "Qual è la lingua più parlata al mondo come lingua madre?",
        choices: ['Inglese', 'Spagnolo', 'Cinese mandarino', 'Hindi'],
        correct_choice: 2,
      },
    ],
  },
]
