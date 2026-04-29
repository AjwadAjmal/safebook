import { pgTable, uuid, text, timestamp, varchar, pgEnum } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["admin", "member"]);

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
