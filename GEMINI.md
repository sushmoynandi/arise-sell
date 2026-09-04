# Arise-Sell Project Memory & Architecture Guidelines

This document persists the core product decisions, subscription tier model, and business logic agreed upon for **Arise-Sell**.

---

## 1. Subscription Plans & Dynamic Multi-Tenant Tiering

All subscription tiers are configured and dynamically controlled from the **Super Admin Panel** (stored in the database).

### Plan Tiers & Resource Allocations

| Plan         | Business (Store) Limit | Team Member Limit                                        | Target Audience & Economics                                                                     |
| :----------- | :--------------------- | :------------------------------------------------------- | :---------------------------------------------------------------------------------------------- |
| **Free**     | **1 Business**         | **1 Member** (Owner only)                                | Solo entrepreneurs testing the platform; limited conversation/order quota.                      |
| **Grow**     | **1 Business**         | **2 Members** (Owner + 1 Assistant/Moderator)            | Small F-commerce pages with single-shift operations.                                            |
| **Pro**      | **1 Business**         | **4 Members** (Owner + 2 Chat Agents + 1 Dispatch Staff) | Active growing brands needing shift coverage, fraud shield, and courier auto-booking.           |
| **Business** | **2 Businesses**       | **8 Members**                                            | Super-sellers / serial entrepreneurs running 2 distinct brand stores (e.g. clothing + jewelry). |
| **Custom**   | **3 – 10 Businesses**  | **10 – 30 Members**                                      | D2C brand aggregators, e-commerce agencies, enterprise high-volume operations.                  |

---

## 2. Hybrid Quota & Unit Economics (vs. AlapAI Model)

- **AlapAI (alapai.app)** bills primarily on active AI conversation count (chat sessions) due to LLM token costs.
- **Arise-Sell** is a complete Conversational Commerce ERP (AI Chatbot + Order Lifecycle + Courier Integration with Steadfast/Pathao + Fraud Shield + Invoicing + Multi-Store).
- **Enforcement Rule**: To safeguard LLM API margins while maximizing customer lifetime value (LTV), each plan enforces a **Hybrid Quota**:
  1. `max_businesses` (enforced at store creation)
  2. `max_team_members` (enforced at team member invitation)
  3. `monthly_orders_quota` / `conversation_quota` (soft/hard capped with 1-click top-up options)

---

## 3. Account & Security Architecture

1. **Store Teammates & Access (`TabAccount.tsx`)**:
   - Must preserve the team members table, role assignments (`Owner`, `Manager`, `Agent`, `Staff`), assigned channel badges, and presence status.
   - Dynamic seats indicator (`Active Seats Occupied: {current_members} / {plan_max_members}`).
   - "+ Add Team Member" modal enforces the active plan's member ceiling and prompts upgrade if limit is reached.
2. **Danger Zone (`Delete Store: {storeName}`)**:
   - **User Account Permanence**: User identity accounts (Email, Password, Google Auth, 2FA) are permanent anchors and are NOT deleted. Merchants can have multiple stores or create new stores without having to recreate accounts.
   - **Store Cascading Purge**: Deleting a store cleanly deletes the `Business` and cascades to delete all store-tied dependencies: connected channels (WhatsApp, Messenger, Instagram), catalog products & variants, customer conversation threads, orders, and courier integrations (Steadfast, Pathao).
   - **User Detachment**: When an owner deletes their store, foreign key constraint `users_business_id_fkey` with `ON DELETE SET NULL` ensures the owner user record survives with `user.business_id = None`. They are redirected to `/choose-plan?store_deleted=true` where they can create a new store or select a plan anytime.
3. **Login & Security**:
   - Full-width Meta/Stripe-style credential rows (Password, 2FA, Active Sessions).
   - Google OAuth users without passwords display "Add Account Password" and hide 2FA until password creation.
