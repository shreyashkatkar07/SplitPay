# SplitPay


## About

**Split Expenses. Simplify Life.**

SplitPay is the smart way to split expenses with friends, roommates, or groups. Effortlessly track, split, and settle shared bills—no more confusion over who owes what. Enjoy real-time updates, secure settlements, and a seamless experience for both group and 1:1 expenses.

---


## Unique Feature: Controlled Settlements

> **🚀 Only the person who is owed can settle up—adding a layer of control and security not found in Splitwise.**

---


## Features

Everything you need to split expenses:

* **1:1 Expenses** – Split and settle directly with a friend for any one-on-one activity.
* **Group Expenses** – Create groups for roommates, trips, or events to keep expenses organized.
* **Multiple Split Types** – Split equally, by percentage, or by exact amounts to fit any scenario.
* **Controlled Settlements** – Only the person who is owed can initiate a settlement. *(Unique)*
* **Real-time Updates** – See new expenses and repayments the moment your friends add them.
* **Payment Reminders** – Automated reminders for pending debts. *(upcoming)*
* **Expense Analytics** – Track spending patterns and discover insights. *(upcoming)*
* **Recurring Expenses** – Automatically add repeating expenses for subscriptions, rent, and more. *(upcoming)*


## How It Works

Splitting expenses has never been easier:

1. **Start or Select a Group/Person** – Create a group for shared expenses or pick a friend for 1:1 splits.
2. **Add an Expense** – Enter the amount, choose who paid, and split the bill your way.
3. **Settle Up Securely** – See balances and let the person who is owed record the payment.

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
