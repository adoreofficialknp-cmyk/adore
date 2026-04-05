# 💎 ADORE Fine Jewellery — Full-Stack Production App

A complete Shopify-like e-commerce app built with React + Node.js + PostgreSQL, deployable on Render in one click.

---

## 🧠 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite + TailwindCSS |
| Backend | Node.js + Express.js |
| Database | PostgreSQL (Render managed) |
| ORM | Prisma |
| Auth | JWT + bcrypt |
| Storage | Cloudinary |
| Payments | Razorpay + Cashfree |
| Deploy | Render (single web service) |

---

## 📁 Folder Structure

```
adore-fullstack/
├── client/                  ← React frontend (Vite)
│   └── src/
│       ├── pages/           ← All pages (Home, Shop, Cart, etc.)
│       │   └── admin/       ← Admin dashboard pages
│       ├── components/      ← Shared UI components
│       ├── context/         ← Auth, Cart, Toast contexts
│       └── utils/           ← Axios API instance
├── server/                  ← Express backend
│   ├── routes/              ← API route handlers
│   ├── middleware/          ← Auth + error handlers
│   ├── prisma/              ← Schema + seed
│   └── app.js               ← Entry point
├── render.yaml              ← Render deployment config
└── package.json             ← Root scripts
```

---

## 🚀 Deploy on Render (Step by Step)

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/adore-jewellery.git
git push -u origin main
```

### Step 2 — Create PostgreSQL Database on Render

1. Go to https://dashboard.render.com
2. Click **New → PostgreSQL**
3. Name: `adore-db`, Region: Singapore, Plan: Free
4. Click **Create Database**
5. Wait for it to be ready, then copy **"Internal Database URL"**

### Step 3 — Create Web Service on Render

1. Click **New → Web Service**
2. Connect your GitHub repo
3. Configure:
   - **Name:** `adore-jewellery`
   - **Build Command:** `npm run build && cd server && npm install && npx prisma generate && npx prisma migrate deploy`
   - **Start Command:** `cd server && node app.js`
   - **Plan:** Free

### Step 4 — Set Environment Variables in Render

In your web service → **Environment** tab, add:

```
NODE_ENV          = production
DATABASE_URL      = <Internal DB URL from Step 2>
JWT_SECRET        = <any long random string>
CLIENT_URL        = https://your-service-name.onrender.com
CLOUDINARY_URL    = cloudinary://api_key:api_secret@cloud_name
RAZORPAY_KEY      = rzp_live_xxxxxxxxxxxx
RAZORPAY_SECRET   = your_razorpay_secret
CASHFREE_APP_ID   = your_cashfree_app_id
CASHFREE_SECRET   = your_cashfree_secret
```

### Step 5 — Deploy and Seed

After first deploy completes, open the **Shell** tab in Render and run:

```bash
cd server && node prisma/seed.js
```

This creates:
- Admin: `admin@adore.com` / `admin@adore123`
- Test user: `test@adore.com` / `test123`
- 8 sample products
- 3 coupon codes

---

## 💻 Run Locally

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/adore-jewellery.git
cd adore-jewellery

# Install all dependencies
cd server && npm install
cd ../client && npm install
```

### 2. Setup local database

Install PostgreSQL locally, then:

```bash
createdb adore
```

### 3. Create `.env` in `/server`

```bash
cp server/.env.example server/.env
# Edit server/.env with your values
```

### 4. Run migrations and seed

```bash
cd server
npx prisma migrate dev --name init
node prisma/seed.js
```

### 5. Start development servers

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

Frontend: http://localhost:5173  
API: http://localhost:5000

---

## 💳 Payment Setup

### Razorpay

1. Sign up at https://razorpay.com
2. Dashboard → Settings → API Keys → Generate Test Key
3. Copy `Key ID` → `RAZORPAY_KEY`
4. Copy `Key Secret` → `RAZORPAY_SECRET`
5. For live: switch to Live mode and generate live keys

**Test cards:**
- Card: `4111 1111 1111 1111`, Any future date, Any CVV
- UPI: `success@razorpay`

### Cashfree

1. Sign up at https://merchant.cashfree.com
2. Developers → API Keys → Test Keys
3. Copy `App ID` → `CASHFREE_APP_ID`
4. Copy `Secret Key` → `CASHFREE_SECRET`
5. Add SDK to `client/index.html`:

```html
<script src="https://sdk.cashfree.com/js/v3/cashfree.js"></script>
```

### Cloudinary

1. Sign up at https://cloudinary.com
2. Dashboard → Copy "API Environment variable"
3. Paste full string as `CLOUDINARY_URL`

---

## 🎯 Features Checklist

### ✅ Authentication
- [x] Register / Login / Logout
- [x] JWT with 30-day expiry
- [x] bcrypt password hashing
- [x] Role-based access (USER / ADMIN)

### ✅ Products
- [x] Full CRUD (admin)
- [x] Category filtering
- [x] Search with live suggestions
- [x] Sorting (price, rating, newest)
- [x] Pagination
- [x] Stock management
- [x] Customer reviews

### ✅ Cart
- [x] Add / Remove / Update quantity
- [x] Persisted in PostgreSQL
- [x] Size selection for rings/bracelets
- [x] Coupon code validation

### ✅ Buy Now
- [x] Instant order creation
- [x] Redirects to payment
- [x] Stock decremented on success

### ✅ Payments
- [x] Razorpay (cards, UPI, netbanking)
- [x] Cashfree (UPI, cards)
- [x] Cash on Delivery
- [x] Payment verification
- [x] Webhook support (Cashfree)

### ✅ Admin Dashboard
- [x] Stats (orders, revenue, products, users)
- [x] Product CRUD with Cloudinary upload
- [x] Order management + status updates
- [x] Coupon management

### ✅ User Features
- [x] Order history + tracking timeline
- [x] Order cancellation
- [x] Wishlist
- [x] Profile management

---

## 🔐 API Endpoints Reference

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

GET    /api/products
GET    /api/products/:id
POST   /api/products          (admin)
PUT    /api/products/:id      (admin)
DELETE /api/products/:id      (admin)

GET    /api/cart
POST   /api/cart/add
PUT    /api/cart/item/:id
DELETE /api/cart/item/:id

POST   /api/orders
POST   /api/orders/buy-now
GET    /api/orders/my
GET    /api/orders/:id
PUT    /api/orders/:id/cancel

POST   /api/payments/razorpay/create-order
POST   /api/payments/razorpay/verify
POST   /api/payments/cashfree/create-session
POST   /api/payments/cashfree/verify

POST   /api/upload/image      (admin)
POST   /api/upload/images     (admin)

GET    /api/wishlist
POST   /api/wishlist/toggle

POST   /api/coupons/validate
GET    /api/admin/stats       (admin)
GET    /api/admin/users       (admin)
```

---

## 🎨 Coupon Codes (from seed)

| Code | Type | Discount | Min Order |
|------|------|----------|-----------|
| ADORE10 | 10% off | 10% | ₹5,000 |
| WELCOME500 | Flat | ₹500 | ₹3,000 |
| LUXURY20 | 20% off | 20% | ₹50,000 |

---

*Built with ❤️ for ADORE Fine Jewellery*
