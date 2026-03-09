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
]
