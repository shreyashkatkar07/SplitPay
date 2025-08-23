// convex/recurring.js
// Convex scheduled job to process recurring expenses

import { api } from "./_generated/api";

// Helper to get the next date for a recurrence
function getNextDate(current, repeat) {
  const date = new Date(current);
  switch (repeat) {
    case "daily":
      date.setDate(date.getDate() + 1);
      break;
    case "weekly":
      date.setDate(date.getDate() + 7);
      break;
    case "monthly":
      date.setMonth(date.getMonth() + 1);
      break;
    case "yearly":
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      return null;
  }
  return date.getTime();
}


// Convex scheduled job: default export function
export default async function processRecurringExpenses(ctx) {
  // Find all active recurring expenses
  const expenses = await ctx.db.query("expenses")
    .filter((q) => q.neq(q.field("repeat"), "off"))
    .collect();

  const now = Date.now();
  for (const expense of expenses) {
    // Only process if the next occurrence is due
    let nextDate = getNextDate(expense.date, expense.repeat);
    if (!nextDate || nextDate > now) continue;
    // Check end conditions
    if (expense.repeatEndDate && nextDate > expense.repeatEndDate) continue;
    if (expense.repeatCount && expense.repeatCount <= 0) continue;
    // Create the next expense occurrence
    await ctx.runMutation(api.expenses.createExpense, {
      ...expense,
      date: nextDate,
      repeatCount: expense.repeatCount ? expense.repeatCount - 1 : undefined,
    });
    // Optionally, update the original expense's date and repeatCount
    await ctx.db.patch(expense._id, {
      date: nextDate,
      repeatCount: expense.repeatCount ? expense.repeatCount - 1 : undefined,
    });
  }
  return { success: true };
}

// To schedule this job, use Convex dashboard or API to run processRecurringExpenses periodically.
