import axios from 'axios';

// Backend adresimiz (Render üzerindeki canlı sunucun)
const api = axios.create({
  baseURL: 'https://e-teacher.onrender.com/api/', // BURASI ÇOK ÖNEMLİ, İÇİ BOŞ KALAMAZ!
});

// Her istekten önce çalışacak aracı (Interceptor)
api.interceptors.request.use(
  (config) => {
    // sessionStorage'dan token'ı al
    const token = sessionStorage.getItem('access_token'); 
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