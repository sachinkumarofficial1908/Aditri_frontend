# Aditri Constructions Services — Full Stack Web Application

## 🏗️ Tech Stack
- **Frontend**: React 18 + Vite + Tailwind CSS + Framer Motion
- **Backend**: Node.js + Express.js + MongoDB (Mongoose)
- **Auth**: JWT + HTTP-only cookies + bcryptjs
- **UI**: React Query (data fetching), React Hook Form, Recharts, Lucide Icons
- **Security**: Helmet, CORS, Rate Limiting, Mongo Sanitize, XSS Clean, HPP

---

## 📁 Project Structure
```
aditri-website/
├── backend/          # Express API server
│   ├── src/
│   │   ├── config/   # DB config
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── utils/
│   ├── server.js
│   ├── seeder.js
│   └── package.json
└── frontend/         # React + Vite app
    ├── src/
    │   ├── components/
    │   ├── context/
    │   ├── pages/
    │   │   └── admin/
    │   └── utils/
    └── package.json
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB (local or Atlas)

### 1. Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, email credentials

npm install
npm run dev
# API runs on http://localhost:5000
```

### 2. Seed Database
```bash
cd backend
node seeder.js
# Creates admin user and sample products/projects
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:5173
```

---

## 🔐 Security Features
- **Helmet** — sets secure HTTP headers
- **CORS** — whitelisted origins only
- **Rate Limiting** — 100 req/15min (10 for login)
- **Mongo Sanitize** — prevents NoSQL injection
- **XSS Clean** — sanitizes user input
- **HPP** — HTTP parameter pollution protection
- **JWT** — stateless auth with httpOnly cookies
- **bcrypt (12 rounds)** — password hashing
- **Account lockout** — 5 failed logins → 30min lock
- **Input validation** — express-validator on all routes
- **File upload** — type/size validation (images only, 5MB)
- **Role-based access** — user / admin middleware

---

## 👤 Default Admin Credentials
```
Email: admin@aditri.com
Password: Admin@123
```
⚠️ Change these in `.env` before production!

---

## 📦 Admin Panel Features
- **Dashboard** — revenue chart, order stats, recent activity
- **Products** — CRUD with image upload, stock management
- **Orders** — status tracking, update pipeline
- **Inquiries** — view, reply (sends email), update status
- **Projects** — CRUD portfolio management
- **Users** — view, activate/block users

---

## 🌐 Public Features
- Animated Hero with auto-sliding content
- Services, Projects, Products pages with filtering
- Product detail with add-to-cart
- Shopping cart with quantity management
- Checkout with order placement
- Contact form (sends email to admin + auto-reply)
- User auth (register/login)
- My Orders dashboard

---

## 🏭 Production Deployment
```bash
# Backend
NODE_ENV=production npm start

# Frontend (build)
npm run build
# Serve dist/ with nginx or any static host

# Nginx proxy example
location /api {
  proxy_pass http://localhost:5000;
}
```

---

## 📞 Company Info
**Aditri Constructions Services**
- Proprietor: Sandeep Kumar Mishra
- Phone: +91-9598033414
- Email: aditri.c.services@gmail.com
- Address: A, Naini Prayagraj, UP 211008
- GSTIN: 09CDYPM7630P1ZC
