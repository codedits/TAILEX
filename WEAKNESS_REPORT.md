# codebase Weakness & Vulnerability Analysis

This report outlines critical and moderate weaknesses identified in the current codebase, along with recommended remediation steps.

## 1. Critical Availability & Integrity Risks

### ❌ Zero-Transaction Order Creation (Race Conditions & Data Integrity)
**Location:** `src/services/orders.ts` (Lines 125-213)
**Issue:** The `createOrder` function performs multiple sequential database operations (Insert Order → Upsert Customer → Insert Items → Update Stock) **without a database transaction**.
- **Risk 1 (Data Corruption):** If the server crashes or network fails after Step 1 (Order Insert) but before Step 3 (Item Insert), you will have "Ghost Orders" with no items.
- **Risk 2 (Race Condition):** Stock checking is performed in-memory (`stockAvailable < item.quantity`). If two users buy the last item simultaneously, both will pass the check, and stock will go negative or be oversold.
**Recommendation:** Move the entire Order Creation logic into a Postgres function (RPC) to ensure **Atomic Transactions** (ACID compliance).

### ❌ Synchronous Helper Blocking
**Location:** `src/services/orders.ts`, `src/services/email.ts`
**Issue:** `await EmailService.sendOrderConfirmation(...)` is called directly within the `createOrder` flow.
- **Risk:** If the SMTP server is slow (e.g., 5-10 second delay) or down, the user's Checkout Request will hang or timeout. The user might refresh and double-charge.
**Recommendation:** Use a background job queue (e.g., Inngest, Trigger.dev, or even a simple Supabase Edge Function with `invoke('background')`) to send emails asynchronously.

---

## 2. Type Safety & Code Quality

### ⚠️ Usage of `any` Type
**Location:** `src/services/orders.ts`
- Line 48: `const orderItems: any[] = [];`
- Line 123: `let order: any;`
**Issue:** Usage of `any` defeats TypeScript's purpose. It hides potential bugs where properties might be accessed incorrectly (e.g., typo in `order.id` vs `order.uuid`) and breaks IDE divide-and-conquer refactoring.
**Recommendation:** Define strict interfaces for `OrderItemPayload` and proper return types for Supabase queries.

### ⚠️ Manual Rollback Logic
**Location:** `src/services/orders.ts` (Lines 207-209)
**Code:** `await supabase.from('orders').delete().eq('id', order.id);`
**Issue:** The code attempts to manually "undo" an order creation if an error occurs. This is unreliable. If the "UNDO" operation fails (e.g., DB connection lost), the corrupt data remains permanently.
**Recommendation:** Replace with Database Transactions (see Section 1).

---

## 3. Maintenance & Scalability

### ⚠️ Hardcoded Email Templates
**Location:** `src/services/email.ts`
**Issue:** HTML for emails is stored as template literals inside the service helper.
- Hard to style or preview.
- Clutters the logic with massive strings.
**Recommendation:** Use **React Email** or separate template files to keep logic clean and templates testable.

### ⚠️ Global Mutable State
**Location:** `src/lib/utils.ts` (Line 62: `let activeCurrency ...`)
**Issue:** Storing `activeCurrency` as a module-level variable is dangerous in a Serverless/Next.js environment.
- **Risk:** In a lambda environment, this variable *might* persist between requests for different users, causing User A to see User B's currency currency settings if not carefully managed.
**Recommendation:** Pass currency configuration as a function argument or use React Context/Request Filters, never global variables.

---

## 4. Security Considerations

### 🛡️ Custom Authentication Complexity
**Context:** The app uses a custom JWT flow instead of standard Supabase Auth.
**Risk:** Custom auth requires maintaining your own security perimeters (Token Expiry, Refresh Tokens, XSS protection). While `httpOnly` cookies are good, ensures specifically that `JWT_SECRET` is rotated and high-entropy. Ensure `verify-otp` rate limiting is enforced to prevent SMS/Email flooding attacks.

---

## Summary of Action Plan

1.  **High Priority:** Refactor `createOrder` to use a Supabase RPC function for atomic transactions.
2.  **High Priority:** Decouple Email sending from the critical path (fire-and-forget).
3.  **Medium Priority:** Remove `any` types in Service layers.
4.  **Low Priority:** Extract Email templates to separate files.
