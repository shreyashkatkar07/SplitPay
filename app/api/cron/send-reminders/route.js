import { NextResponse } from 'next/server';
// import { api } from '@convex-dev/convex/browser'; // Uncomment and configure if using Convex npm package
import { Resend } from 'resend';

// TODO: Implement this function to fetch unpaid expenses from Convex
async function fetchUnpaidExpenses() {
  // Example: return await api.expenses.getUnpaidExpenses();
  // Replace with your actual query and arguments
  return [];
}

export async function GET(req) {
  // Authorization check for Vercel cron
  if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch unpaid expenses
  const expenses = await fetchUnpaidExpenses();
  const resend = new Resend(process.env.RESEND_API_KEY);
  let emailsSent = 0;
  let errors = [];

  for (const expense of expenses) {
    for (const split of expense.splits) {
      if (!split.paid && split.userId !== expense.paidByUserId) {
        // Compose email
        const subject = `Reminder: You owe ₹${split.amount} for '${expense.description}'`;
        const html = `<p>Hi,</p><p>This is a reminder that you owe <b>₹${split.amount}</b> for the expense: <b>${expense.description}</b>.</p>`;
        try {
          const result = await resend.emails.send({
            from: 'SplitPay <onboarding@resend.dev>',
            to: 'shreyashkatkar04@gmail.com', // Make sure to include email in your split/user data
            subject,
            html,
          });
          emailsSent++;
        } catch (e) {
          errors.push({ split, error: e.message });
        }
      }
    }
  }

  return NextResponse.json({ ok: true, emailsSent, errors });
}
