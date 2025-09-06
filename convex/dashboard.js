// Import internal API and query helper from Convex
import { internal } from "./_generated/api";
import { query } from "./_generated/server";

// Query to get the user's overall balances for 1:1 expenses and settlements
export const getUserBalances = query({
    handler: async (ctx) => {
        // Get the current user
        const user = await ctx.runQuery(internal.users.getCurrentUser);

        // Get all expenses where the user is involved and not in a group
        const expenses = (await ctx.db.query("expenses").collect()).filter(
            (e) =>
                !e.groupId && // Only 1:1 expenses
                (e.paidByUserId === user._id ||
                    e.splits.some((s) => s.userId === user._id)) // User paid or is a participant
        );

        let youOwe = 0; // Total amount the user owes
        let youAreOwed = 0; // Total amount the user is owed
        const balanceByUser = {}; // Track balances per user

        // Process each expense
        for (const e of expenses) {
            const isPayer = e.paidByUserId === user._id; // Did the user pay?
            const mySplit = e.splits.find((s) => s.userId === user._id); // User's split

            if (isPayer) {
                // If user paid, add up amounts owed by others
                for (const s of e.splits) {
                    if (s.userId == user._id || s.paid) continue; // Skip self and already paid

                    youAreOwed += s.amount;

                    // Track per user
                    (balanceByUser[s.userId] ??= { owed: 0, owing: 0 }).owed += s.amount;
                }
            }
            else if (mySplit && !mySplit.paid) {
                // If user is a participant and hasn't paid, add up what they owe
                youOwe += mySplit.amount;

                // Track per payer
                (balanceByUser[e.paidByUserId] ??= { owed: 0, owing: 0 }).owing += mySplit.amount;
            }
        }

        // Get all settlements involving the user and not in a group
        const settlements = (await ctx.db.query("settlements").collect()).filter(
            (s) =>
                !s.groupId && // Only 1:1 settlements
                (s.paidByUserId === user._id || s.receivedByUserId === user._id)
        );

        // Process each settlement
        for (const s of settlements) {
            if (s.paidByUserId === user._id) {
                // If user paid, subtract amount from what they owe
                youOwe -= s.amount;
                (balanceByUser[s.receivedByUserId] ??= { owed: 0, owing: 0 }).owing -= s.amount;
            }
            else {
                // If user received, subtract amount from what they are owed
                youAreOwed -= s.amount;
                (balanceByUser[s.paidByUserId] ??= { owed: 0, owing: 0 }).owed -= s.amount;
            }
        }

        // Build lists of who the user owes and who owes the user
        const youOweList = [];
        const youAreOwedByList = [];

        for (const [uid, { owed, owing }] of Object.entries(balanceByUser)) {
            const net = owed - owing; // Net balance with each user
            if (net === 0) continue; // Skip if settled

            // Get user info
            const counterpart = await ctx.db.get(uid);
            const base = {
                userId: uid,
                name: counterpart?.name ?? "Unknown",
                imageUrl: counterpart?.imageUrl,
                amount: Math.abs(net),
            };

            // Add to appropriate list
            net > 0 ? youAreOwedByList.push(base) : youOweList.push(base);
        }

        // Sort lists by amount
        youOweList.sort((a, b) => b.amount - a.amount);
        youAreOwedByList.sort((a, b) => b.amount - a.amount);

        // Return summary and details
        return {
            youOwe,
            youAreOwed,
            totalBalance: youAreOwed - youOwe,
            oweDetails: { youOwe: youOweList, youAreOwedBy: youAreOwedByList },
        };
    },
});

// Query to get the total amount spent by the user in the current year
export const getTotalSpent = query({
    handler: async (ctx) => {
        // Get the current user
        const user = await ctx.runQuery(internal.users.getCurrentUser);

        // Get start of the current year
        const currentYear = new Date().getFullYear();
        const startOfYear = new Date(currentYear, 0, 1).getTime();

        // Get all expenses from this year
        const expenses = await ctx.db.query("expenses").withIndex("by_date", (q) => q.gte("date", startOfYear)).collect();

        // Filter to only expenses involving the user
        const userExpenses = expenses.filter(
            (expense) =>
                expense.paidByUserId === user._id ||
                expense.splits.some((split) => split.userId === user._id)
        );

        let totalSpent = 0;

        // Add up user's share of each expense
        userExpenses.forEach((expense) => {
            const userSplit = expense.splits.find(
                (split) => split.userId === user._id
            );

            if (userSplit) {
                totalSpent += userSplit.amount;
            }
        });

        // Return total spent
        return totalSpent;
    },
});

