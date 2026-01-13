# 🚀 Abnur Logoped - Bepul Domenga Deploy Qilish Yo'riqnomasi

## 1️⃣ Render.com (Tavsiya etiladi - Eng oson)

### Qadamlar:

1. **GitHub repository yarating**
   - [GitHub.com](https://github.com) ga kiring
   - "New repository" tugmasini bosing
   - Repository nomini kiriting (masalan: `abnur-logoped`)
   - "Create repository" tugmasini bosing

2. **Kodingizni GitHub'ga yuklang**
   ```bash
   cd c:\Users\маша\Desktop\Abnur
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/SIZNING_USERNAME/abnur-logoped.git
   git push -u origin main
   ```

3. **Render.com'da deploy qiling**
   - [Render.com](https://render.com) ga ro'yxatdan o'ting (GitHub orqali)
   - Dashboard'da "New +" → "Web Service" tanlang
   - GitHub repository'ni ulang va tanlang
   - Quyidagi sozlamalarni kiriting:
     - **Name:** abnur-logoped
     - **Environment:** Node
     - **Build Command:** `npm install`
     - **Start Command:** `npm start`
     - **Plan:** Free
   - "Create Web Service" tugmasini bosing
   - 5-10 daqiqa kutib turing ✅

4. **Sizning bepul domeningiz:**
   ```
   https://abnur-logoped.onrender.com
   ```

---

## 2️⃣ Railway.app (Tez va oson)

### Qadamlar:

1. **GitHub'ga yuklang** (yuqoridagi kabi)

2. **Railway.app'da deploy qiling**
   - [Railway.app](https://railway.app) ga kiring (GitHub orqali)
   - "New Project" → "Deploy from GitHub repo"
   - Repository'ni tanlang
   - Avtomatik deploy boshlanadi
   - Environment variables qo'shish kerak emas

3. **Sizning bepul domeningiz:**
   ```
   https://abnur-logoped.up.railway.app
   ```

---

## 3️⃣ Vercel (Eng tez)

### Qadamlar:

1. **GitHub'ga yuklang** (yuqoridagi kabi)

2. **Vercel'da deploy qiling**
   - [Vercel.com](https://vercel.com) ga kiring (GitHub orqali)
   - "Add New..." → "Project"
   - Repository'ni import qiling
   - "Deploy" tugmasini bosing
   - 2-3 daqiqa kutib turing ✅

3. **Sizning bepul domeningiz:**
   ```
   https://abnur-logoped.vercel.app
   ```

---

## 4️⃣ Netlify (Alternativ)

### Qadamlar:

1. **GitHub'ga yuklang**

2. **Netlify'da deploy qiling**
   - [Netlify.com](https://netlify.com) ga kiring
   - "Add new site" → "Import an existing project"
   - GitHub'ni ulang va repository'ni tanlang
   - Build settings:
     - **Build command:** `npm install`
     - **Publish directory:** `.`
   - "Deploy site" tugmasini bosing

3. **Sizning bepul domeningiz:**
   ```
   https://abnur-logoped.netlify.app
   ```

---

## 🎯 Qaysi birini tanlash kerak?

| Platform | Tezlik | Osonlik | Tavsiya |
|----------|--------|---------|---------|
| **Render.com** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ Eng yaxshi |
| **Railway.app** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ✅ Tez |
| **Vercel** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ Juda tez |
| **Netlify** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐ Yaxshi |

---

## 📝 Muhim eslatmalar

1. **Ma'lumotlar saqlash:** Bepul planlarda ma'lumotlar vaqtinchalik saqlanadi. Production uchun MongoDB yoki PostgreSQL ishlatish tavsiya etiladi.

2. **Domen nomi o'zgartirish:** Har bir platformada custom domen qo'shish mumkin (masalan: `abnur.uz`)

3. **HTTPS:** Barcha platformalar avtomatik HTTPS beradi ✅

4. **Monitoring:** Render.com va Railway.app'da server loglari ko'rish mumkin

---

## 🔧 Muammolar yuzaga kelsa

### Server ishlamayapti?
```bash
# Lokal serverda tekshiring
npm install
npm start
```

### GitHub'ga yuklanmayapti?
```bash
# Git konfiguratsiyasini tekshiring
git config --global user.name "Sizning ismingiz"
git config --global user.email "sizning@email.com"
```

### Deploy muvaffaqiyatsiz?
- Build loglarini tekshiring
- `package.json` faylida `"start": "node server.js"` borligini tekshiring
- Node.js versiyasini tekshiring (14+ kerak)

---

## 🎉 Muvaffaqiyatli deploy qilganingizdan keyin

1. Saytingizni oching: `https://sizning-domen.platform.com`
2. Admin paneliga kiring: `https://sizning-domen.platform.com/admin`
3. Login: `admin1`, Parol: `abnur_admin`
4. O'qituvchilar va darslarni qo'shing
5. Saytingizni do'stlaringiz bilan bo'lishing! 🚀

---

**Omad tilayman! 🎓**
