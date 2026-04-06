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
| Storage | Cloudinary (optional — URL fallback built-in) |
| Payments | Razorpay + Cashfree + Cash on Delivery |
| Deploy | Render (single web service) |

---

## 📁 Folder Structure

```
adore-fullstack/
├── client/                  ← React frontend (Vite)
│   └── src/
│       ├── pages/           ← All pages
│       │   ├── admin/       ← Admin dashboard pages
│       │   ├── Home.jsx
│       │   ├── Shop.jsx
│       │   ├── ProductDetail.jsx
│       │   ├── Cart.jsx
│       │   ├── Checkout.jsx
│       │   ├── Profile.jsx
│       │   ├── HelpSupport.jsx
│       │   ├── Notifications.jsx
│       │   ├── PrivacyPolicy.jsx
│       │   └── CustomJewellery.jsx
│       ├── components/      ← Layout, UI components
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

# Payments (required for online payment)
RAZORPAY_KEY      = rzp_live_xxxxxxxxxxxx
RAZORPAY_SECRET   = your_razorpay_secret
CASHFREE_APP_ID   = your_cashfree_app_id
CASHFREE_SECRET   = your_cashfree_secret

# Image uploads (optional — admins can paste URLs directly if not set)
CLOUDINARY_URL    = cloudinary://api_key:api_secret@cloud_name
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

> **Note:** Razorpay SDK is now loaded dynamically at runtime — no HTML script tag needed.

**Test cards:**
- Card: `4111 1111 1111 1111`, Any future date, Any CVV
- UPI: `success@razorpay`

### Cashfree

1. Sign up at https://merchant.cashfree.com
2. Developers → API Keys → Test Keys
3. Copy `App ID` → `CASHFREE_APP_ID`
4. Copy `Secret Key` → `CASHFREE_SECRET`

> **Note:** Cashfree SDK is loaded dynamically — no HTML script tag needed.

### Cloudinary (Image Uploads)

1. Sign up at https://cloudinary.com
2. Dashboard → Copy "API Environment variable"
3. Paste full string as `CLOUDINARY_URL`

> **Without Cloudinary:** Admins can still add products by pasting image URLs directly in the Add Product form.

### Admin: Control Which Payment Methods Show

Go to **Admin → CMS → Payment Methods** to toggle Razorpay, Cashfree, and COD on/off for customers.

---

## 🎯 Full Features List

### Customer Pages
| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Hero slider, shop by color, by bond, by style, festive sale with live countdown, custom jewellery CTA |
| Shop | `/shop` | Filter by category, color, gender; sort; search; pagination |
| Product Detail | `/product/:id` | Images, size picker, add to cart, similar products below |
| Cart | `/cart` | Manage items, apply coupons, proceed to checkout |
| Checkout | `/checkout` | Address form + payment method (Razorpay / Cashfree / COD) |
| My Orders | `/orders` | Order history with status |
| Order Detail | `/orders/:id` | Tracking timeline, items, address |
| Profile | `/profile` | Edit profile, ring sizer tool, links to all account pages |
| Wishlist | `/wishlist` | Saved products |
| Notifications | `/notifications` | Inbox + preferences toggles |
| Help & Support | `/help` | FAQs, contact info, live chat widget |
| Privacy Policy | `/privacy` | Full privacy policy |
| Custom Jewellery | `/custom-jewellery` | 4-step bespoke jewellery request form |

### Admin Pages
| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/admin` | KPI stats, recent orders, quick actions |
| Products | `/admin/products` | Search, add, edit, delete products |
| Add/Edit Product | `/admin/products/add` | Form with image upload + URL paste fallback |
| Orders | `/admin/orders` | Manage all orders, update status |
| Users | `/admin/users` | View all users, change roles (User ↔ Admin), send push notifications |
| Analytics | `/admin/analytics` | Sessions, revenue chart, locations, pages visited, Google Analytics connector |
| CMS | `/admin/cms` | Edit hero banners, marquee text, commitment section, home stats, toggle payment methods |

### Core Features
- ✅ JWT authentication (register / login / profile edit)
- ✅ Role-based access (USER / ADMIN)
- ✅ Ring Sizer tool (circumference / diameter → India/US/mm size chart)
- ✅ Similar Products on every product page
- ✅ Shop by Color (8 color filters)
- ✅ Shop by Bond (10 relationship categories)
- ✅ Shop by Style (For Her / For Him)
- ✅ Diwali festive sale section with live countdown timer
- ✅ Razorpay + Cashfree + COD payments (scripts loaded dynamically)
- ✅ Cloudinary image upload (graceful fallback to URL paste)
- ✅ Coupon codes (percentage + flat discount)
- ✅ Admin can toggle which payment methods appear at checkout
- ✅ Push notification modal (admin → all users)
- ✅ Google Analytics ID connector in admin
- ✅ Live chat widget on Help page
- ✅ Mobile-first responsive design (bottom nav, no overlapping sticky panels)
- ✅ Functional footer with real navigation links

---

## 🔐 API Endpoints Reference

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
PUT    /api/auth/profile
PUT    /api/auth/change-password

GET    /api/products               ?category, color, gender, search, sort, page
GET    /api/products/:id
POST   /api/products               (admin)
PUT    /api/products/:id           (admin)
DELETE /api/products/:id           (admin)

GET    /api/cart
POST   /api/cart/add
PUT    /api/cart/item/:id
DELETE /api/cart/item/:id

POST   /api/orders
GET    /api/orders/my
GET    /api/orders/:id
PUT    /api/orders/:id/cancel

POST   /api/payments/razorpay/create-order
POST   /api/payments/razorpay/verify
POST   /api/payments/cashfree/create-session
POST   /api/payments/cashfree/verify
POST   /api/payments/cashfree/webhook

POST   /api/upload/image           (admin — requires CLOUDINARY_URL)
POST   /api/upload/images          (admin — requires CLOUDINARY_URL)

GET    /api/wishlist
POST   /api/wishlist/toggle

POST   /api/coupons/validate

GET    /api/admin/stats            (admin)
GET    /api/admin/users            (admin)
PUT    /api/admin/users/:id/role   (admin)
GET    /api/admin/analytics        (admin)
POST   /api/admin/push-notification (admin)
GET    /api/admin/coupons          (admin)
POST   /api/admin/coupons          (admin)
DELETE /api/admin/coupons/:id      (admin)
```

---

## 🎨 Coupon Codes (from seed)

| Code | Type | Discount | Min Order |
|------|------|----------|-----------|
| ADORE10 | 10% off | 10% | ₹5,000 |
| WELCOME500 | Flat | ₹500 | ₹3,000 |
| LUXURY20 | 20% off | 20% | ₹50,000 |

---

## 🐛 Troubleshooting

**Razorpay/Cashfree not opening?**
- Check `RAZORPAY_KEY` and `RAZORPAY_SECRET` are set correctly in server `.env`
- Ensure you're using test keys in development (`rzp_test_...`)
- Both SDKs are loaded dynamically — no script tags needed in HTML

**Image upload failing?**
- Set `CLOUDINARY_URL` in server environment, OR
- Use the "paste image URL" fallback in Add Product form

**Timer not counting down?**
- The Diwali countdown uses `sessionStorage` to persist across re-renders
- Clear `sessionStorage` in browser DevTools to reset it

**Checkout overlapping on mobile?**
- All sticky panels collapse to `position: static` on screens ≤ 768px

---

*Built with ❤️ for ADORE Fine Jewellery*


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
