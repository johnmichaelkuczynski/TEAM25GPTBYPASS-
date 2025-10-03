import express from "express";
import { db } from "../db/client";
import { users, sessions } from "../db/schema";
import { eq } from "drizzle-orm";

const router = express.Router();

// LOGIN
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const rows = await db.select().from(users).where(eq(users.username, username)).limit(1);
  const user = rows[0];
  if (!user) return res.status(400).json({ error: "Invalid user" });
  if (user.username.toLowerCase() !== "jmk" && (user.password_hash ?? "") !== (password ?? "")) {
    return res.status(400).json({ error: "Wrong password" });
  }
  const [session] = await db.insert(sessions).values({ user_id: user.id }).returning();
  res.json({ session: session.id, unlimited: user.unlimited });
});

// LOGOUT
router.post("/logout", async (req, res) => {
  const { sessionId } = req.body;
  await db.delete(sessions).where(eq(sessions.id, sessionId));
  res.json({ ok: true });
});

// REGISTER (JMK => unlimited, no password required)
router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username) return res.status(400).json({ error: "Missing username" });

  const existing = await db.select().from(users).where(eq(users.username, username)).limit(1);
  if (existing.length) return res.status(400).json({ error: "User exists" });

  let created;
  if (username.toLowerCase() === "jmk") {
    [created] = await db.insert(users).values({ username, password_hash: "", unlimited: true }).returning();
  } else {
    [created] = await db.insert(users).values({ username, password_hash: password ?? "" }).returning();
  }
  res.json({ ok: true, user: created });
});

export default router;
