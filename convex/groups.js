import { v } from "convex/values";
import { internal } from "./_generated/api";
import { query, mutation } from "./_generated/server";

// // Delete a group (admin only)
// export const deleteGroup = mutation({
//   args: { groupId: v.id("groups") },
//   handler: async (ctx, { groupId }) => {
//     const currentUser = await ctx.runQuery(internal.users.getCurrentUser);
//     const group = await ctx.db.get(groupId);
//     if (!group) throw new Error("Group not found");
//     const me = group.members.find((m) => m.userId === currentUser._id);
//     if (!me || me.role !== "admin") throw new Error("Only admin can delete group");
//     await ctx.db.delete(groupId);
//     return true;
//   },
// });
// // Add a member to a group by email
// export const addMember = mutation({
//   args: { groupId: v.id("groups"), email: v.string() },
//   handler: async (ctx, { groupId, email }) => {
//     const currentUser = await ctx.runQuery(internal.users.getCurrentUser);
//     const group = await ctx.db.get(groupId);
//     if (!group) throw new Error("Group not found");
//     // Only allow group members to add
//     if (!group.members.some((m) => m.userId === currentUser._id)) throw new Error("Not a group member");
//     // Find user by email
//     const users = await ctx.db.query("users").filter((q) => q.eq(q.field("email"), email)).collect();
//     if (users.length === 0) throw new Error("No user with that email");
//     const userToAdd = users[0];
//     if (group.members.some((m) => m.userId === userToAdd._id)) throw new Error("User already a member");
//     // Add as normal member
//   group.members.push({ userId: userToAdd._id, role: "member", joinedAt: Date.now(), totalBalance: 0 });
//     await ctx.db.patch(groupId, { members: group.members });
//     return true;
//   },
// });

// // Leave a group
// export const leaveGroup = mutation({
//   args: { groupId: v.id("groups") },
//   handler: async (ctx, { groupId }) => {
//     const currentUser = await ctx.runQuery(internal.users.getCurrentUser);
//     const group = await ctx.db.get(groupId);
//     if (!group) throw new Error("Group not found");
//     const newMembers = group.members.filter((m) => m.userId !== currentUser._id);
//     if (newMembers.length === group.members.length) throw new Error("You are not a member");
//     await ctx.db.patch(groupId, { members: newMembers });
//     return true;
//   },
// });

export const getGroupOrMembers = query({
  args: {
    groupId: v.optional(v.id("groups")), // Optional - if provided, will return details for just this group
  },
  handler: async (ctx, args) => {
    // Use centralized getCurrentUser function
    const currentUser = await ctx.runQuery(internal.users.getCurrentUser);

    // Get all groups where the user is a member
    const allGroups = await ctx.db.query("groups").collect();
    const userGroups = allGroups.filter((group) =>
      group.members.some((member) => member.userId === currentUser._id)
    );

    // If a specific group ID is provided, only return details for that group
    if (args.groupId) {
      const selectedGroup = userGroups.find(
        (group) => group._id === args.groupId
      );

      if (!selectedGroup) {
        throw new Error("Group not found or you're not a member");
      }

      // Get all user details for this group's members
      const memberDetails = await Promise.all(
        selectedGroup.members.map(async (member) => {
          const user = await ctx.db.get(member.userId);
          if (!user) return null;

          return {
            id: user._id,
            name: user.name,
            email: user.email,
            imageUrl: user.imageUrl,
            role: member.role,
          };
        })
      );

      // Filter out any null values (in case a user was deleted)
      const validMembers = memberDetails.filter((member) => member !== null);

      // Return selected group with member details
      return {
        selectedGroup: {
          id: selectedGroup._id,
          name: selectedGroup.name,
          description: selectedGroup.description,
          createdBy: selectedGroup.createdBy,
          members: validMembers,
        },
        groups: userGroups.map((group) => ({
          id: group._id,
          name: group.name,
          description: group.description,
          memberCount: group.members.length,
        })),
      };
    } else {
      // Just return the list of groups without member details
      return {
        selectedGroup: null,
        groups: userGroups.map((group) => ({
          id: group._id,
          name: group.name,
          description: group.description,
          memberCount: group.members.length,
        })),
      };
    }
  },
});

