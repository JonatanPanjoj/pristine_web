import axios from 'axios';

// Cliente HTTP centralizado para Pristine API (conectado a MongoDB)
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[Pristine API Error]:', error?.response?.data || error?.message);
    return Promise.reject(error);
  }
);

export default api;
