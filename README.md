# Abnur Logoped Kurslari

Professional nutq terapiyasi va rivojlantirish kurslari platformasi.

## 🚀 Loyihani ishga tushirish

### 1. Kerakli paketlarni o'rnatish
```bash
npm install
```

### 2. Serverni ishga tushirish
```bash
npm start
```

Yoki development rejimida (avtomatik qayta yuklash bilan):
```bash
npm run dev
```

Server `http://localhost:3000` da ishga tushadi.

## 📁 Loyiha tuzilishi

```
Abnur/
├── server.js           # Backend server
├── index.html          # Asosiy sahifa
├── admin.html          # Admin paneli
├── teacher.html        # O'qituvchi paneli
├── script.js           # Frontend JavaScript
├── admin-script.js     # Admin JavaScript
├── teacher-script.js   # O'qituvchi JavaScript
├── styles.css          # Asosiy CSS
├── admin-styles.css    # Admin CSS
├── data/               # Ma'lumotlar (JSON fayllar)
│   ├── users.json
│   ├── teachers.json
│   ├── appointments.json
│   └── lessons.json
└── package.json        # NPM konfiguratsiyasi
```

## 🌐 API Endpoints

### Foydalanuvchilar
- `POST /api/users/register` - Ro'yxatdan o'tish
- `POST /api/users/login` - Kirish
- `GET /api/users/:email` - Profil ma'lumotlari

### O'qituvchilar
- `GET /api/teachers` - Barcha o'qituvchilar
- `GET /api/teachers/active` - Faol o'qituvchilar
- `POST /api/teachers` - O'qituvchi qo'shish
- `PUT /api/teachers/:id` - O'qituvchini yangilash
- `DELETE /api/teachers/:id` - O'qituvchini o'chirish

### Uchrashuvlar
- `GET /api/appointments` - Barcha uchrashuvlar
- `POST /api/appointments` - Uchrashuv yaratish
- `PUT /api/appointments/:id` - Uchrashuvni yangilash

### Bepul darslar
- `GET /api/lessons` - Barcha darslar
- `POST /api/lessons` - Dars qo'shish
- `PUT /api/lessons/:id` - Darsni yangilash
- `DELETE /api/lessons/:id` - Darsni o'chirish

## 🔐 Admin kirish ma'lumotlari

**Username:** admin1  
**Password:** abnur_admin

## 📦 Deploy qilish

### Render.com (Bepul)
1. [Render.com](https://render.com) ga ro'yxatdan o'ting
2. "New +" → "Web Service" tanlang
3. GitHub repository'ni ulang
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Deploy tugmasini bosing

### Railway.app (Bepul)
1. [Railway.app](https://railway.app) ga kiring
2. "New Project" → "Deploy from GitHub repo"
3. Repository'ni tanlang
4. Avtomatik deploy boshlanadi

### Vercel (Bepul)
1. [Vercel.com](https://vercel.com) ga kiring
2. "Import Project" tugmasini bosing
3. GitHub repository'ni tanlang
4. Deploy qiling

## 📝 Litsenziya

MIT License - O'zingizning loyihalaringizda erkin foydalaning!
