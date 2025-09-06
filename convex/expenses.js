import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

import { internal, api } from "./_generated/api";
import { action } from "./_generated/server";

// Query to get all direct (1:1) expenses and settlements between the current user and another user
export const getExpensesBetweenUsers = query({
    // Accepts a userId argument (the other user)
    args: { userId: v.id("users") },
    handler: async (ctx, { userId }) => {
        // Get the current user
        const me = await ctx.runQuery(internal.users.getCurrentUser);
        // Prevent querying yourself
        if (me._id === userId) throw new Error("Cannot query yourself");

        // Get all expenses paid by the current user (not in a group)
        const myPaid = await ctx.db
            .query("expenses")
            .withIndex("by_user_and_group", (q) =>
                q.eq("paidByUserId", me._id).eq("groupId", undefined)
            )
            .collect();

        // Get all expenses paid by the other user (not in a group)
        const theirPaid = await ctx.db
            .query("expenses")
            .withIndex("by_user_and_group", (q) =>
                q.eq("paidByUserId", userId).eq("groupId", undefined)
            )
            .collect();

        // Combine both sets of expenses
        const candidateExpenses = [...myPaid, ...theirPaid];

        // Filter to only expenses where both users are involved
        const expenses = candidateExpenses.filter((e) => {
            // Is current user in splits?
            const meInSplits = e.splits.some((s) => s.userId === me._id);
            // Is other user in splits?
            const themInSplits = e.splits.some((s) => s.userId === userId);

            // Is current user involved (paid or in splits)?
            const meInvolved = e.paidByUserId === me._id || meInSplits;
            // Is other user involved (paid or in splits)?
            const themInvolved = e.paidByUserId === userId || themInSplits;

            // Only keep if both are involved
            return meInvolved && themInvolved;
        });

        // Sort expenses by date (descending)
        expenses.sort((a, b) => b.date - a.date);

        // Get all settlements between the two users (not in a group)
        const settlements = await ctx.db.query("settlements").filter(q =>
            q.and(
                q.eq(q.field("groupId"), undefined), // Only 1:1 settlements
                q.or(
                    // Paid by me, received by other
                    q.and(
                        q.eq(q.field("paidByUserId"), me._id),
                        q.eq(q.field("receivedByUserId"), userId)
                    ),
                    // Paid by other, received by me
                    q.and(
                        q.eq(q.field("paidByUserId"), userId),
                        q.eq(q.field("receivedByUserId"), me._id)
                    )
                )
            )
        ).collect();
        // Sort settlements by date (descending)
        settlements.sort((a, b) => b.date - a.date);

        // Calculate net balance between users
        let balance = 0;

        // For each expense, add/subtract amounts owed
        for await (const e of expenses) {
            if (e.paidByUserId === me._id) {
                // If I paid, add amount the other user owes me
                const split = e.splits.find((s) => s.userId === userId && !s.paid);
                if (split) balance += split.amount;
            }
            else {
                // If other user paid, subtract amount I owe them
                const split = e.splits.find((s) => s.userId === me._id && !s.paid);
                if (split) balance -= split.amount;
            }
        }

        // For each settlement, add/subtract settled amounts
        for (const s of settlements) {
            if (s.paidByUserId === me._id) {
                // If I paid, add amount
                balance += s.amount;
            } else {
                // If other user paid, subtract amount
                balance -= s.amount;
            }
        }

        // Get other user's info
        const other = await ctx.db.get(userId);
        if (!other) throw new Error("User not found");

        // Return expenses, settlements, balance, and other user's details
        return {
            expenses,
            settlements,
            balance,
            otherUser: {
                id: other._id,
                name: other.name,
                email: other.email,
                imageUrl: other.imageUrl,
            },
        };
    },
});

export const deleteExpense = mutation({
    args: { expenseId: v.id("expenses"),
    },
    handler:async(ctx , args) =>{
        const user = await ctx.runQuery(internal.users.getCurrentUser);

        const expense = await ctx.db.get(args.expenseId);
        if (!expense) throw new Error("Expense not found");

        if (expense.createdByUserId !== user._id && expense.paidByUserId !== user._id) {
            throw new Error("You are not allowed to delete this expense");
        }

        await ctx.db.delete(args.expenseId)

        return{success:true};
    },
});

