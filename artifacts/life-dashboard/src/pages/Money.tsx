import { useState, useMemo, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetMoneyRecords,
  useCreateMoneyRecord,
  useUpdateMoneyRecord,
  useDeleteMoneyRecord,
  getGetMoneyRecordsQueryKey,
  type MoneyRecord,
} from "@workspace/api-client-react";
import { Card, Button, Input, Modal, cn } from "@/components/ui-elements";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import {
  Plus, Wallet, TrendingDown, TrendingUp, ChevronLeft, ChevronRight,
  Trash2, Pencil, Tag, CalendarDays, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import { format, startOfMonth, addMonths, subMonths, parseISO } from "date-fns";
import { ja } from "date-fns/locale";

// ────────────────────────────────────────────────────────────
// CATEGORIES
// ────────────────────────────────────────────────────────────
const EXPENSE_CATEGORIES = [
  { id: "食費",       color: "#f97316" },
  { id: "外食",       color: "#fb923c" },
  { id: "日用品",     color: "#facc15" },
  { id: "交通費",     color: "#4ade80" },
  { id: "医療・薬",   color: "#34d399" },
  { id: "娯楽・趣味", color: "#60a5fa" },
  { id: "衣類・美容", color: "#c084fc" },
  { id: "光熱費",     color: "#f472b6" },
  { id: "その他",     color: "#94a3b8" },
];

const INCOME_CATEGORIES = [
  { id: "給与",   color: "#22c55e" },
  { id: "賞与",   color: "#16a34a" },
  { id: "副業",   color: "#10b981" },
  { id: "投資",   color: "#06b6d4" },
  { id: "贈り物", color: "#6366f1" },
  { id: "その他", color: "#94a3b8" },
];

function expenseCatColor(cat: string | null | undefined) {
  return EXPENSE_CATEGORIES.find(c => c.id === cat)?.color ?? "#94a3b8";
}
function incomeCatColor(cat: string | null | undefined) {
  return INCOME_CATEGORIES.find(c => c.id === cat)?.color ?? "#22c55e";
}

type TabType = "expense" | "income";

// ────────────────────────────────────────────────────────────
// MAIN PAGE
// ────────────────────────────────────────────────────────────
export default function Money() {
  const [month, setMonth] = useState<Date>(startOfMonth(new Date()));
  const [tab, setTab] = useState<TabType>("expense");
  const monthStr = format(month, "yyyy-MM");

  const { data: records = [] } = useGetMoneyRecords({ month: monthStr });

  const expenses = useMemo(
    () => records.filter(r => r.type === "expense").sort((a, b) => b.date.localeCompare(a.date)),
    [records]
  );
  const incomes = useMemo(
    () => records.filter(r => r.type === "income").sort((a, b) => b.date.localeCompare(a.date)),
    [records]
  );

  const totalExpense = useMemo(() => expenses.reduce((s, r) => s + r.amount, 0), [expenses]);
  const totalIncome  = useMemo(() => incomes.reduce((s, r) => s + r.amount, 0), [incomes]);
  const balance = totalIncome - totalExpense;

  const expenseCatData = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach(r => { const k = r.category || "その他"; map[k] = (map[k] ?? 0) + r.amount; });
    return Object.entries(map).map(([name, value]) => ({ name, value, color: expenseCatColor(name) })).sort((a, b) => b.value - a.value);
  }, [expenses]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<MoneyRecord | null>(null);
  const [formType, setFormType] = useState<TabType>("expense");

  const openAdd = (type: TabType) => { setFormType(type); setEditRecord(null); setIsFormOpen(true); };
  const openEdit = (r: MoneyRecord) => { setFormType(r.type as TabType); setEditRecord(r); setIsFormOpen(true); };

  return (
    <div className="space-y-5 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── HEADER + MONTH NAV ── */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center">
            <Wallet size={20} className="text-emerald-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">家計簿</h1>
            <p className="text-xs text-muted-foreground">収支を記録・管理</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setMonth(m => subMonths(m, 1))}
            className="w-8 h-8 rounded-xl bg-card border border-white/60 flex items-center justify-center hover:bg-white transition-colors">
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-bold text-foreground min-w-[72px] text-center">
            {format(month, "yyyy年M月")}
          </span>
          <button onClick={() => setMonth(m => addMonths(m, 1))}
            className="w-8 h-8 rounded-xl bg-card border border-white/60 flex items-center justify-center hover:bg-white transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* ── SUMMARY CARDS ── */}
      <div className="grid grid-cols-3 gap-3">
        {/* Income */}
        <Card className="p-4 bg-emerald-50/80 border-emerald-100">
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingUp size={14} className="text-emerald-500 flex-shrink-0" />
            <span className="text-xs font-medium text-emerald-600 leading-tight">収入</span>
          </div>
          <p className="text-lg font-bold tabular-nums text-emerald-700 leading-tight">
            ¥{totalIncome.toLocaleString()}
          </p>
          <p className="text-[10px] text-emerald-400 mt-0.5">{incomes.length}件</p>
        </Card>

        {/* Expense */}
        <Card className="p-4 bg-rose-50/80 border-rose-100">
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingDown size={14} className="text-rose-500 flex-shrink-0" />
            <span className="text-xs font-medium text-rose-600 leading-tight">支出</span>
          </div>
          <p className="text-lg font-bold tabular-nums text-rose-700 leading-tight">
            ¥{totalExpense.toLocaleString()}
          </p>
          <p className="text-[10px] text-rose-400 mt-0.5">{expenses.length}件</p>
        </Card>

        {/* Balance */}
        <Card className={cn(
          "p-4 border",
          balance >= 0 ? "bg-blue-50/80 border-blue-100" : "bg-amber-50/80 border-amber-100"
        )}>
          <div className="flex items-center gap-1.5 mb-2">
            <Wallet size={14} className={balance >= 0 ? "text-blue-500 flex-shrink-0" : "text-amber-500 flex-shrink-0"} />
            <span className={cn("text-xs font-medium leading-tight", balance >= 0 ? "text-blue-600" : "text-amber-600")}>残高</span>
          </div>
          <p className={cn("text-lg font-bold tabular-nums leading-tight", balance >= 0 ? "text-blue-700" : "text-amber-700")}>
            {balance >= 0 ? "+" : ""}¥{balance.toLocaleString()}
          </p>
          <p className={cn("text-[10px] mt-0.5", balance >= 0 ? "text-blue-400" : "text-amber-400")}>
            {balance >= 0 ? "黒字" : "赤字"}
          </p>
        </Card>
      </div>

      {/* ── TAB SWITCHER ── */}
      <div className="flex gap-2">
        {([
          { key: "expense", label: "支出", icon: ArrowUpRight, activeClass: "bg-rose-500 text-white shadow-rose-200" },
          { key: "income",  label: "収入", icon: ArrowDownRight, activeClass: "bg-emerald-500 text-white shadow-emerald-200" },
        ] as const).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-bold transition-all duration-200 shadow-sm",
              tab === t.key ? t.activeClass : "bg-card/80 text-muted-foreground hover:bg-white border border-white/60"
            )}
          >
            <t.icon size={15} />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── EXPENSE TAB ── */}
      {tab === "expense" && (
        <>
          {/* Pie chart */}
          {expenseCatData.length > 0 && (
            <Card>
              <h2 className="font-bold text-sm mb-4 flex items-center gap-2">
                <Tag size={15} className="text-rose-400" /> カテゴリ別内訳
              </h2>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-40 h-40 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={expenseCatData} cx="50%" cy="50%" innerRadius="52%" outerRadius="78%"
                        paddingAngle={2} dataKey="value" stroke="none">
                        {expenseCatData.map(e => <Cell key={e.name} fill={e.color} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => `¥${v.toLocaleString()}`}
                        contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: "12px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 w-full space-y-2">
                  {expenseCatData.map(cat => (
                    <div key={cat.name} className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                      <span className="text-sm text-foreground flex-1">{cat.name}</span>
                      <span className="text-sm font-bold tabular-nums">¥{cat.value.toLocaleString()}</span>
                      <span className="text-xs text-muted-foreground tabular-nums w-9 text-right">
                        {totalExpense > 0 ? Math.round(cat.value / totalExpense * 100) : 0}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Expense list */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-sm flex items-center gap-2">
                <CalendarDays size={15} className="text-rose-400" /> 支出一覧
              </h2>
              <Button size="sm" onClick={() => openAdd("expense")} className="bg-rose-500 hover:bg-rose-600 text-white">
                <Plus size={15} /> 支出を追加
              </Button>
            </div>
            {expenses.length === 0 ? (
              <EmptyState type="expense" onAdd={() => openAdd("expense")} />
            ) : (
              <div className="space-y-1">
                {expenses.map(r => <RecordRow key={r.id} record={r} onEdit={openEdit} />)}
              </div>
            )}
          </Card>
        </>
      )}

      {/* ── INCOME TAB ── */}
      {tab === "income" && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-sm flex items-center gap-2">
              <CalendarDays size={15} className="text-emerald-500" /> 収入一覧
            </h2>
            <Button size="sm" onClick={() => openAdd("income")} className="bg-emerald-500 hover:bg-emerald-600 text-white">
              <Plus size={15} /> 収入を追加
            </Button>
          </div>
          {incomes.length === 0 ? (
            <EmptyState type="income" onAdd={() => openAdd("income")} />
          ) : (
            <div className="space-y-1">
              {incomes.map(r => <RecordRow key={r.id} record={r} onEdit={openEdit} />)}
            </div>
          )}
        </Card>
      )}

      {/* ── FAB (mobile) ── */}
      <button
        onClick={() => openAdd(tab)}
        className={cn(
          "fixed bottom-24 right-5 z-30 w-14 h-14 rounded-full shadow-xl flex items-center justify-center sm:hidden active:scale-95 transition-transform",
          tab === "expense"
            ? "bg-rose-500 text-white shadow-rose-300"
            : "bg-emerald-500 text-white shadow-emerald-300"
        )}
      >
        <Plus size={24} />
      </button>

      {/* ── MODAL ── */}
      <RecordModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        record={editRecord}
        type={formType}
      />
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// RECORD ROW
// ────────────────────────────────────────────────────────────
function RecordRow({ record, onEdit }: { record: MoneyRecord; onEdit: (r: MoneyRecord) => void }) {
  const isExpense = record.type === "expense";
  const cat = record.category || "その他";
  const color = isExpense ? expenseCatColor(cat) : incomeCatColor(cat);

  return (
    <button
      onClick={() => onEdit(record)}
      className="w-full text-left flex items-center gap-3 p-3 rounded-2xl hover:bg-white/70 active:bg-white transition-colors group"
    >
      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full"
            style={{ backgroundColor: color + "22", color }}>
            {cat}
          </span>
          {record.description && (
            <span className="text-sm text-foreground truncate">{record.description}</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {format(parseISO(record.date), "M月d日（E）", { locale: ja })}
        </p>
      </div>
      <span className={cn(
        "font-bold tabular-nums text-sm flex-shrink-0",
        isExpense ? "text-rose-600" : "text-emerald-600"
      )}>
        {isExpense ? "-" : "+"}¥{record.amount.toLocaleString()}
      </span>
      <Pencil size={14} className="text-muted-foreground opacity-0 group-hover:opacity-60 transition-opacity flex-shrink-0" />
    </button>
  );
}

// ────────────────────────────────────────────────────────────
// EMPTY STATE
// ────────────────────────────────────────────────────────────
function EmptyState({ type, onAdd }: { type: TabType; onAdd: () => void }) {
  return (
    <div className="text-center py-10 text-muted-foreground">
      <Wallet size={30} className="mx-auto mb-3 opacity-25" />
      <p className="text-sm">{type === "expense" ? "支出" : "収入"}がありません</p>
      <button onClick={onAdd}
        className="mt-3 text-xs underline underline-offset-2 opacity-60 hover:opacity-100 transition-opacity">
        追加する
      </button>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// RECORD MODAL  (支出 / 収入 共通)
// ────────────────────────────────────────────────────────────
function RecordModal({
  isOpen, onClose, record, type,
}: {
  isOpen: boolean;
  onClose: () => void;
  record: MoneyRecord | null;
  type: TabType;
}) {
  const queryClient = useQueryClient();
  const today = format(new Date(), "yyyy-MM-dd");
  const isExpense = type === "expense";
  const cats = isExpense ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const accentColor = isExpense ? "#f43f5e" : "#22c55e";

  const [date, setDate]       = useState(today);
  const [amount, setAmount]   = useState("");
  const [category, setCategory] = useState(cats[0].id);
  const [memo, setMemo]       = useState("");

  useEffect(() => {
    if (isOpen) {
      setDate(record?.date ?? today);
      setAmount(record?.amount?.toString() ?? "");
      const defaultCat = cats.find(c => c.id === record?.category) ? record!.category! : cats[0].id;
      setCategory(defaultCat);
      setMemo(record?.description ?? "");
    }
  }, [isOpen, record, type]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getGetMoneyRecordsQueryKey() });

  const { mutate: create, isPending: isCreating } = useCreateMoneyRecord({ mutation: { onSuccess: () => { invalidate(); onClose(); } } });
  const { mutate: update, isPending: isUpdating } = useUpdateMoneyRecord({ mutation: { onSuccess: () => { invalidate(); onClose(); } } });
  const { mutate: remove, isPending: isDeleting } = useDeleteMoneyRecord({ mutation: { onSuccess: () => { invalidate(); onClose(); } } });

  const isPending = isCreating || isUpdating || isDeleting;

  const handleSave = () => {
    const num = parseInt(amount, 10);
    if (!amount || isNaN(num) || num <= 0) return;
    const payload = { type, amount: num, category, description: memo || undefined, date };
    if (record) update({ id: record.id, data: payload });
    else create({ data: payload });
  };

  const title = record
    ? (isExpense ? "支出を編集" : "収入を編集")
    : (isExpense ? "支出を追加" : "収入を追加");

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">

        {/* Type indicator */}
        <div className="flex items-center gap-2 p-2.5 rounded-xl" style={{ backgroundColor: accentColor + "15" }}>
          {isExpense
            ? <ArrowUpRight size={16} style={{ color: accentColor }} />
            : <ArrowDownRight size={16} style={{ color: accentColor }} />}
          <span className="text-sm font-semibold" style={{ color: accentColor }}>
            {isExpense ? "支出" : "収入"}
          </span>
        </div>

        {/* Date */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">日付</label>
          <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>

        {/* Amount */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">金額 *</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">¥</span>
            <Input
              type="number" inputMode="numeric"
              value={amount} onChange={e => setAmount(e.target.value)}
              placeholder="0" className="pl-8 text-xl font-bold tabular-nums" autoFocus
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">カテゴリ</label>
          <div className="grid grid-cols-3 gap-2">
            {cats.map(cat => (
              <button key={cat.id} onClick={() => setCategory(cat.id)}
                className={cn(
                  "py-2 px-1 rounded-xl text-sm font-medium transition-all duration-150 border",
                  category === cat.id ? "border-current text-white shadow-sm" : "border-transparent bg-muted/40 text-muted-foreground hover:bg-muted/60"
                )}
                style={category === cat.id ? { backgroundColor: cat.color, borderColor: cat.color } : {}}>
                {cat.id}
              </button>
            ))}
          </div>
        </div>

        {/* Memo */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">メモ</label>
          <Input value={memo} onChange={e => setMemo(e.target.value)} placeholder="内容・メモ（任意）" />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          {record
            ? <Button variant="danger" size="icon" onClick={() => remove({ id: record.id })} disabled={isPending}><Trash2 size={18} /></Button>
            : <div />}
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose} disabled={isPending}>キャンセル</Button>
            <Button onClick={handleSave} disabled={isPending || !amount}>保存する</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
