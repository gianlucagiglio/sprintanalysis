const categoryRules: Record<string, string[]> = {
  "Cibo & Ristoranti": [
    "ristorante", "restaurant", "pizz", "bar ", "cafe", "caffè", "mcdonald",
    "burger", "sushi", "trattoria", "osteria", "food", "eat", "deliveroo",
    "glovo", "just eat", "uber eats", "panino", "gelateria", "pasticceria",
  ],
  "Trasporti": [
    "uber", "taxi", "benzina", "carburante", "eni", "q8", "ip ",
    "autostrada", "telepass", "trenitalia", "italo", "atm ", "metro",
    "bus", "parcheggio", "parking", "bolt", "free now",
  ],
  "Shopping": [
    "amazon", "zalando", "zara", "h&m", "ikea", "mediaworld", "unieuro",
    "ebay", "aliexpress", "shein", "asos", "decathlon",
  ],
  "Utenze": [
    "enel", "eni gas", "a2a", "iren", "edison", "sorgenia", "tim",
    "vodafone", "wind", "iliad", "fastweb", "acqua", "luce", "gas",
  ],
  "Casa": [
    "affitto", "rent", "mutuo", "condominio", "immobili",
  ],
  "Salute": [
    "farmacia", "medico", "ospedale", "dentista", "ottico", "dottore",
    "sanit", "fisioterapi",
  ],
  "Intrattenimento": [
    "netflix", "spotify", "disney", "cinema", "teatro", "concerto",
    "playstation", "xbox", "steam", "nintendo", "apple music", "youtube",
    "dazn", "sky",
  ],
  "Abbonamenti": [
    "abbonamento", "subscription", "membership", "premium",
  ],
  "Stipendio": [
    "stipendio", "salary", "retribuzione", "busta paga", "compenso",
  ],
  "Assicurazioni": [
    "assicuraz", "insurance", "polizza", "generali", "allianz", "unipol",
  ],
  "Istruzione": [
    "universit", "scuola", "corso", "formazione", "udemy", "coursera",
  ],
  "Supermercato": [
    "esselunga", "conad", "coop", "lidl", "eurospin", "carrefour", "penny",
    "md ", "aldi", "pam", "supermercato", "despar", "iper",
  ],
}

export function categorize(description: string): string {
  const lower = description.toLowerCase()

  for (const [category, keywords] of Object.entries(categoryRules)) {
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        return category
      }
    }
  }

  return "Altro"
}