// Get expenses for a specific group
// Query to get all expenses, settlements, and balances for a specific group
export const getGroupExpenses = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx, { groupId }) => {
    // Get current user and group
    const currentUser = await ctx.runQuery(internal.users.getCurrentUser);
    const group = await ctx.db.get(groupId);
    if (!group) throw new Error("Group not found");
    // Ensure user is a member
    if (!group.members.some((m) => m.userId === currentUser._id))
      throw new Error("You are not a member of this group");

    // Fetch all group expenses and settlements
    const expenses = await ctx.db
      .query("expenses")
      .withIndex("by_group", (q) => q.eq("groupId", groupId))
      .collect();
    const settlements = await ctx.db
      .query("settlements")
      .filter((q) => q.eq(q.field("groupId"), groupId))
      .collect();

    // Build member details and ID list
    const memberDetails = await Promise.all(
      group.members.map(async (m) => {
        const u = await ctx.db.get(m.userId);
        return { id: u._id, name: u.name, imageUrl: u.imageUrl, role: m.role };
      })
    );
    const ids = memberDetails.map((m) => m.id);

    // Initialize net balances and pairwise ledgers
    const totals = Object.fromEntries(ids.map((id) => [id, 0])); // Net balance for each member
    const ledger = {}; // Pairwise ledger: debtor -> creditor -> amount
    ids.forEach((a) => {
      ledger[a] = {};
      ids.forEach((b) => {
        if (a !== b) ledger[a][b] = 0;
      });
    });

    // Apply all expenses to balances and ledgers
    for (const exp of expenses) {
      const payer = exp.paidByUserId;
      if (!(payer in totals)) continue; // Only process if payer is in group
      for (const split of exp.splits) {
        if (split.userId === payer || split.paid) continue; // Skip payer and settled splits
        const debtor = split.userId;
        const amt = split.amount;
        if (!(debtor in totals)) continue; // Only process if debtor is in group

        totals[payer] += amt; // Creditor gets positive balance
        totals[debtor] -= amt; // Debtor gets negative balance

        if (ledger[debtor] && ledger[debtor][payer] !== undefined) {
          ledger[debtor][payer] += amt; // Track how much debtor owes payer
        }
      }
    }

    // Apply all settlements to balances and ledgers
    for (const s of settlements) {
      if (!(s.paidByUserId in totals) || !(s.receivedByUserId in totals)) continue;
      totals[s.paidByUserId] += s.amount; // Payer's balance increases
      totals[s.receivedByUserId] -= s.amount; // Receiver's balance decreases

      if (ledger[s.paidByUserId] && ledger[s.paidByUserId][s.receivedByUserId] !== undefined) {
        ledger[s.paidByUserId][s.receivedByUserId] -= s.amount; // Reduce what payer owes receiver
      }
    }

    // Net out pairwise ledgers so only one direction per pair remains
    ids.forEach((a) => {
      ids.forEach((b) => {
        if (a >= b) return; // Only process each unordered pair once
        if (!ledger[a] || !ledger[b] || ledger[a][b] === undefined || ledger[b][a] === undefined) return;
        const diff = ledger[a][b] - ledger[b][a];
        if (diff > 0) {
          ledger[a][b] = diff;
          ledger[b][a] = 0;
        } else if (diff < 0) {
          ledger[b][a] = -diff;
          ledger[a][b] = 0;
        } else {
          ledger[a][b] = ledger[b][a] = 0;
        }
      });
    });

    // Build per-member balances: who owes whom and how much
    const balances = memberDetails.map((m) => {
      const owes = [];
      const owedBy = [];
      ids.forEach((otherId) => {
        if (m.id === otherId) return;
        const amtOwes = ledger[m.id]?.[otherId] || 0;
        const amtOwedBy = ledger[otherId]?.[m.id] || 0;
        if (amtOwes > 0) owes.push({ to: otherId, amount: amtOwes });
        if (amtOwedBy > 0) owedBy.push({ from: otherId, amount: amtOwedBy });
      });
      return {
        ...m,
        totalBalance: totals[m.id], // Net balance for this member
        owes,
        owedBy,
      };
    });

    // Build a lookup map for member details
    const userLookupMap = {};
    memberDetails.forEach((member) => {
      userLookupMap[member.id] = member;
    });

    // Return all group data needed for frontend
    return {
      group: {
        id: group._id,
        name: group.name,
        description: group.description,
        members: memberDetails,
      },
      expenses,
      settlements,
      balances,
      userLookupMap,
    };
  },
});