export const createExpense = mutation({
    args: {
        description: v.string(),
        amount: v.number(),
        category: v.optional(v.string()),
        date: v.number(),
        paidByUserId: v.id("users"),
        splitType: v.string(),
        splits: v.array(v.object({
            userId: v.id("users"),
            amount: v.number(),
            paid: v.boolean(),
        })),
        groupId: v.optional(v.id("groups")),
        note: v.optional(v.string()),
        repeat: v.optional(v.string()),
        repeatEndDate: v.optional(v.number()),
        repeatCount: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const user = await ctx.runQuery(internal.users.getCurrentUser);

        if (args.groupId) {
            const group = await ctx.db.get(args.groupId);
            if (!group) throw new Error("Group not found");

            const isMember = group.members.some((m) => m.userId === user._id);
            if (!isMember) throw new Error("You are not a member of this group");
        }
        // checks are not needed at the backend as they are already handled at the frontend
        // const totalSplitAmount = args.splits.reduce((sum, split) => sum + split.amount, 0);
        // const tolerance = 0.01; // Allow a small tolerance for floating point errors
        // if (Math.abs(totalSplitAmount - args.amount) > tolerance) {
        //     throw new Error("Split amounts must add up to the total expense amount");
        // }

        const expenseId = await ctx.db.insert("expenses", {
            description: args.description,
            amount: args.amount,
            category: args.category || "Other",
            date: args.date,
            paidByUserId: args.paidByUserId,
            splitType: args.splitType,
            splits: args.splits,
            groupId: args.groupId,
            note: args.note,
            repeat: args.repeat,
            repeatEndDate: args.repeatEndDate,
            repeatCount: args.repeatCount,
            createdBy: user._id,
        });

        // Only create the expense, do not send emails here (mutations cannot call actions)
        return expenseId;
    }
});

// Action to create expense and send payment reminders
export const createExpenseWithReminders = action({
    args: {
        description: v.string(),
        amount: v.number(),
        category: v.optional(v.string()),
        date: v.number(),
        paidByUserId: v.id("users"),
        splitType: v.string(),
        splits: v.array(v.object({
            userId: v.id("users"),
            amount: v.number(),
            paid: v.boolean(),
        })),
        groupId: v.optional(v.id("groups")),
            note: v.optional(v.string()), // Added note field
            repeat: v.optional(v.string()), // Added repeat field
            repeatEndDate: v.optional(v.number()), // Added repeatEndDate field
            repeatCount: v.optional(v.number()), // Added repeatCount field
    },
    handler: async (ctx, args) => {
        // Call the mutation to create the expense
        const expenseId = await ctx.runMutation(api.expenses.createExpense, args);

    // Get payer info
    const payer = await ctx.runQuery(internal.users.getCurrentUser, { userId: args.paidByUserId });

        // Send email to all users who owe money (splits with paid: false and userId != paidByUserId)
        const emailResults = [];
        for (const split of args.splits) {
            if (!split.paid && split.userId !== args.paidByUserId) {
                // Fetch user info for this split
                const owingUser = await ctx.runQuery(internal.users.getCurrentUser, { userId: split.userId });
                if (owingUser && owingUser.email) {
                    // Compose email
                    const subject = `You owe ₹${split.amount} for '${args.description}'`;
                    const html = `<p>Hi ${owingUser.name || "there"},</p><p>You owe <b>₹${split.amount}</b> for the expense: <b>${args.description}</b>.</p><p>Please settle up with ${payer?.name || "the payer"}.</p>`;
                    // Call sendEmail action
                    const result = await ctx.runAction(api.email.sendEmail, {
                        to: owingUser.email,
                        subject,
                        html,
                        text: `You owe ₹${split.amount} for '${args.description}'. Please settle up with ${payer?.name || "the payer"}.`,
                    });
                    emailResults.push({ to: owingUser.email, result });
                }
            }
        }
        return { expenseId, emailResults };
    }
});