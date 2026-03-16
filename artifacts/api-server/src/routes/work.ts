import { Router } from "express";
import { db } from "@workspace/db";
import { workNotesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

router.get("/notes", async (req, res) => {
  const { category } = req.query;
  let items;
  if (category) {
    items = await db.select().from(workNotesTable).where(eq(workNotesTable.category, String(category)));
  } else {
    items = await db.select().from(workNotesTable);
  }
  items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  res.json(items.map(n => ({ ...n, createdAt: n.createdAt.toISOString() })));
});

router.post("/notes", async (req, res) => {
  const { category, content } = req.body;
  const [note] = await db.insert(workNotesTable).values({ category, content }).returning();
  res.status(201).json({ ...note, createdAt: note.createdAt.toISOString() });
});

router.patch("/notes/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { category, content } = req.body;
  const update: Partial<{ category: string; content: string }> = {};
  if (category !== undefined) update.category = category;
  if (content !== undefined) update.content = content;
  const [note] = await db.update(workNotesTable).set(update).where(eq(workNotesTable.id, id)).returning();
  res.json({ ...note, createdAt: note.createdAt.toISOString() });
});

router.delete("/notes/:id", async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(workNotesTable).where(eq(workNotesTable.id, id));
  res.sendStatus(204);
});

export default router;
