import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3333/api',
  timeout: 15000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gsv_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('gsv_token');
      localStorage.removeItem('gsv_user');
    }

    return Promise.reject(error);
  }
);

export async function downloadReport(format, tipo) {
  const response = await api.get(`/relatorios/${format}`, {
    params: { tipo },
    responseType: 'blob'
  });

  const url = URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = url;
  link.download = `relatorio-${tipo}.${format}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
