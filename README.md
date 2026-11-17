# InventoryFinder

Flexible inventory **data banks** with CSV/Excel import and **OCR-powered product ID lookup**.

Snap or upload a product label, confirm the ID in search, and pull the matching row — built for fast floor and desk lookups.

**Live:** [https://www.inve-ba.vercel.app](https://www.inve-ba.vercel.app)

---

## Features

- **Landing + auth** — public marketing page, email/password sign-up and sign-in (Auth.js)
- **Data banks** — create custom column schemas (text, number, currency) with one ID/lookup column
- **Imports** — manual entry, CSV, and Excel (`.xlsx` / `.xls`)
- **Editable columns** — rename and adjust bank columns after creation
- **Finder** — live type-ahead search plus camera snap / image upload OCR (Tesseract.js)
- **OCR assist** — fuzzy-matches OCR reads against IDs already in the selected bank; editable fallback
- **Responsive UI** — mobile-friendly shell with light/dark theme support

---

## Tech stack

| Area | Choice |
|------|--------|
| Framework | [Next.js](https://nextjs.org) 16 (App Router) |
| UI | [shadcn/ui](https://ui.shadcn.com), Tailwind CSS 4, Framer Motion |
| Data | [Prisma](https://www.prisma.io) 6 + PostgreSQL ([Neon](https://neon.tech)) |
| Auth | [Auth.js](https://authjs.dev) (NextAuth v5) credentials + JWT |
| Client data | TanStack Query + TanStack Table |
| Spreadsheets | PapaParse (CSV), SheetJS (Excel) |
| OCR | Tesseract.js (browser) |

---

## Getting started

### Prerequisites

- Node.js 20+
- [pnpm](https://pnpm.io)
- A Neon (or other Postgres) database

### 1. Clone and install

```bash
git clone https://github.com/Prince-213/inve-ba.git
cd inve-ba
pnpm install
```

### 2. Environment variables

Copy the example env file and fill in values:

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Postgres connection string (prefer direct URL for local Prisma) |
| `DATABASE_URL_POOLED` | Optional | Pooled URL if you use Neon’s pooler in some environments |
| `AUTH_SECRET` | Yes | Auth.js secret — `openssl rand -base64 32` |
| `AUTH_URL` | Prod | App origin, e.g. `https://www.inve-ba.vercel.app` |
| `NEXTAUTH_URL` | Prod / local | Same as app URL (`http://localhost:3000` locally) |
| `NEXT_PUBLIC_APP_URL` | Recommended | Canonical URL for metadata / Open Graph |

### 3. Database

```bash
pnpm db:push
# or: pnpm db:generate
```

### 4. Run locally

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Next.js dev server |
| `pnpm build` | `prisma generate` + production build |
| `pnpm start` | Serve production build |
| `pnpm lint` | Run ESLint |
| `pnpm db:push` | Push Prisma schema to the database |
| `pnpm db:generate` | Generate Prisma Client |

---

## App structure (high level)

```
app/
  page.tsx              # Public landing
  app/page.tsx          # Authenticated app shell (/app)
  (auth)/sign-in|sign-up
  api/                  # Banks, items, find, auth
components/
  landing/              # Marketing UI
  banks/                # Data banks, table, column editor
  finder/               # ID search + OCR
  import/               # CSV/Excel + manual import
lib/
  auth.ts / auth.config.ts
  ocr.ts / csv.ts / db.ts
prisma/schema.prisma
```

**Routing**

- `/` — landing (guests); logged-in users redirect to `/app`
- `/sign-in`, `/sign-up` — authentication
- `/app` — data banks + finder

---

## Deploy (Vercel)

1. Import the GitHub repo into [Vercel](https://vercel.com).
2. Set the same environment variables as above for **Production** (especially `AUTH_SECRET`, `DATABASE_URL`, `AUTH_URL`, `NEXTAUTH_URL`, `NEXT_PUBLIC_APP_URL`).
3. Deploy. Run `pnpm db:push` once against your production database if the schema is not applied yet.

> Without `AUTH_SECRET` in Vercel, Auth.js fails with `MissingSecret` in production logs.

---

## OCR notes

- OCR runs **in the browser** via Tesseract.js (worker + WASM under `public/tesseract`).
- The first run may download the English language pack (then cached).
- Best results: close, well-lit photos of the ID only; you can always edit the search field if the read is wrong.

---

## Author

**Prince Kuvuki**

- WhatsApp: [wa.link/cz7uwp](https://wa.link/cz7uwp)
- GitHub: [Prince-213](https://github.com/Prince-213)

---

## License

Private / all rights reserved unless otherwise stated by the repository owner.
