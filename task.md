# Refinement Tasks

- [x] **Fix Global Mutable State (Critical):** `activeCurrency` in `src/lib/utils.ts` is mutable and global. This is a thread-safety risk. Convert to Context-based or Props-based passing.
- [x] **Decouple Email Templates (Maintenance):** Refactor `src/services/email.ts` to use React Email or separate template files. Current giant strings are unmaintainable.
- [x] **Lock Admin Panel (Security):** Implement `ADMIN_PASS` protection for `/admin` routes using Middleware and a simple login page.
- [x] **Strict Typing for API Routes (Security):** Add Zod schema validation for all API inputs to prevent bad data hitting the Service layer.
    - [x] Install `zod`.
    - [x] Create schemas in `src/lib/validators`.
    - [x] Apply to `api/orders`.
    - [x] Apply to `api/auth`.
- [ ] **Database Indexes:** Review if `products.slug` and foreign keys have proper indexes (Performance).
