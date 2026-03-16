import { Router } from "express";
import { db } from "@workspace/db";
import { moneyRecordsTable, fixedCostsTable, subscriptionsTable } from "@workspace/db";
import { eq, and, like } from "drizzle-orm";

const router = Router();

// MONEY RECORDS
router.get("/records", async (req, res) => {
  const { type, month } = req.query;
  let items = await db.select().from(moneyRecordsTable);
  if (type) {
    items = items.filter(r => r.type === String(type));
  }
  if (month) {
    items = items.filter(r => r.date.startsWith(String(month)));
  }
  items.sort((a, b) => b.date.localeCompare(a.date));
  res.json(items.map(r => ({ ...r, createdAt: r.createdAt.toISOString() })));
});

router.post("/records", async (req, res) => {
  const { type, amount, description, date } = req.body;
  const [record] = await db.insert(moneyRecordsTable).values({
    type,
    amount,
    description: description ?? null,
    date,
  }).returning();
  res.status(201).json({ ...record, createdAt: record.createdAt.toISOString() });
});

router.patch("/records/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { type, amount, description, date } = req.body;
  const update: Record<string, unknown> = {};
  if (type !== undefined) update.type = type;
  if (amount !== undefined) update.amount = amount;
  if (description !== undefined) update.description = description;
  if (date !== undefined) update.date = date;
  const [record] = await db.update(moneyRecordsTable).set(update).where(eq(moneyRecordsTable.id, id)).returning();
  res.json({ ...record, createdAt: record.createdAt.toISOString() });
});

router.delete("/records/:id", async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(moneyRecordsTable).where(eq(moneyRecordsTable.id, id));
  res.sendStatus(204);
});

// FIXED COSTS
router.get("/fixed-costs", async (_req, res) => {
  const items = await db.select().from(fixedCostsTable).orderBy(fixedCostsTable.id);
  res.json(items);
});

router.post("/fixed-costs", async (req, res) => {
  const { name, amount, note } = req.body;
  const [item] = await db.insert(fixedCostsTable).values({ name, amount, note: note ?? null }).returning();
  res.status(201).json(item);
});

router.patch("/fixed-costs/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { name, amount, note } = req.body;
  const update: Record<string, unknown> = {};
  if (name !== undefined) update.name = name;
  if (amount !== undefined) update.amount = amount;
  if (note !== undefined) update.note = note;
  const [item] = await db.update(fixedCostsTable).set(update).where(eq(fixedCostsTable.id, id)).returning();
  res.json(item);
});

router.delete("/fixed-costs/:id", async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(fixedCostsTable).where(eq(fixedCostsTable.id, id));
  res.sendStatus(204);
});

// SUBSCRIPTIONS
router.get("/subscriptions", async (_req, res) => {
  const items = await db.select().from(subscriptionsTable).orderBy(subscriptionsTable.id);
  res.json(items);
});

router.post("/subscriptions", async (req, res) => {
  const { name, amount, billingCycle, note } = req.body;
  const [item] = await db.insert(subscriptionsTable).values({
    name,
    amount,
    billingCycle: billingCycle ?? null,
    note: note ?? null,
  }).returning();
  res.status(201).json(item);
});

router.patch("/subscriptions/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { name, amount, billingCycle, note } = req.body;
  const update: Record<string, unknown> = {};
  if (name !== undefined) update.name = name;
  if (amount !== undefined) update.amount = amount;
  if (billingCycle !== undefined) update.billingCycle = billingCycle;
  if (note !== undefined) update.note = note;
  const [item] = await db.update(subscriptionsTable).set(update).where(eq(subscriptionsTable.id, id)).returning();
  res.json(item);
});

router.delete("/subscriptions/:id", async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(subscriptionsTable).where(eq(subscriptionsTable.id, id));
  res.sendStatus(204);
});

export default router;
