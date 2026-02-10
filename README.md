<div align="center">

# ✈️ RussoLux Tours

### Exklusive Geschäfts- und Kulturreisen nach Russland

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_9-47A248?style=for-the-badge&logo=mongodb)

**Premium travel agency platform** for exclusive business and cultural trips to Russia.  
Built with modern fullstack architecture, enterprise-grade security, and multi-language support.

[🌐 Live Demo](https://www.russoluxtours.de) · [📖 Documentation](#-documentation) · [🛡️ Security](#%EF%B8%8F-security)

</div>

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Scripts](#-scripts)
- [API Endpoints](#-api-endpoints)
- [Security](#%EF%B8%8F-security)
- [Internationalization](#-internationalization)
- [Documentation](#-documentation)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🎯 Core
- **Travel Packages** — Browse and manage exclusive VIP tour packages (Moscow, St. Petersburg)
- **Fair & Exhibition Packages** — Specialized business fair travel bundles
- **Photo Gallery** — Dynamic image gallery with admin management
- **Contact & Inquiry System** — Lead capture with form validation
- **Admin Dashboard** — Full CMS for managing all content

### 🌍 User Experience
- **Multi-Language Support** — German (DE) and English (EN) with `next-intl`
- **Responsive Design** — Mobile-first approach with Tailwind CSS 4
- **Smooth Animations** — Framer Motion powered transitions and micro-interactions
- **Premium Typography** — Playfair Display & Inter font pairing
- **Dark Luxury Theme** — Elegant dark UI with gold accents

### 🔒 Security (Production-Ready)
- **JWT Authentication** — Session-based admin auth with `jose` library
- **Bcrypt Password Hashing** — 10 salt rounds, timing attack prevention
- **Zod Input Validation** — Schema validation on all API endpoints
- **Rate Limiting** — IP-based protection on login, inquiry, and public APIs
- **Security Headers** — CSP, HSTS, X-Frame-Options, Referrer-Policy
- **CORS Configuration** — Origin-restricted cross-origin requests

### 📊 SEO & Performance
- **Open Graph & Twitter Cards** — Rich social media previews
- **JSON-LD Schema** — Structured data for `TravelAgency` type
- **Meta Tags** — Optimized title, description, and keywords
- **Image Optimization** — Next.js Image component with remote patterns

---

## 🛠 Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | Next.js (App Router) | 16.1.3 |
| **UI Library** | React | 19.2.3 |
| **Language** | TypeScript | 5.x |
| **Styling** | Tailwind CSS | 4.x |
| **Database** | MongoDB (Mongoose ODM) | 9.1.4 |
| **Authentication** | JWT (jose) + bcryptjs | 6.1.3 / 3.0.3 |
| **Forms** | React Hook Form + Zod | 7.71.1 / 4.3.5 |
| **i18n** | next-intl | 4.7.0 |
| **Animations** | Framer Motion | 12.26.2 |
| **Icons** | Lucide React | 0.562.0 |
| **Utilities** | clsx, tailwind-merge | 2.1.1 / 3.4.0 |

---

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- **MongoDB** (local or cloud — [MongoDB Atlas](https://www.mongodb.com/atlas))

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/TravelAgency.git
cd TravelAgency

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your values (see Environment Variables section)

# 4. Generate admin password hash
npm run generate-password-hash

# 5. Start development server
npm run dev
```

The app will be available at **http://localhost:3000**

---

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/russoluxtours

# Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
ADMIN_PASSWORD_HASH=$2b$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

> ⚠️ **Never commit your `.env` file to version control.** Use `npm run generate-password-hash` to create a secure password hash.

---

## 📜 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run generate-password-hash` | Generate bcrypt password hash |
| `npm run backup` | Create database backup |
| `npm run backup:full` | Full database backup |
| `npm run backup:incremental` | Incremental backup |
| `npm run backup:list` | List available backups |
| `npm run restore` | Restore from backup |
| `npm run restore:list` | List restorable backups |
| `npm run restore:dry-run` | Preview restore operation |

---

## 🔌 API Endpoints

### Public Endpoints

| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| `GET` | `/api/packages` | List all travel packages | 60/min |
| `GET` | `/api/fairs` | List all fair packages | 60/min |
| `GET` | `/api/gallery` | Get gallery images | 60/min |
| `POST` | `/api/inquiry` | Submit contact inquiry | 10/hour |

### Authentication

| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| `POST` | `/api/auth/login` | Admin login | 5/15min |
| `POST` | `/api/auth/logout` | Admin logout | — |

### Admin Endpoints (Protected — JWT Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/admin/packages` | Create package |
| `PUT` | `/api/admin/packages` | Update package |
| `DELETE` | `/api/admin/packages` | Delete package |
| `POST` | `/api/admin/fairs` | Create fair |
| `PUT` | `/api/admin/fairs` | Update fair |
| `DELETE` | `/api/admin/fairs` | Delete fair |
| `PUT` | `/api/admin/gallery` | Update gallery |
| `POST` | `/api/admin/settings` | Create settings |
| `PUT` | `/api/admin/settings` | Update settings |

---

## 🛡️ Security

This project implements **4-phase enterprise-grade security**:

```
Phase A: Authentication     ✅  Bcrypt + JWT + Session Management
Phase B: Input Validation   ✅  Zod schema on all endpoints
Phase C: CORS & Headers     ✅  CSP, HSTS, X-Frame-Options
Phase D: Rate Limiting      ✅  IP-based brute-force protection
```

**Security Risk Score: 8.0/10 → 1.0/10** (Minimal — Production Ready)

| Security Layer | Implementation |
|---------------|---------------|
| Password Hashing | bcrypt (10 salt rounds) |
| Token Management | JWT via jose library (2-hour sessions) |
| Input Validation | Zod schemas on all endpoints |
| Rate Limiting | In-memory, IP-based with configurable windows |
| Security Headers | CSP, HSTS, X-Frame-Options, Referrer-Policy |
| CORS | Origin-restricted with preflight handling |
| Brute-force | 100ms delay + rate limit on login |

> 📖 See [SECURITY_IMPLEMENTATION_SUMMARY.md](./SECURITY_IMPLEMENTATION_SUMMARY.md) for detailed documentation.

---

## 🌍 Internationalization

The application supports multiple languages using `next-intl`:

| Language | File | Status |
|----------|------|--------|
| 🇩🇪 German (DE) | `messages/de.json` | ✅ Complete |
| 🇬🇧 English (EN) | `messages/en.json` | ✅ Complete |

Default locale: **German (DE)**

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [SECURITY.md](./SECURITY.md) | Authentication implementation guide |
| [API_VALIDATION.md](./API_VALIDATION.md) | Zod validation schemas & error handling |
| [CORS_SECURITY_HEADERS.md](./CORS_SECURITY_HEADERS.md) | Security headers documentation |
| [RATE_LIMITING.md](./RATE_LIMITING.md) | Rate limiting configuration & guide |
| [SECURITY_IMPLEMENTATION_SUMMARY.md](./SECURITY_IMPLEMENTATION_SUMMARY.md) | Complete security overview |

---


## 📄 License

This project is private and proprietary. All rights reserved.

---

<div align="center">

**Built with ❤️ using Next.js, React & TypeScript**

![Stars](https://img.shields.io/github/stars/YOUR_USERNAME/TravelAgency?style=social)
![Forks](https://img.shields.io/github/forks/YOUR_USERNAME/TravelAgency?style=social)

</div>
