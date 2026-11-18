import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    passwordHash: v.string(),
    salt: v.string(),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  sessions: defineTable({
    userId: v.id("users"),
    token: v.string(),
    expiresAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_user", ["userId"]),

  wallets: defineTable({
    userId: v.id("users"),
    name: v.string(),
    slug: v.string(),
    balance: v.number(),
    color: v.string(),
    badge_emoji: v.string(),
    include_in_allowance: v.boolean(),
    sort_order: v.number(),
  }).index("by_user", ["userId"]),

  transactions: defineTable({
    userId: v.id("users"),
    walletId: v.id("wallets"),
    toWalletId: v.optional(v.id("wallets")),
    type: v.union(v.literal("expense"), v.literal("income"), v.literal("transfer")),
    amount: v.number(),
    fee: v.number(),
    category: v.optional(v.string()),
    note: v.optional(v.string()),
    spent_at: v.number(),
  }).index("by_user_spent", ["userId", "spent_at"]),
});