# Performance & UX Architecture Report

This document outlines the performance optimizations, architectural decisions, and data strategies implemented to ensure **TAILEX** delivers a premium, high-speed user experience.

## 1. Performance Optimizations

### Consolidated Data Fetching
**Problem:** The application previously made 10+ separate database calls on the initial load to fetch individual configuration items (Brand, Theme, Navigation, Footer, Social, Hero, etc.).
**Solution:** We implemented `StoreConfigService`, a unified service that fetches all global configuration in a **single database query**.
**Impact:**
- **Database Load:** Reduced by ~90% for page loads.
- **Latency:** Significantly improved Time to First Byte (TTFB) by eliminating waterfall requests.
- **Consistency:** Ensures all parts of the application render with the same configuration snapshot.

### Parallel Execution
**Strategy:** utilized `Promise.all()` in critical server components (Home Page, Product Detail Page).
**Benefit:** Independent data (e.g., Product Details vs. Global Navigation) is fetched concurrently rather than sequentially. The page load time is now determined by the slowest single query rather than the sum of all queries.

### Edge Caching
**Mechanism:** Uses Next.js `unstable_cache` with revalidation tags.
**Configuration:** Global settings are cached for **1 hour** (3600s).
**Result:** Subsequent visitors are served configuration data instantly from the server's memory/edge cache without hitting the database.

---

## 2. Server vs. Client Architecture

We strictly follow the "Server Defaults, Client Interactivity" pattern to balance performance and UX.

| Component Type | Examples | Responsibility | Performance Benefit |
|:--- |:--- |:--- |:--- |
| **Server Components (RSC)** | `layout.tsx`, `page.tsx`, `ProductPage` | Fetching data (Products, Config), Generating Metadata (SEO), Initial HTML render. | Zero bundle size impact for data fetching logic. Direct database access. SEO friendly. |
| **Client Components** | `Navbar`, `CheckoutWizard`, `AddToCart`, `CartDrawer` | Handling user clicks, Form inputs, Mobile menu toggles, Toast notifications. | Interactive UI updates happen instantly without server roundtrips. |

---

## 3. Hardcoded vs. Dynamic (Soft-Coded) Data

To provide flexibility without sacrificing reliability, we utilize a hybrid approach.

### Dynamic (Soft-Coded) - managed via Database
*These elements can be changed instantly from the Admin Dashboard without deploying code.*
- **Global Theme:** Primary/Secondary colors, Font selection, Border radius.
- **Content:** Product details, Collection lists, Hero section text/images.
- **Navigation:** Main Menu and Footer links.
- **Brand Identity:** Site Name, Tagline, Announcement banners.

### Hardcoded (Codebase)
*These elements represent the core structural logic of the application.*
- **Page Layouts:** The specific grid structure of the Product Page and Checkout.
- **Business Logic:** The precise steps of the Checkout flow (Email → OTP → Details).
- **Default Fallbacks:** Robust default values (e.g., a standard fallback layout) are hardcoded to ensure the site **never crashes**, even if the database configuration is missing or corrupted.

---

## 4. Caching & State Strategy

### Server-Side Caching (Next.js)
- **`site_config`**: Cached globally. Revalidated on admin updates.
- **Static Routes**: Homepage and Collection pages are statically optimized where possible.

### Client-Side State
- **`UserAuthContext`**: Manages the user's session state.
- **`CartContext`**: Persists the user's shopping cart in `localStorage` for returning visitors, while validating stock against the server in real-time.

---

## 5. Security & Authentication (Cookies)

- **`auth_token`**:
    - **Type:** HTTP-Only, Secure Cookie.
    - **Content:** JSON Web Token (JWT) containing safely signed User ID and Email.
    - **Purpose:** Server-side verification for API routes and Middleware. Impossible for client-side JavaScript to read (prevents XSS attacks).
- **Row Level Security (RLS)**: Database policies ensure users can only access their own sensitive data (Orders, Addresses), regardless of the API usage.

---

**Summary:** The application is optimized for a "Read-Heavy" workload typical of e-commerce, prioritizing instant initial loads via Server Components and Caching, while handing off to Client Components for a smooth, app-like interactive experience.
