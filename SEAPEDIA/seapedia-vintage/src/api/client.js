import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// withCredentials WAJIB true - tanpa ini cookie sesi (httpOnly) dari backend
// tidak akan pernah ikut terkirim, dan kamu akan selalu "logout" tiap reload.
export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

export default apiClient;
