import { pgTable, serial, text, integer, boolean, timestamp, numeric, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// TODOS
export const todosTable = pgTable("todos", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  done: boolean("done").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
export const insertTodoSchema = createInsertSchema(todosTable).omit({ id: true, createdAt: true });
export type InsertTodo = z.infer<typeof insertTodoSchema>;
export type Todo = typeof todosTable.$inferSelect;

// PRIORITIES
export const prioritiesTable = pgTable("priorities", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  rank: integer("rank").notNull().default(1),
});
export const insertPrioritySchema = createInsertSchema(prioritiesTable).omit({ id: true });
export type InsertPriority = z.infer<typeof insertPrioritySchema>;
export type Priority = typeof prioritiesTable.$inferSelect;

// CONDITIONS (mood)
export const conditionsTable = pgTable("conditions", {
  id: serial("id").primaryKey(),
  date: text("date").notNull().unique(),
  level: integer("level").notNull(),
  note: text("note"),
});
export const insertConditionSchema = createInsertSchema(conditionsTable).omit({ id: true });
export type InsertCondition = z.infer<typeof insertConditionSchema>;
export type Condition = typeof conditionsTable.$inferSelect;

// MEMOS (keyed by name)
export const memosTable = pgTable("memos", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  content: text("content").notNull().default(""),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
export const insertMemoSchema = createInsertSchema(memosTable).omit({ id: true, updatedAt: true });
export type InsertMemo = z.infer<typeof insertMemoSchema>;
export type Memo = typeof memosTable.$inferSelect;

// SHOPPING ITEMS
export const shoppingItemsTable = pgTable("shopping_items", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  bought: boolean("bought").notNull().default(false),
});
export const insertShoppingItemSchema = createInsertSchema(shoppingItemsTable).omit({ id: true });
export type InsertShoppingItem = z.infer<typeof insertShoppingItemSchema>;
export type ShoppingItem = typeof shoppingItemsTable.$inferSelect;

// WORK NOTES
export const workNotesTable = pgTable("work_notes", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(), // idea, blog, content, memo
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
export const insertWorkNoteSchema = createInsertSchema(workNotesTable).omit({ id: true, createdAt: true });
export type InsertWorkNote = z.infer<typeof insertWorkNoteSchema>;
export type WorkNote = typeof workNotesTable.$inferSelect;

// CLIENTS (consulting)
export const clientsTable = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  status: text("status"),
  topic: text("topic"),
  proposal: text("proposal"),
  nextAction: text("next_action"),
  feeMemo: text("fee_memo"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
export const insertClientSchema = createInsertSchema(clientsTable).omit({ id: true, createdAt: true });
export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clientsTable.$inferSelect;

// MONEY RECORDS
export const moneyRecordsTable = pgTable("money_records", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // income, expense
  amount: integer("amount").notNull(),
  category: text("category"),
  description: text("description"),
  date: text("date").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
export const insertMoneyRecordSchema = createInsertSchema(moneyRecordsTable).omit({ id: true, createdAt: true });
export type InsertMoneyRecord = z.infer<typeof insertMoneyRecordSchema>;
export type MoneyRecord = typeof moneyRecordsTable.$inferSelect;

// FIXED COSTS
export const fixedCostsTable = pgTable("fixed_costs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  amount: integer("amount").notNull(),
  note: text("note"),
});
export const insertFixedCostSchema = createInsertSchema(fixedCostsTable).omit({ id: true });
export type InsertFixedCost = z.infer<typeof insertFixedCostSchema>;
export type FixedCost = typeof fixedCostsTable.$inferSelect;

// SUBSCRIPTIONS
export const subscriptionsTable = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  amount: integer("amount").notNull(),
  billingCycle: text("billing_cycle"),
  note: text("note"),
});
export const insertSubscriptionSchema = createInsertSchema(subscriptionsTable).omit({ id: true });
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptionsTable.$inferSelect;

// HEALTH LOGS
export const healthLogsTable = pgTable("health_logs", {
  id: serial("id").primaryKey(),
  date: text("date").notNull().unique(),
  sleepHours: numeric("sleep_hours"),
  sleepNote: text("sleep_note"),
  meals: text("meals"),
  medication: text("medication"),
  conditionMemo: text("condition_memo"),
});
export const insertHealthLogSchema = createInsertSchema(healthLogsTable).omit({ id: true });
export type InsertHealthLog = z.infer<typeof insertHealthLogSchema>;
export type HealthLog = typeof healthLogsTable.$inferSelect;

// HEALTH NOTES
export const healthNotesTable = pgTable("health_notes", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(), // visiting_nurse, doctor, counseling
  date: text("date").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
export const insertHealthNoteSchema = createInsertSchema(healthNotesTable).omit({ id: true, createdAt: true });
export type InsertHealthNote = z.infer<typeof insertHealthNoteSchema>;
export type HealthNote = typeof healthNotesTable.$inferSelect;