// Query to get user's monthly spending for the current year
export const getMonthlySpending = query({
    handler: async (ctx) => {
        // Get the current user
        const user = await ctx.runQuery(internal.users.getCurrentUser);

        // Get start of the current year
        const currentYear = new Date().getFullYear();
        const startOfYear = new Date(currentYear, 0, 1).getTime();

        // Get all expenses from this year
        const allExpenses = await ctx.db.query("expenses").withIndex("by_date", (q) => q.gte("date", startOfYear)).collect();

        // Filter to only expenses involving the user
        const userExpenses = allExpenses.filter(
            (expense) =>
                expense.paidByUserId === user._id ||
                expense.splits.some((split) => split.userId === user._id)
        );

        // Initialize monthly totals
        const monthlyTotals = {};
        for (let i = 0; i < 12; i++) {
            const monthDate = new Date(currentYear, i, 1);
            monthlyTotals[monthDate.getTime()] = 0;
        }

        // Add up user's share for each month
        userExpenses.forEach((expense) => {
            const date = new Date(expense.date);
            const monthStart = new Date(date.getFullYear(), date.getMonth(), 1).getTime();
            const userSplit = expense.splits.find(
                (split) => split.userId === user._id
            );
            if (userSplit) {
                monthlyTotals[monthStart] =
                    (monthlyTotals[monthStart] || 0) + userSplit.amount;
            }
        });

        // Build result array
        const result = Object.entries(monthlyTotals).map(([month, total]) => ({
            month: parseInt(month),
            total,
        }));

        // Sort by month
        result.sort((a, b) => a.month - b.month);

        // Return monthly totals
        return result;
    },
});

// Query to get all groups the user is a member of, with balances
export const getUserGroups = query({
    handler: async (ctx) => {
        // Get the current user
        const user = await ctx.runQuery(internal.users.getCurrentUser);

        // Get all groups
        const allGroups = await ctx.db.query("groups").collect();

        // Filter to only groups where the user is a member
        const groups = allGroups.filter(
            (group) => group.members.some((member) => member.userId === user._id)
        );

        // For each group, calculate the user's balance
        const enhancedGroups = await Promise.all(
            groups.map(async (group) => {
                // Get all expenses for the group
                const expenses = await ctx.db.query("expenses")
                    .withIndex("by_group", (q) => q.eq("groupId", group._id))
                    .collect();

                let balance = 0;

                // For each expense, calculate user's share
                expenses.forEach((expense) => {
                    if (expense.paidByUserId === user._id) {
                        // If user paid, add up amounts owed by others
                        expense.splits.forEach((split) => {
                            if (split.userId !== user._id && !split.paid) {
                                balance += split.amount;
                            }
                        });
                    }
                    else {
                        // If user is a participant and hasn't paid, subtract what they owe
                        const userSplit = expense.splits.find(
                            (split) => split.userId === user._id
                        );
                        if (userSplit && !userSplit.paid) {
                            balance -= userSplit.amount;
                        }
                    }
                });

                // Get all settlements for the group involving the user
                const settlements = await ctx.db
                    .query("settlements")
                    .filter((q) =>
                        q.and(
                            q.eq(q.field("groupId"), group._id),
                            q.or(
                                q.eq(q.field("paidByUserId"), user._id),
                                q.eq(q.field("receivedByUserId"), user._id)
                            )
                        )
                    )
                    .collect();

                // For each settlement, update balance
                settlements.forEach((settlements) => {
                    if (settlements.paidByUserId === user._id) {
                        balance += settlements.amount;
                    } else {
                        balance -= settlements.amount;
                    }
                });

                // Return group info with balance
                return {
                    ...group,
                    id: group._id,
                    balance,
                };
            })
        );

        // Return all groups with balances
        return enhancedGroups;
    },
});