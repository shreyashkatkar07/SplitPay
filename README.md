# SplitPay

## About

**Split Expenses. Simplify Life.**
The smart way to split expenses with friends.
Track shared expenses, split bills effortlessly, and settle up quickly with **SplitPay**. Never worry about who owes who again.

---

## Features

Everything you need to manage shared expenses:

* **Group Expenses** – Create groups for roommates, trips, or events.
* **Multiple Split Types** – Split equally, by percentage, or exact amounts.
* **Real-time Updates** – Instantly see new expenses and repayments.
* **Payment Reminders** – Get automated notifications for pending debts.
* **Expense Analytics** – Track spending patterns and discover insights.

---

## How It Works

Splitting expenses has never been easier:

1. **Create or Join a Group** – Start a group for your roommates, trip, or event and invite friends.
2. **Add Expenses** – Record who paid and how the bill should be split.
3. **Settle Up** – View balances and log payments when debts are cleared.

---

## Tech Stack

This project is a Full Stack AI Splitwise Clone built with:

- **Frontend:** [Next.js](https://nextjs.org/) (SSR/SSG, routing, API routes), [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/) (utility-first styling), [Shadcn UI](https://ui.shadcn.com/) (modern UI components)
- **Backend & Database:** [Convex](https://convex.dev/) (serverless backend, real-time database, actions/mutations)
- **Authentication:** [Clerk](https://clerk.com/) (user sign-in, sign-up, session management)
- **Workflows/CRON/Background Jobs:** [Inngest](https://www.inngest.com/) (scheduled jobs, background processing)
- **Email:** [Resend](https://resend.com/) (transactional email delivery)
- **UI/UX:** [Sonner](https://sonner.emilkowal.ski/) (toast notifications), [Lucide-react](https://lucide.dev/) (icons)
- **Tooling:** ESLint (linting), PostCSS (CSS processing), Node.js (runtime)
- **Deployment:** [Vercel](https://vercel.com/) (hosting, serverless deployment, global CDN)

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
