# 🍕 PizzaHub — Pizza Ordering & Delivery Platform (Frontend)

> **AI Agent Context Note:** This document contains the complete product specification, architecture, routing rules, database schemas, and UI/UX guidelines for the **PizzaHub** frontend application. Read this thoroughly before generating or modifying components, API calls, or routes.

---

## 📌 Project Overview
**PizzaHub** is a full-stack, role-based pizza ordering and delivery platform.
- **Customers** discover local pizza shops, search/filter menu items, place orders (no online payment required for food orders), and track/cancel their orders.
- **Vendors (Restaurants)** create profiles, publish menu items (ImgBB hosted), accept/reject incoming orders, and upgrade to a **Premium** subscription via **Stripe Checkout** to unlock unlimited menu items and featured homepage placement.
- **Admins** manage users (block/unblock), approve/reject menu items, and monitor immutable platform subscription transactions.

---

## 🔗 Important Links & Repositories
- **Live Website:** `[INSERT_LIVE_CLIENT_URL]`
- **Backend API URL:** `[INSERT_LIVE_SERVER_URL]`
- **Client Repository:** `[INSERT_CLIENT_REPO_URL]`
- **Server Repository:** `[INSERT_SERVER_REPO_URL]`

---

## 🛠️ Technology Stack
- **Framework:** Next.js (App Router)
- **Language:** TypeScript / JavaScript
- **UI & Styling:** Tailwind CSS, ShadCN UI, Lucide React (use the new **X** logo instead of Twitter bird)
- **Animations:** Framer Motion / Motion (smooth, subtle animations on homepage sections)
- **Authentication:** Better Auth (Email/Password + Google OAuth) + JWT verification for Express backend
- **Image Hosting:** ImgBB API (mandatory for menu item image uploads)
- **Payments:** Stripe Checkout (exclusively for Vendor Premium subscriptions)
- **Notifications:** Toast notifications (e.g., `sonner` or `react-hot-toast` — **NEVER** use browser `alert()`)

---

## 🎨 UI/UX & Design Guidelines
- **Theme & Color Palette:** Warm pizza-inspired theme featuring **Warm Reds**, **Oranges**, and **Cream** backgrounds.
- **Consistency:**
  - Keep main heading styles (font, size, color) consistent across all sections.
  - Maintain uniform card heights, widths, and image aspect ratios (especially in menu grids).
  - Use consistent button variants matching the homepage CTA style.
- **Responsiveness:** Fully responsive across mobile, tablet, and desktop.
- **Dashboard Layout:** Dedicated full-width layout with a collapsible sidebar (mobile-friendly) and role-based navigation links, stat cards, and data visualization charts (e.g., Recharts).
- **Error & Loading States:** Custom 404 page, skeleton/spinner loaders for all async fetches and form submissions, and graceful error handling for failed API requests or ImgBB uploads.

---

## 🗺️ Page & Route Architecture

### 1. Public Routes
- `/` — **Home Page:**
  - **Hero Banner:** Headline (e.g., *"Hot & Fresh Pizza Delivered to Your Door"*), short description, *"Explore Pizza Menu"* CTA, pizza background visual.
  - **Featured Menu Items:** At least 6 `approved` & active items from DB (Premium vendor items prioritized). Card shows: image, name, category, price, location, vendor info, and `View Details` button.
  - **Pizza Categories:** Interactive category filter/cards (`Classic Pizzas`, `Vegetarian Pizzas`, `Meat Lovers`, `Specialty / Gourmet Pizzas`, `Sides & Appetizers`, `Beverages & Desserts`).
  - **Extra Section 1 (Mandatory):** *Why Choose PizzaHub?*
  - **Extra Section 2 (Pick One):** *How PizzaHub Works* / *Popular Pizza Combos* / *Customer Testimonials* / *Pizza Lovers' Tips*.
- `/menu` — **Browse Menu:**
  - Public grid of `approved` & active items.
  - Search by item name, filter by category & location, **sort by price (Ascending & Descending)**.
  - Clicking `View Details` when logged out redirects to `/sign-in`.
- `/sign-in` — Email/Password + Google OAuth login. Redirects to role-specific dashboard on success.
- `/sign-up` — Fields: Full Name, Email, Password (min 6 chars, 1 uppercase, 1 lowercase), Profile Image (optional), Role (`customer` or `vendor` ONLY — **Admin cannot register publicly**), plus Google OAuth.

