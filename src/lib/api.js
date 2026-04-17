import axios from 'axios';

// Backend adresimiz (Render üzerindeki canlı sunucun)
const api = axios.create({
  // URL'nin sonuna /api/ koyduğundan emin ol, Django path'lerin buna göre ayarlı
  baseURL: 'https://e-teacher.onrender.com/api/', 
});

// Her istekten önce çalışacak aracı (Interceptor)
api.interceptors.request.use(
  (config) => {
    // sessionStorage'dan token'ı alıyoruz
    const token = sessionStorage.getItem('access_token'); 
    
    if (token) {
      // Eğer token varsa, isteğin başlığına (Headers) ekle
      // Django SimpleJWT "Bearer" ön ekini şart koşar, bunu doğru eklemişsin
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    // İstek gönderilmeden önce oluşan hataları yakalar
    return Promise.reject(error);
  }
);

// Opsiyonel: Yanıt geldiğinde 401 hatası (Token geçersizliği) alınırsa 
// kullanıcıyı otomatik login sayfasına atmak için bir interceptor daha eklenebilir.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Oturum süresi dolmuş veya geçersiz token.");
      // sessionStorage.clear(); // İstersen temizleyebilirsin
      // window.location.href = '/login'; // İstersen yönlendirebilirsin
    }
    return Promise.reject(error);
  }
);

export default api;