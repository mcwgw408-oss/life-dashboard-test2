import { Router } from "express";
import { db } from "@workspace/db";
import { memosTable, shoppingItemsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

// DAILY MEMO
router.get("/memo", async (_req, res) => {
  let [memo] = await db.select().from(memosTable).where(eq(memosTable.key, "daily"));
  if (!memo) {
    [memo] = await db.insert(memosTable).values({ key: "daily", content: "" }).returning();
  }
  res.json({ ...memo, updatedAt: memo.updatedAt.toISOString() });
});

router.put("/memo", async (req, res) => {
  const { content } = req.body;
  const existing = await db.select().from(memosTable).where(eq(memosTable.key, "daily"));
  let memo;
  if (existing.length > 0) {
    [memo] = await db.update(memosTable).set({ content, updatedAt: new Date() }).where(eq(memosTable.key, "daily")).returning();
  } else {
    [memo] = await db.insert(memosTable).values({ key: "daily", content }).returning();
  }
  res.json({ ...memo, updatedAt: memo.updatedAt.toISOString() });
});

// SHOPPING ITEMS
router.get("/shopping", async (_req, res) => {
  const items = await db.select().from(shoppingItemsTable).orderBy(shoppingItemsTable.id);
  res.json(items);
});

router.post("/shopping", async (req, res) => {
  const { text } = req.body;
  const [item] = await db.insert(shoppingItemsTable).values({ text, bought: false }).returning();
  res.status(201).json(item);
});

router.patch("/shopping/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { text, bought } = req.body;
  const update: Partial<{ text: string; bought: boolean }> = {};
  if (text !== undefined) update.text = text;
  if (bought !== undefined) update.bought = bought;
  const [item] = await db.update(shoppingItemsTable).set(update).where(eq(shoppingItemsTable.id, id)).returning();
  res.json(item);
});

router.delete("/shopping/:id", async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(shoppingItemsTable).where(eq(shoppingItemsTable.id, id));
  res.sendStatus(204);
});

export default router;