### 2. Private & Role-Protected Routes
> **Critical Rule:** Reloading any private route in production must NEVER throw a 404 or falsely redirect an authenticated user to `/sign-in`. Users must NOT access another role's dashboard via manual URL manipulation. Blocked users (`isBlocked: true`) must be denied access to protected features.

- `/menu/[id]` — **Item Details (Authenticated Users Only):**
  - Displays multiple images, name, category, description, price, location, vendor info, and Order button/form.
  - Shows clear error UI for invalid/unapproved item IDs.
- `/payment/success` & `/payment/cancel` — Stripe subscription redirect pages.
- **Customer Dashboard (`/dashboard/customer/...`):**
  - `Overview`: Stat cards & charts (total, pending, accepted, rejected orders).
  - `My Orders`: List of orders with item image/name, vendor info, delivery date, address, status, and **Cancel** button (only for `pending` orders).
  - `Profile Settings`: Update name/image (cannot modify role).
- **Vendor Dashboard (`/dashboard/vendor/...`):**
  - `Overview`: Stat cards & charts (total items, active items, pending orders, accepted orders, current subscription plan).
  - `My Menu Items`: Read, update, toggle availability, and delete own items. Displays approval status (`pending`, `approved`, `rejected`, `inactive`).
  - `Add Menu Item`: Form (Name, Category, Description, Price, Location, Image uploaded via **ImgBB**). Enforces **max 3 active items on Free plan**; unlimited on Premium.
  - `Customer Orders`: View incoming orders and **Accept** or **Reject** (`pending` orders only, one-time action).
  - `Subscription`: Compare Free vs. Premium plans + **Upgrade to Premium** button (triggers Stripe Checkout session).
  - `Profile Settings`: Update name, business name, and image.
- **Admin Dashboard (`/dashboard/admin/...`):**
  - `Overview`: Platform metrics & charts (total users, vendors, customers, menu items, pending items, total transactions).
  - `Manage Users`: Search by name/email, filter by role, **Block / Unblock** users.
  - `Manage Menu Items`: Search/filter all items, **Approve / Reject** pending items, update status, or delete inappropriate items.
  - `Transactions`: Read-only table of vendor Stripe subscription payments (Admins **cannot** edit transaction statuses).

---

## ⚙️ Core Business Rules (Must Enforce in UI & API Integration)
1. **Order Placement:**
   - Only `customer` role can place orders (Vendors cannot order their own items; Admins cannot place orders).
   - No Stripe payment for food orders—just a standard order submission form (`Delivery Date`, `Delivery Address`, `Special Instructions`).
   - Prevent duplicate active orders for the same item on the same delivery date.
2. **Menu Item Visibility:**
   - Only items with `status === "approved"` (and active) appear on Home and Browse Menu. Rejected/Pending items are strictly hidden from customers.
3. **Vendor Subscription & Stripe Security:**
   - Free tier limit: **3 active menu items**.
   - Premium activation relies strictly on backend **Stripe Webhooks** (frontend `/payment/success` is only for UI confirmation).
4. **Authentication & API Headers:**
   - Send JWT token in `Authorization: Bearer <token>` (or secure HTTP-only cookies per backend setup) on all protected API requests.

---

## 🗄️ Expected Backend Data Models (Reference)

```ts
// users (Better Auth extended)
interface User {
  _id: string;
  name: string;
  email: string;
  image?: string;
  role: 'customer' | 'vendor' | 'admin';
  isBlocked: boolean;
  businessName?: string; // vendor only
  subscriptionPlan?: 'free' | 'premium'; // vendor only
  subscriptionExpiresAt?: string;
}

// menuItems
interface MenuItem {
  _id: string;
  vendorId: string;
  itemName: string;
  category: string;
  description: string;
  price: number;
  location: string;
  images: string[]; // ImgBB URLs
  status: 'pending' | 'approved' | 'rejected' | 'inactive';
  createdAt: string;
}

// orders
interface Order {
  _id: string;
  itemId: string;
  vendorId: string;
  customerId: string;
  deliveryDate: string;
  deliveryAddress: string;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  createdAt: string;
}

// transactions
interface Transaction {
  _id: string;
  vendorId: string;
  plan: string;
  amount: number;
  currency: string;
  stripeSessionId: string;
  stripeSubscriptionId?: string;
  status: string;
  createdAt: string;
}

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
