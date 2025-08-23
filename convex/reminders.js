// convex/reminders.js
// Scheduled job to send daily payment reminders at 5:25pm IST

import { api } from "./_generated/api";
import { mutation } from "./_generated/server";

export const sendDailyPaymentReminders = mutation({
  args: {},
  handler: async (ctx, args) => {
    // Find all expenses with unpaid splits
    const expenses = await ctx.db.query("expenses").collect();
    for (const expense of expenses) {
      for (const split of expense.splits) {
        if (!split.paid && split.userId !== expense.paidByUserId) {
          // Fetch user info for this split directly from users table
          const owingUser = await ctx.db.get(split.userId);
          const payer = await ctx.db.get(expense.paidByUserId);
          if (owingUser && owingUser.email) {
            // Compose email
            const subject = `Reminder: You owe ₹${split.amount} for '${expense.description}'`;
            const html = `<p>Hi ${owingUser.name || "there"},</p><p>This is a reminder that you owe <b>₹${split.amount}</b> for the expense: <b>${expense.description}</b>.</p><p>Please settle up with ${payer?.name || "the payer"}.</p>`;
            await ctx.runMutation(api.email.sendEmailInternal, {
              to: owingUser.email,
              subject,
              html,
              text: `Reminder: You owe ₹${split.amount} for '${expense.description}'. Please settle up with ${payer?.name || "the payer"}.`,
            });
          }
        }
      }
    }
    return { success: true };
  }
});
