import { Router } from "express";
import { db } from "@workspace/db";
import { clientsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/clients", async (_req, res) => {
  const clients = await db.select().from(clientsTable).orderBy(clientsTable.id);
  res.json(clients.map(c => ({ ...c, createdAt: c.createdAt.toISOString() })));
});

router.post("/clients", async (req, res) => {
  const { name, status, topic, proposal, nextAction, feeMemo, notes } = req.body;
  const [client] = await db.insert(clientsTable).values({
    name,
    status: status ?? null,
    topic: topic ?? null,
    proposal: proposal ?? null,
    nextAction: nextAction ?? null,
    feeMemo: feeMemo ?? null,
    notes: notes ?? null,
  }).returning();
  res.status(201).json({ ...client, createdAt: client.createdAt.toISOString() });
});

router.patch("/clients/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { name, status, topic, proposal, nextAction, feeMemo, notes } = req.body;
  const update: Record<string, unknown> = {};
  if (name !== undefined) update.name = name;
  if (status !== undefined) update.status = status;
  if (topic !== undefined) update.topic = topic;
  if (proposal !== undefined) update.proposal = proposal;
  if (nextAction !== undefined) update.nextAction = nextAction;
  if (feeMemo !== undefined) update.feeMemo = feeMemo;
  if (notes !== undefined) update.notes = notes;
  const [client] = await db.update(clientsTable).set(update).where(eq(clientsTable.id, id)).returning();
  res.json({ ...client, createdAt: client.createdAt.toISOString() });
});

router.delete("/clients/:id", async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(clientsTable).where(eq(clientsTable.id, id));
  res.sendStatus(204);
});

export default router;
