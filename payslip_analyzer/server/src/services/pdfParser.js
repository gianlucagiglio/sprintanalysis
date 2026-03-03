import pdf from 'pdf-parse';

/**
 * Estrae il testo da un buffer PDF.
 * @param {Buffer} pdfBuffer - Il contenuto del file PDF
 * @returns {Promise<string>} Il testo estratto
 */
export async function extractText(pdfBuffer) {
  const data = await pdf(pdfBuffer);
  return data.text;
}
