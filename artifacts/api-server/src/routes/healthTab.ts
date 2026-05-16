import { Router } from "express";
import { db } from "@workspace/db";
import { healthLogsTable, healthNotesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

// HEALTH LOGS
router.get("/logs", async (req, res) => {
  const date = String(req.query.date ?? new Date().toISOString().split("T")[0]);
  const [log] = await db.select().from(healthLogsTable).where(eq(healthLogsTable.date, date));
  if (!log) {
    return res.json({ id: 0, date, sleepHours: null, sleepNote: null, meals: null, medication: null, conditionMemo: null });
  }
  res.json(log);
});

router.put("/logs", async (req, res) => {
  const { date, sleepHours, sleepNote, meals, medication, conditionMemo } = req.body;
  const existing = await db.select().from(healthLogsTable).where(eq(healthLogsTable.date, date));
  const data = {
    sleepHours: sleepHours !== undefined ? String(sleepHours) : null,
    sleepNote: sleepNote ?? null,
    meals: meals ?? null,
    medication: medication ?? null,
    conditionMemo: conditionMemo ?? null,
  };
  let log;
  if (existing.length > 0) {
    [log] = await db.update(healthLogsTable).set(data).where(eq(healthLogsTable.date, date)).returning();
  } else {
    [log] = await db.insert(healthLogsTable).values({ date, ...data }).returning();
  }
  res.json(log);
});

// HEALTH NOTES
router.get("/notes", async (req, res) => {
  const { category } = req.query;
  let items = await db.select().from(healthNotesTable);
  if (category) {
    items = items.filter(n => n.category === String(category));
  }
  items.sort((a, b) => b.date.localeCompare(a.date));
  res.json(items.map(n => ({ ...n, createdAt: n.createdAt.toISOString() })));
});

router.post("/notes", async (req, res) => {
  const { category, date, content } = req.body;
  const [note] = await db.insert(healthNotesTable).values({ category, date, content }).returning();
  res.status(201).json({ ...note, createdAt: note.createdAt.toISOString() });
});

router.patch("/notes/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { category, date, content } = req.body;
  const update: Record<string, unknown> = {};
  if (category !== undefined) update.category = category;
  if (date !== undefined) update.date = date;
  if (content !== undefined) update.content = content;
  const [note] = await db.update(healthNotesTable).set(update).where(eq(healthNotesTable.id, id)).returning();
  res.json({ ...note, createdAt: note.createdAt.toISOString() });
});

router.delete("/notes/:id", async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(healthNotesTable).where(eq(healthNotesTable.id, id));
  res.sendStatus(204);
});

export default router;
