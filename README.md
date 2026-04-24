# ADORE Fine Jewellery — Full-Stack E-Commerce

Pink-themed jewellery e-commerce app built with React + Express + PostgreSQL + Prisma.

---

## 🚀 Deploy to Render (Step by Step)

### 1. Push to GitHub
```bash
git init && git add . && git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/adore-jewellery.git
git push -u origin main
```

### 2. Create on Render
- Go to [render.com](https://render.com) → New → **Blueprint**
- Connect your GitHub repo
- Render auto-reads `render.yaml` — it creates both the web service and PostgreSQL database

### 3. Set Environment Variables on Render
After the service is created, go to **Environment** tab and add:

| Variable | Value |
|---|---|
| `CLOUDINARY_URL` | From [cloudinary.com/console](https://cloudinary.com/console) |
| `RAZORPAY_KEY` | From Razorpay dashboard |
| `RAZORPAY_SECRET` | From Razorpay dashboard |
| `CASHFREE_APP_ID` | From Cashfree dashboard (optional) |
| `CASHFREE_SECRET` | From Cashfree dashboard (optional) |

`DATABASE_URL`, `JWT_SECRET`, `NODE_ENV`, `PORT`, `CLIENT_URL` are set automatically by `render.yaml`.

### 4. First Deploy
Render will:
1. Run `npm install` for server & client
2. Run `prisma generate` (via postinstall)
3. Build the React app (`vite build`)
4. Start the server (`node server/app.js`)
5. On first boot: run DB migration + seed 12 products, 2 users, 3 coupons

### 5. Default Credentials
| Role | Email | Password |
|---|---|---|
| Admin | admin@adore.com | admin@adore123 |
| Test User | test@adore.com | test123 |

**Change these immediately in production.**

---

## 🛠 Local Development

```bash
# Install all dependencies
npm run install:all

# Create server/.env (copy from server/.env.example)
cp server/.env.example server/.env
# Fill in DATABASE_URL, JWT_SECRET, etc.

# Run dev servers (two terminals)
npm run dev:server   # Express on :5000
npm run dev:client   # Vite on :5173
```

---

## 🗂 Project Structure

```
adore-jewellery/
├── client/                  # React frontend (Vite)
│   ├── src/
│   │   ├── pages/           # Home, Shop, Product, Cart, Checkout, Admin…
│   │   ├── components/      # Layout, UI, ScrollToTop
│   │   ├── context/         # Auth, Cart, Toast
│   │   └── utils/api.js     # Axios instance
│   └── vite.config.js
├── server/                  # Express backend
│   ├── routes/              # auth, products, cart, orders, payments, upload…
│   ├── middleware/          # auth.js, errorHandler.js
│   ├── prisma/
│   │   └── schema.prisma    # DB schema (PostgreSQL)
│   └── app.js               # Entry point
├── render.yaml              # Render Blueprint config
└── README.md
```

---

## ⚙️ Admin Panel

Visit `/admin` (must be logged in as ADMIN).

- **Products** — add/edit/delete with Cloudinary image upload
- **Orders** — view and update order status
- **Users** — manage customers
- **CMS** — edit hero banners, section images, marquee, product counts
- **Analytics** — basic order stats

---

## 🖼 Image Uploads (Cloudinary)

Set `CLOUDINARY_URL` in your environment. Format:
```
cloudinary://API_KEY:API_SECRET@CLOUD_NAME
```

Without Cloudinary, paste image URLs directly in the admin — all Unsplash fallbacks work out of the box.

---

## 💳 Payments

- **Razorpay** — set `RAZORPAY_KEY` + `RAZORPAY_SECRET`
- **Cash on Delivery** — works without any config
- Toggle payment methods from Admin → CMS → Payment Methods

---

## 🔧 Key Features

- Pink theme throughout, mobile-first
- Hero banner (full viewport height)
- Shop by Category, Material (horizontal scroll), Bond, Color, Style
- 2-column product grid on Home and Shop
- Scroll-to-top on every route change
- Festive sale countdown timer
- Wishlist, Cart, Checkout with coupon codes
- Ring Sizer in Profile
- Custom Jewellery request form
- Admin CMS: control banner images, section images, product counts per section
- Cloudinary upload in admin for all images
- Gzip compression + static asset caching
- Keep-alive ping (prevents Render free tier sleep)
- Graceful shutdown on SIGTERM
