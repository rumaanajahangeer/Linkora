# Linkora — Smart links. Simply shared.

Linkora is a modern, high-performance URL shortening and link management platform built with Next.js (App Router), TypeScript, Tailwind CSS, Prisma ORM, and SQLite.

## Features

- ⚡ **Instant URL Shortening**: Validate HTTP/HTTPS links and generate unique short codes in milliseconds.
- 🎨 **Custom Aliases**: Create branded links like `linkora.app/portfolio` with collision protection and reserved keyword validation.
- 📊 **Real Click Analytics**: Track total clicks, clicks over time, referrer sources, device types (Desktop, Mobile, Tablet), and browser distributions using Recharts.
- 📱 **QR Code Generator**: Automatic vector QR code generation for every link with instant PNG download support.
- 🔒 **User Authentication**: Secure user sign up, login, session management via HttpOnly cookies, and password hashing using bcrypt.
- 🛠️ **Link Management**: Search links, filter by active/disabled status, sort by creation date or total clicks, set expiration dates, or disable links anytime.
- 🌗 **Dark / Light Mode**: Dark mode default with smooth light mode toggle and persistent theme preference.
- 🔗 **Secure Redirect Engine**: Fast server-side HTTP 307 redirects with automated click event tracking and custom 404 error states for expired or missing links.

---

## Tech Stack

- **Framework**: Next.js 14 (App Router, Server Actions, Route Handlers)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Lucide React Icons, `next-themes`
- **Database**: SQLite (via Prisma ORM, PostgreSQL-ready)
- **Authentication**: JWT Session Cookies (`jose` + `bcryptjs`)
- **Data Visualization**: `recharts`
- **QR Codes**: `qrcode`

---

## Quick Start & Local Setup

### 1. Prerequisites
Ensure you have **Node.js 18+** and **npm** installed.

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Migration
The database is pre-configured with SQLite. Run schema sync:

```bash
npx prisma db push
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser and register a new user account to get started.

---

## Project Structure

```
Linkora/
├── prisma/
│   └── schema.prisma      # Relational schema (User, Link, ClickEvent)
├── src/
│   ├── app/
│   │   ├── [shortCode]/   # Server-side short URL redirect handler
│   │   ├── api/           # Auth, Link CRUD, and Analytics API endpoints
│   │   ├── dashboard/     # Overview, Link Management, Analytics & Settings
│   │   ├── login/         # Auth pages
│   │   ├── signup/
│   │   ├── 404/           # Custom redirect error page
│   │   ├── layout.tsx     # Root layout with ThemeProvider
│   │   └── page.tsx       # Landing page with instant URL shortener hero
│   ├── components/        # Navbar, Footer, QRCodeModal, ThemeToggle
│   └── lib/               # Prisma client, Auth helpers, Analytics parser & Utils
└── .env                   # Local environment variables
```

---

## Verification & Build

To compile and verify production build:

```bash
npm run build
```
