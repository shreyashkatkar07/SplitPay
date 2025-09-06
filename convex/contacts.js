// Import Convex helpers and types
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

// Query to get all contacts (users and groups) for the current user
export const getAllContacts = query({
    handler: async (ctx) => {
        // Get the current user
        const currentUser = await ctx.runQuery(internal.users.getCurrentUser);

        // Get all expenses paid by the user (not in a group)
        const expensesYouPaid = await ctx.db
            .query("expenses")
            .withIndex("by_user_and_group", (q) =>
                q.eq("paidByUserId", currentUser._id).eq("groupId", undefined)
            )
            .collect();

        // Get all expenses not paid by the user, but where the user is a participant (not in a group)
        const expensesNotPaidByYou = (await ctx.db
            .query("expenses")
            .withIndex("by_group", (q) => q.eq("groupId", undefined))
            .collect()
        ).filter(
            (e) =>
                e.paidByUserId !== currentUser._id &&
                e.splits.some(s => s.userId === currentUser._id)
        );

        // Combine all personal (1:1) expenses
        const personalExpenses = [...expensesYouPaid, ...expensesNotPaidByYou];

        // Collect all unique user IDs involved in these expenses (excluding self)
        const contactIds = new Set();
        personalExpenses.forEach((exp) => {
            if (exp.paidByUserId !== currentUser._id) {
                contactIds.add(exp.paidByUserId);
            }
            exp.splits.forEach((s) => {
                if (s.userId !== currentUser._id) {
                    contactIds.add(s.userId);
                }
            });
        });

        // Fetch user info for each contact
        const contactUsers = await Promise.all(
            [...contactIds].map(async (id) => {
                const u = await ctx.db.get(id);
                return u
                    ? {
                        id: u._id,
                        name: u.name,
                        email: u.email,
                        imageUrl: u.imageUrl,
                        type: "user",
                    }
                    : null;
            })
        );

        // Get all groups the user is a member of
        const userGroups = (await ctx.db.query("groups").collect())
            .filter((g) =>
                g.members.some(m => m.userId == currentUser._id)
            )
            .map((g) => ({
                id: g._id,
                name: g.name,
                description: g.description,
                memberCount: g.members.length,
                type: "group",
            }));

        // Sort contacts and groups alphabetically by name
        contactUsers.sort((a, b) => a?.name.localeCompare(b?.name));
        userGroups.sort((a, b) => a?.name.localeCompare(b?.name));

        // Return both users and groups
        return {
            users: contactUsers.filter(Boolean),
            groups: userGroups,
        };
    },
});

// Mutation to create a new group
export const createGroup = mutation({
    args: {
        name: v.string(), // Group name
        description: v.optional(v.string()), // Optional description
        members: v.array(v.id("users")), // Array of user IDs
    },
    handler: async (ctx, args) => {
        // Get the current user
        const currentUser = await ctx.runQuery(internal.users.getCurrentUser);

        // Validate group name
        if (!args.name.trim()) throw new Error("Group name cannot be empty");

        // Ensure all members are unique
        const uniqueMembers = new Set(args.members);

        // Always add the current user as a member (admin)
        uniqueMembers.add(currentUser._id);

        // Validate that all user IDs exist
        for (const id of uniqueMembers) {
            if (!(await ctx.db.get(id))) {
                throw new Error(`User with ID ${id} not found`);
            }
        }

        // Insert the new group into the database
        return await ctx.db.insert("groups", {
            name: args.name.trim(),
            description: args.description?.trim() || "",
            createdBy: currentUser._id,
            members: [...uniqueMembers].map((id) => ({
                userId: id,
                role: id === currentUser._id ? "admin" : "member",
                joinedAt: Date.now(),
            })),
        });
    },
});