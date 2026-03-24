import axios from 'axios'; // Hata buradaydı, düzeltildi!

// Backend adresimiz (Django'nun çalıştığı port)
const api = axios.create({
  baseURL: 'https://e-teacher.onrender.com/api', // Sonundaki o fazladan slash veya tekrara dikkat!
});

// Her istekten önce çalışacak aracı (Interceptor)
api.interceptors.request.use(
  (config) => {
    // LocalStorage'dan token'ı al
    const token = localStorage.getItem('access_token');
    if (token) {
      // Eğer token varsa, isteğin başlığına (Headers) ekle
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

