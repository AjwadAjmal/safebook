import { pgTable, uuid, text, timestamp, varchar, pgEnum, decimal, boolean } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["admin", "member"]);
export const accountTypeEnum = pgEnum("account_type", ["giro", "depot", "cash"]);
export const transactionTypeEnum = pgEnum("transaction_type", ["expense", "income"]);

export const households = pgTable("households", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  inviteCode: varchar("invite_code", { length: 10 }).unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").default("member").notNull(),
  householdId: uuid("household_id").references(() => households.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: accountTypeEnum("type").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  institution: varchar("institution", { length: 255 }),
  currentValue: decimal("current_value", { precision: 12, scale: 2 }).notNull(),
  investedCapital: decimal("invested_capital", { precision: 12, scale: 2 }),
  initialDate: timestamp("initial_date").notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  householdId: uuid("household_id").references(() => households.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  icon: varchar("icon", { length: 50 }),
  isSystem: boolean("is_system").default(false).notNull(),
  householdId: uuid("household_id").references(() => households.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: transactionTypeEnum("type").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  description: varchar("description", { length: 255 }),
  date: timestamp("date").notNull(),
  accountId: uuid("account_id").references(() => accounts.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  householdId: uuid("household_id").references(() => households.id).notNull(),
  categoryId: uuid("category_id").references(() => categories.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

