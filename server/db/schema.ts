import {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  boolean,
  timestamp,
  bigint,
  json,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    username: varchar("username", { length: 255 }).notNull(),
    password_hash: text("password_hash"), // nullable = optional login
    unlimited: boolean("unlimited").notNull().default(false), // JMK override
    created_at: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    usernameUnique: uniqueIndex("users_username_unique").on(t.username),
  })
);

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id),
  created_at: timestamp("created_at").notNull().defaultNow(),
  last_seen: timestamp("last_seen").notNull().defaultNow(),
});

export const credits = pgTable("credits", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id).notNull(),
  zhi1: bigint("zhi1", { mode: "bigint" }).notNull().default(0n),
  zhi2: bigint("zhi2", { mode: "bigint" }).notNull().default(0n),
  zhi3: bigint("zhi3", { mode: "bigint" }).notNull().default(0n),
  zhi4: bigint("zhi4", { mode: "bigint" }).notNull().default(0n),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export const usage = pgTable("usage", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id),
  model: varchar("model", { length: 16 }).notNull(), // ZHI1..ZHI4
  words: bigint("words", { mode: "bigint" }).notNull().default(0n),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export const outputs = pgTable("outputs", {
  id: serial("id").primaryKey(),
  session_id: integer("session_id").references(() => sessions.id),
  truncated: boolean("truncated").notNull().default(false),
  payload_json: json("payload_json").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
});
