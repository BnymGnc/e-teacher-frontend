# 🌐 E-Teacher Web Uygulaması (Frontend)

E-Teacher, öğrencilere ve eğitmenlere yapay zeka destekli, kişiselleştirilmiş bir eğitim ekosistemi sunan modern bir platformdur. Bu repository, sistemin **React + Vite** kullanılarak geliştirilen kullanıcı arayüzünü barındırmaktadır.

## 🚀 Canlı Uygulama
Uygulama şu anda Vercel üzerinde yayındadır ve Backend servisleri ile tam entegre çalışmaktadır.
👉 **[E-Teacher Canlı Uygulamayı Görüntüle](https://e-teacher-web.vercel.app)**

---

## 🔗 Proje Ekosistemi (Polyrepo)
E-Teacher, ölçeklenebilir bir mikro-servis mimarisi ile tasarlanmıştır. Diğer bileşenlere aşağıdan ulaşabilirsiniz:
* ⚙️ **[Backend (Django & AI) Reposu](https://github.com/BnymGnc/E-Teacher-Backend)**
* 📱 **[Mobil Uygulama (MVP/PRD) Reposu](https://github.com/BnymGnc/E-Teacher-Mobile-App)**

---

## ✨ Öne Çıkan Modüller

Platform, öğrencinin akademik başarısını artırmak için şu kritik modülleri sunar:

* 📅 **Google Meet & Calendar Entegrasyonu:** Eğitmenler tarafından planlanan dersler için otomatik Google Meet odaları oluşturulur ve takvimle senkronize edilir.
* 🧠 **AI Psikolojik Destek (`/support`):** Sınav stresi ve motivasyon yönetimi için özel bir LLM asistanı.
* 📊 **Sınav Analiz Motoru (`/analysis`):** Deneme sonuçlarını işleyerek eksik konuları tespit eden görsel raporlama sistemi.
* 🎯 **Hedef Net Tahminleme:** Hedeflenen üniversite/bölüm verilerine (YÖK Atlas entegre) göre gereken netleri hesaplayan algoritma.
* 📝 **Akıllı Quiz Üreticisi:** Konu ve zorluk seviyesine göre yapay zeka tarafından anlık test üretimi.

---

## 🛠️ Teknik Yığın (Tech Stack)

* **Frontend:** React.js, Vite
* **State & Routing:** React Router DOM v6
* **API İletişimi:** Axios (Render üzerindeki Django REST API ile iletişim kurar)
* **Deployment:** Vercel (Frontend), Render (Backend)

---

## 💻 Yerel Kurulum

Projeyi kendi bilgisayarınızda çalıştırmak için:

1. **Bağımlılıkları Yükleyin:**
   ```bash
   npm install