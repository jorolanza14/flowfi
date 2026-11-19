import { v } from "convex/values";
import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";

async function hashPassword(password: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function getUserIdFromToken(ctx: QueryCtx | MutationCtx, token: string) {
  if (!token) return null;
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q) => q.eq("token", token))
    .unique();

  if (!session || session.expiresAt < Date.now()) return null;
  return session.userId;
}

export const signUp = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    if (!email.includes("@")) {
      throw new Error("Please enter a valid email address.");
    }
    if (args.password.length < 8) {
      throw new Error("Password must be at least 8 characters.");
    }

    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (existing) {
      throw new Error("An account with this email already exists.");
    }

    const salt = crypto.randomUUID();
    const passwordHash = await hashPassword(args.password, salt);

    const userId = await ctx.db.insert("users", {
      email,
      passwordHash,
      salt,
      createdAt: Date.now(),
    });

    const defaults = [
      { name: "GCash", slug: "gcash", balance: 0, color: "#38BDF8", badge_emoji: "💙", include_in_allowance: true, sort_order: 1 },
      { name: "Maya",  slug: "maya",  balance: 0, color: "#34D399", badge_emoji: "💚", include_in_allowance: true, sort_order: 2 },
      { name: "BPI",   slug: "bpi",   balance: 0, color: "#FB7185", badge_emoji: "❤️", include_in_allowance: true, sort_order: 3 },
      { name: "Cash",  slug: "cash",  balance: 0, color: "#FBBF24", badge_emoji: "🪙", include_in_allowance: true, sort_order: 4 },
    ];

    for (const w of defaults) {
      await ctx.db.insert("wallets", { userId, ...w });
    }

    const token = `${crypto.randomUUID()}-${crypto.randomUUID()}`;
    await ctx.db.insert("sessions", {
      userId,
      token,
      expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30,
    });

    return { token, email };
  },
});

export const signIn = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (!user) {
      throw new Error("Invalid email or password.");
    }

    const candidateHash = await hashPassword(args.password, user.salt);
    if (candidateHash !== user.passwordHash) {
      throw new Error("Invalid email or password.");
    }

    const token = `${crypto.randomUUID()}-${crypto.randomUUID()}`;
    await ctx.db.insert("sessions", {
      userId: user._id,
      token,
      expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30,
    });

    return { token, email: user.email };
  },
});

export const signOut = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();

    if (session) {
      await ctx.db.delete(session._id);
    }
  },
});

export const getDashboard = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const userId = await getUserIdFromToken(ctx, args.token);
    if (!userId) return null;

    const wallets = await ctx.db
      .query("wallets")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user_spent", (q) => q.eq("userId", userId))
      .order("desc")
      .take(30);

    return {
      wallets: wallets
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((w) => ({
          id: w._id,
          name: w.name,
          slug: w.slug,
          balance: w.balance,
          color: w.color,
          badge_emoji: w.badge_emoji,
          include_in_allowance: w.include_in_allowance,
          sort_order: w.sort_order,
        })),
      transactions: transactions.map((tx) => ({
        id: tx._id,
        wallet_id: tx.walletId,
        to_wallet_id: tx.toWalletId ?? null,
        type: tx.type,
        amount: tx.amount,
        fee: tx.fee,
        category: tx.category ?? null,
        note: tx.note ?? null,
        spent_at: new Date(tx.spent_at).toISOString(),
      })),
    };
  },
});

export const toggleWalletAllowance = mutation({
  args: {
    token: v.string(),
    walletId: v.id("wallets"),
  },
  handler: async (ctx, args) => {
    const userId = await getUserIdFromToken(ctx, args.token);
    if (!userId) throw new Error("Not authenticated");

    const wallet = await ctx.db.get(args.walletId);
    if (!wallet || wallet.userId !== userId) throw new Error("Unauthorized");

    await ctx.db.patch(args.walletId, {
      include_in_allowance: !wallet.include_in_allowance,
    });
  },
});

export const setWalletBalance = mutation({
  args: {
    token: v.string(),
    walletId: v.id("wallets"),
    balance: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getUserIdFromToken(ctx, args.token);
    if (!userId) throw new Error("Not authenticated");

    const wallet = await ctx.db.get(args.walletId);
    if (!wallet || wallet.userId !== userId) throw new Error("Unauthorized");

    await ctx.db.patch(args.walletId, {
      balance: Math.max(0, args.balance),
    });
  },
});

export const resetAllWallets = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const userId = await getUserIdFromToken(ctx, args.token);
    if (!userId) throw new Error("Not authenticated");

    const wallets = await ctx.db
      .query("wallets")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    for (const w of wallets) {
      await ctx.db.patch(w._id, { balance: 0 });
    }
  },
});

export const logLedgerEntry = mutation({
  args: {
    token: v.string(),
    type: v.union(v.literal("expense"), v.literal("income"), v.literal("transfer")),
    walletId: v.id("wallets"),
    toWalletId: v.optional(v.id("wallets")),
    amount: v.number(),
    fee: v.number(),
    category: v.optional(v.string()),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserIdFromToken(ctx, args.token);
    if (!userId) throw new Error("Not authenticated");

    const source = await ctx.db.get(args.walletId);
    if (!source || source.userId !== userId) throw new Error("Unauthorized source wallet");

    if (args.type === "expense") {
      await ctx.db.patch(args.walletId, {
        balance: source.balance - (args.amount + args.fee),
      });
    } else if (args.type === "income") {
      await ctx.db.patch(args.walletId, {
        balance: source.balance + args.amount - args.fee,
      });
    } else if (args.type === "transfer") {
      if (!args.toWalletId) throw new Error("Destination wallet required");
      const dest = await ctx.db.get(args.toWalletId);
      if (!dest || dest.userId !== userId) throw new Error("Unauthorized destination wallet");

      await ctx.db.patch(args.walletId, {
        balance: source.balance - (args.amount + args.fee),
      });
      await ctx.db.patch(args.toWalletId, {
        balance: dest.balance + args.amount,
      });
    }

    await ctx.db.insert("transactions", {
      userId,
      walletId: args.walletId,
      toWalletId: args.toWalletId,
      type: args.type,
      amount: args.amount,
      fee: args.fee,
      category: args.category,
      note: args.note,
      spent_at: Date.now(),
    });
  },
});
