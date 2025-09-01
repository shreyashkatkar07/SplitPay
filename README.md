# SplitPay

## About

**Split Expenses. Simplify Life.**
The smart way to split expenses with friends.
Track shared expenses, split bills effortlessly, and settle up quickly with **SplitPay**. Never worry about who owes who again.

---


## Unique Feature: Controlled Settlements

> **🚀 Unlike Splitwise, only the person who is owed can initiate a settlement in SplitPay.**
> 
> This prevents accidental or premature settlements and ensures that only the rightful recipient can clear a debt. This is a unique safeguard not found in Splitwise!

---

## Features

Everything you need to manage shared expenses:

* **Group Expenses** – Create groups for roommates, trips, or events.
* **Multiple Split Types** – Split equally, by percentage, or exact amounts.
* **Real-time Updates** – Instantly see new expenses and repayments.
* **Payment Reminders** – Get automated notifications for pending debts. *(under development)*
* **Expense Analytics** – Track spending patterns and discover insights. *(under development)*
* **Recurring Expenses** – Automatically add repeating expenses for subscriptions, rent, and more. *(under development)*

## How It Works

Splitting expenses has never been easier:

1. **Create or Join a Group** – Start a group for your roommates, trip, or event and add friends.
2. **Add Expenses** – Record who paid and how the bill should be split.
3. **Settle Up** – View balances and log payments when debts are cleared.

---

## Tech Stack

This project is a Full Stack Splitwise Clone built with:

- **Frontend:** [Next.js](https://nextjs.org/), [Tailwind CSS](https://tailwindcss.com/)
- **Backend & Database:** [Convex](https://convex.dev/)
- **Authentication:** [Clerk](https://clerk.com/)
- **Workflows/Background Jobs:** [Inngest](https://www.inngest.com/)
- **Email:** [Resend](https://resend.com/)
- **UI/UX:** [shadcn/ui](https://ui.shadcn.com/), [Sonner](https://sonner.emilkowal.ski/), [Lucide-react](https://lucide.dev/)
- **Deployment:** [Vercel](https://vercel.com/)

---

## Setup & Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/splitpay.git
cd splitpay
```

### 2. Create `.env.local`

Add the following environment variables:

```env
# Convex
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_JWT_ISSUER_DOMAIN=

# Email / APIs
RESEND_API_KEY=
GEMINI_API_KEY=
```

👉 *Refer to official docs for setting up each service.*

### 3. Install dependencies

```bash
npm install
```

### 4. Start development servers

Open **two terminals**:

**Terminal 1:**

```bash
npx convex dev
```

**Terminal 2:**

```bash
npm run dev
```

### 5. Open in browser

Go to: **[http://localhost:3000](http://localhost:3000)**

---

## Deployment

Deploy easily with [Vercel](https://vercel.com/) or any platform that supports Next.js and Node.js.

---

## License

MIT License – feel free to use and modify.

---
