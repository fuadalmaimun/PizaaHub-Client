# 🍕 PizzaHub — Pizza Ordering & Delivery Platform

**PizzaHub** is a full-stack, role-based pizza ordering platform. Customers discover local pizza shops, browse menus, and place food orders. Vendors publish menu items, manage incoming orders, and upgrade to a **Premium** subscription through Stripe Checkout. Admins manage users, review menu items, and monitor platform transactions.

- **Live Website:** https://pizzahub-client.vercel.app
- **Client Repository:** https://github.com/fuadalmaimun/PizaaHub-Client
- **Server Repository:** https://github.com/fuadalmaimun/PizzaHub-Server

## 🚀 Key Features

### 👤 Customer
- Browse approved menu items on the home page and the public Browse Menu page.
- Search by name, filter by category and location, and sort by price (low to high / high to low).
- View item details with images, description, vendor information and reviews.
- Place food orders with a delivery date, delivery address and special instructions — **no online payment is required for food orders**.
- Track order status, cancel pending orders, and keep a wishlist of favorite items.

### 🏪 Vendor
- Create and manage a restaurant profile (name, business name, profile image).
- Add, update, delete and toggle availability of menu items (images uploaded through **ImgBB**).
- Review incoming orders and accept or reject them (pending orders only, one-time action).
- Free plan: **max 3 active menu items**. Premium: unlimited items, Premium badge and featured homepage placement.
- Upgrade, cancel or resume the Premium subscription through **Stripe Checkout** and the customer portal-style subscription page.

### 🛡️ Admin
- Manage users: search, filter by role, block/unblock, and change a user's role (customer / vendor / admin).
- Review menu items: approve, reject, change status, or delete inappropriate items.
- Read-only transaction history with vendor details, plan, amount, status and date.
- Dashboard with statistics cards and charts (users by role, menu status, monthly Premium revenue).

## 💳 Subscription Plans

| Feature | Free | Premium |
|---|---|---|
| Active Menu Items | Maximum 3 | Unlimited |
| Vendor Dashboard | Basic | Included |
| Order Management | Included | Included |
| Premium Badge | No | Yes |
| Featured Menu Placement | No | Yes |
| Price | $0 | $10 / year |

## 🛠️ Technology Stack

**Frontend**
- Next.js (App Router) + TypeScript
- Tailwind CSS v4 + ShadCN UI + Lucide React
- Recharts (dashboard charts) and Motion (homepage animations)
- Better Auth (email/password + Google OAuth) with the MongoDB adapter
- `next-themes` (dark / light mode), `sonner` (toast notifications)

**Backend**
- Express.js + MongoDB (official `mongodb` driver)
- JWT verification middleware with role-based guards (admin / vendor / customer)
- Stripe Checkout + webhooks for vendor subscriptions
- ImgBB API for menu item image uploads
- Nodemailer for order status emails

**Payments & Images**
- Stripe (vendor Premium subscriptions only — never for food orders)
- ImgBB (menu item images and profile photos)

## ⚙️ Installation & Setup

### 1. Clone the repositories

```bash
git clone https://github.com/fuadalmaimun/PizaaHub-Client.git
git clone https://github.com/fuadalmaimun/PizzaHub-Server.git
```

### 2. Install dependencies

```bash
cd PizaaHub-Client && npm install
cd ../PizzaHub-Server && npm install
```

### 3. Configure environment variables

Create a `.env` file in both projects. `.env` files are ignored by Git and must never be committed.

**Client (`PizaaHub-Client/.env`)**

```env
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:5000
MONGODB_URI=
DB_NAME=pizzaHub
IMAGEBB_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

**Server (`PizzaHub-Server/.env`)**

```env
PORT=5000
MONGODB_URI=
DB_NAME=pizzaHub
CLIENT_URL=http://localhost:3000
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_YEARLY_PRICE_ID=
EMAIL_USER=
EMAIL_PASS=
```

### 4. Run the backend

```bash
cd PizzaHub-Server
npm run dev
```

### 5. Run the frontend

```bash
cd PizaaHub-Client
npm run dev
```

Open http://localhost:3000 in your browser.

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admintest1@gmail.com` | `Admin12` |

Stripe test card for the Premium subscription: `4242 4242 4242 4242` (any future expiry date, any CVC).

## 🎯 Challenge Requirements

### 1. Advanced search and sorting
The Browse Menu page keeps search, category, location and price order in React state and derives the visible list with a single filtered/sorted array, so every control combines correctly:

- `search` — case-insensitive match on the item name.
- `category` / `location` — exact match against the values collected from the approved items.
- `priceOrder` — `low-to-high` sorts ascending and `high-to-low` sorts descending by price.

Only approved and active items are fetched from the API, so rejected or pending items never reach the public grid.

### 2. JWT verification middleware
Every protected Express route runs `verifyToken` before its role guard (`verifyAdmin`, `verifyVendor`, `verifyCustomer`):

1. The `Authorization: Bearer <token>` header is read and verified with the server secret.
2. The token payload is resolved to a user in MongoDB; missing, expired or invalid tokens return **401**.
3. Blocked users are rejected, and role guards return **403** for the wrong role.
4. Resource ownership is re-checked inside the handler (for example, a vendor can only update their own menu items and orders).

The client sends the Better Auth session token with every protected request and never trusts client-side role checks alone.

### 3. Professional appearance
The UI uses a warm pizza-inspired palette, a shared design system for cards, buttons and headings, animated homepage sections, and fully responsive dashboards with sidebar navigation, statistics cards and charts.

## ✨ Optional Features Implemented

- ⭐ Reviews and ratings for menu items
- 🌗 Dark / light mode toggle
- 🕒 Order status timeline on order details
- ❤️ Favorites / wishlist for customers
- 📧 Email notification when an order is accepted or rejected

## 🔐 Security

- Better Auth, MongoDB, Stripe, Google OAuth and ImgBB credentials are stored in environment variables only.
- `.env` files are excluded from version control.
- JWT verification and role checks run on the server for every protected API route.
- Premium access is activated only after a verified Stripe webhook event; the frontend success page is for UI confirmation only.
- Admins cannot edit transaction records, and users cannot change their own role or subscription plan through profile updates.

## 👨‍💻 Developer

**Fuad Al Maimun** — Full Stack Developer

---

*PizzaHub — Fresh Pizza, Easy Ordering!* 🍕
