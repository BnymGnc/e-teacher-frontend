# E-Teacher Platformu (Web & Mobil) 🚀

> **🎓 Değerlendirme Komitesi / Asistanlar İçin Önemli Not:**
> Bu repository, E-Teacher platformunun Frontend mimarisini barındırmaktadır ve proje **Monorepo** yapısında kurgulanmıştır (`web-app` ve `mobile-app` olarak ikiye ayrılmıştır).
> 
> Platformumuzun **Web Sürümü (React)** halihazırda kodlanmış ve büyük ölçüde canlıya alınmıştır (`web-app` klasörü). 
> İlgili ödev/proje kapsamında tasarlanan **Mobil Uygulama** sürümüne ait belgelere aşağıdaki linklerden ulaşabilirsiniz:
> 
> 📱 **[Mobil Uygulama MVP Kapsamı İçin Tıklayınız](./mobile-app/MVP_Kapsami.md)**
> 📄 **[Mobil Uygulama PRD Belgesi İçin Tıklayınız](./mobile-app/PRD.md)**
>
> *(Not: Mobil uygulama, E-Teacher'ın [Backend Reposunda](https://github.com/BnymGnc/E-Teacher-Backend) yer alan özel Machine Learning modellerini ve API uç noktalarını kullanacak şekilde tasarlanmıştır.)*

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
