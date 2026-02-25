import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.DEV ? 'http://localhost:3001' : '',
  withCredentials: true,
  timeout: 30000,
});

// Redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !err.config.url.includes('/auth/me')) {
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

export default api;
