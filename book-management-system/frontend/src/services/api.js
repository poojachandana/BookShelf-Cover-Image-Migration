import axios from 'axios';

const BASE_URL = 'https://bookshelf-cover-image-migration.onrender.com/api';

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use((config) => {
  console.log(`➡️  ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export const booksAPI = {
  getAll:   ()             => api.get('/books'),
  getById:  (id)           => api.get(`/books/${id}`),
  create:   (formData)     => api.post('/books', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update:   (id, formData) => api.put(`/books/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete:   (id)           => api.delete(`/books/${id}`),
};

export default api;