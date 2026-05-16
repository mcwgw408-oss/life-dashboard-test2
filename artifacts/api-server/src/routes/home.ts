import { Router } from "express";
import { db } from "@workspace/db";
import {
  todosTable,
  prioritiesTable,
  conditionsTable,
  memosTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

// TODOS
router.get("/todos", async (_req, res) => {
  const todos = await db.select().from(todosTable).orderBy(todosTable.id);
  res.json(todos.map(t => ({ ...t, createdAt: t.createdAt.toISOString() })));
});

router.post("/todos", async (req, res) => {
  const { text } = req.body;
  const [todo] = await db.insert(todosTable).values({ text, done: false }).returning();
  res.status(201).json({ ...todo, createdAt: todo.createdAt.toISOString() });
});

router.patch("/todos/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { text, done } = req.body;
  const update: Partial<{ text: string; done: boolean }> = {};
  if (text !== undefined) update.text = text;
  if (done !== undefined) update.done = done;
  const [todo] = await db.update(todosTable).set(update).where(eq(todosTable.id, id)).returning();
  res.json({ ...todo, createdAt: todo.createdAt.toISOString() });
});

router.delete("/todos/:id", async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(todosTable).where(eq(todosTable.id, id));
  res.sendStatus(204);
});

// PRIORITIES
router.get("/priorities", async (_req, res) => {
  const items = await db.select().from(prioritiesTable).orderBy(prioritiesTable.rank);
  res.json(items);
});

router.post("/priorities", async (req, res) => {
  const { text, rank } = req.body;
  const [item] = await db.insert(prioritiesTable).values({ text, rank }).returning();
  res.status(201).json(item);
});

router.patch("/priorities/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { text, rank } = req.body;
  const update: Partial<{ text: string; rank: number }> = {};
  if (text !== undefined) update.text = text;
  if (rank !== undefined) update.rank = rank;
  const [item] = await db.update(prioritiesTable).set(update).where(eq(prioritiesTable.id, id)).returning();
  res.json(item);
});

router.delete("/priorities/:id", async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(prioritiesTable).where(eq(prioritiesTable.id, id));
  res.sendStatus(204);
});

// CONDITION
router.get("/condition", async (req, res) => {
  const today = new Date().toISOString().split("T")[0];
  const [cond] = await db.select().from(conditionsTable).where(eq(conditionsTable.date, today));
  if (!cond) {
    return res.json({ id: 0, date: today, level: 3, note: "" });
  }
  res.json(cond);
});

router.put("/condition", async (req, res) => {
  const { date, level, note } = req.body;
  const existing = await db.select().from(conditionsTable).where(eq(conditionsTable.date, date));
  let cond;
  if (existing.length > 0) {
    [cond] = await db.update(conditionsTable).set({ level, note: note ?? null }).where(eq(conditionsTable.date, date)).returning();
  } else {
    [cond] = await db.insert(conditionsTable).values({ date, level, note: note ?? null }).returning();
  }
  res.json(cond);
});

// HOME MEMO
router.get("/memo", async (_req, res) => {
  let [memo] = await db.select().from(memosTable).where(eq(memosTable.key, "home"));
  if (!memo) {
    [memo] = await db.insert(memosTable).values({ key: "home", content: "" }).returning();
  }
  res.json({ ...memo, updatedAt: memo.updatedAt.toISOString() });
});

router.put("/memo", async (req, res) => {
  const { content } = req.body;
  const existing = await db.select().from(memosTable).where(eq(memosTable.key, "home"));
  let memo;
  if (existing.length > 0) {
    [memo] = await db.update(memosTable).set({ content, updatedAt: new Date() }).where(eq(memosTable.key, "home")).returning();
  } else {
    [memo] = await db.insert(memosTable).values({ key: "home", content }).returning();
  }
  res.json({ ...memo, updatedAt: memo.updatedAt.toISOString() });
});

export default router;
