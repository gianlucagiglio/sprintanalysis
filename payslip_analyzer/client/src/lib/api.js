import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.DEV ? 'http://localhost:3002' : '',
  timeout: 120000, // 2 min — Claude può impiegare tempo
});

/**
 * Invia un PDF per l'analisi.
 * @param {File} file - Il file PDF da analizzare
 * @returns {Promise<object>} I dati strutturati della busta paga
 */
export async function analyzePdf(file) {
  const formData = new FormData();
  formData.append('pdf', file);

  const { data } = await api.post('/api/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return data;
}
