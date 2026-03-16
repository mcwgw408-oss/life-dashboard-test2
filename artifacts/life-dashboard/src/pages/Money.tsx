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
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import {
  Plus, Wallet, TrendingDown, ChevronLeft, ChevronRight,
  Trash2, Pencil, Tag, CalendarDays, StickyNote, X
} from "lucide-react";
import { format, startOfMonth, endOfMonth, addMonths, subMonths, parseISO } from "date-fns";
import { ja } from "date-fns/locale";

// ────────────────────────────────────────────────────────────
// CATEGORIES
// ────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "食費",      label: "食費",       color: "#f97316" },
  { id: "外食",      label: "外食",       color: "#fb923c" },
  { id: "日用品",    label: "日用品",     color: "#facc15" },
  { id: "交通費",    label: "交通費",     color: "#4ade80" },
  { id: "医療・薬",  label: "医療・薬",   color: "#34d399" },
  { id: "娯楽・趣味", label: "娯楽・趣味", color: "#60a5fa" },
  { id: "衣類・美容", label: "衣類・美容", color: "#c084fc" },
  { id: "光熱費",    label: "光熱費",     color: "#f472b6" },
  { id: "その他",    label: "その他",     color: "#94a3b8" },
];

function categoryColor(cat: string | null | undefined) {
  return CATEGORIES.find(c => c.id === cat)?.color ?? "#94a3b8";
}

// ────────────────────────────────────────────────────────────
// MAIN PAGE
// ────────────────────────────────────────────────────────────
export default function Money() {
  const [month, setMonth] = useState<Date>(startOfMonth(new Date()));
  const monthStr = format(month, "yyyy-MM");

  const { data: records = [] } = useGetMoneyRecords({ month: monthStr });

  const expenses = useMemo(
    () => records.filter(r => r.type === "expense").sort((a, b) => b.date.localeCompare(a.date)),
    [records]
  );

  const totalExpense = useMemo(
    () => expenses.reduce((s, r) => s + r.amount, 0),
    [expenses]
  );

  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach(r => {
      const key = r.category || "その他";
      map[key] = (map[key] ?? 0) + r.amount;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value, color: categoryColor(name) }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<MoneyRecord | null>(null);

  const openAdd = () => { setEditRecord(null); setIsFormOpen(true); };
  const openEdit = (r: MoneyRecord) => { setEditRecord(r); setIsFormOpen(true); };

  return (
    <div className="space-y-5 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center">
            <Wallet size={20} className="text-emerald-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">家計簿</h1>
            <p className="text-xs text-muted-foreground">支出を記録・分析</p>
          </div>
        </div>

        {/* Month navigation */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMonth(m => subMonths(m, 1))}
            className="w-8 h-8 rounded-xl bg-card border border-white/60 flex items-center justify-center hover:bg-white transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-bold text-foreground min-w-[72px] text-center">
            {format(month, "yyyy年M月")}
          </span>
          <button
            onClick={() => setMonth(m => addMonths(m, 1))}
            className="w-8 h-8 rounded-xl bg-card border border-white/60 flex items-center justify-center hover:bg-white transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* ── MONTHLY TOTAL ── */}
      <Card className="bg-gradient-to-br from-rose-50 to-orange-50 border-rose-100">
        <div className="flex items-center gap-2 mb-1">
          <TrendingDown size={16} className="text-rose-500" />
          <span className="text-sm font-medium text-rose-600">今月の支出合計</span>
        </div>
        <p className="text-4xl font-bold text-rose-600 tabular-nums">
          ¥{totalExpense.toLocaleString()}
        </p>
        <p className="text-xs text-rose-400 mt-1">{expenses.length}件の支出</p>
      </Card>

      {/* ── PIE CHART ── */}
      {categoryData.length > 0 && (
        <Card>
          <h2 className="font-bold text-sm mb-4 flex items-center gap-2">
            <Tag size={15} className="text-primary" /> カテゴリ別内訳
          </h2>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-full sm:w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius="52%"
                    outerRadius="78%"
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {categoryData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: number) => `¥${v.toLocaleString()}`}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 w-full space-y-2">
              {categoryData.map(cat => (
                <div key={cat.name} className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-sm text-foreground flex-1">{cat.name}</span>
                  <span className="text-sm font-bold tabular-nums text-foreground">
                    ¥{cat.value.toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground tabular-nums w-10 text-right">
                    {totalExpense > 0 ? Math.round(cat.value / totalExpense * 100) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* ── EXPENSE LIST ── */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-sm flex items-center gap-2">
            <CalendarDays size={15} className="text-primary" /> 支出一覧
          </h2>
          <Button size="sm" onClick={openAdd}>
            <Plus size={15} /> 追加
          </Button>
        </div>

        {expenses.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Wallet size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">支出がありません</p>
            <p className="text-xs mt-1">右上の「追加」ボタンで記録しましょう</p>
          </div>
        ) : (
          <div className="space-y-2">
            {expenses.map(r => (
              <ExpenseRow key={r.id} record={r} onEdit={openEdit} />
            ))}
          </div>
        )}
      </Card>

      {/* ── FAB (mobile) ── */}
      <button
        onClick={openAdd}
        className="fixed bottom-24 right-5 z-30 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-xl shadow-primary/30 flex items-center justify-center sm:hidden active:scale-95 transition-transform"
      >
        <Plus size={24} />
      </button>

      {/* ── FORM MODAL ── */}
      <ExpenseModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        record={editRecord}
        defaultMonth={monthStr}
      />
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// EXPENSE ROW
// ────────────────────────────────────────────────────────────
function ExpenseRow({ record, onEdit }: { record: MoneyRecord; onEdit: (r: MoneyRecord) => void }) {
  const cat = record.category || "その他";
  const color = categoryColor(cat);

  return (
    <button
      onClick={() => onEdit(record)}
      className="w-full text-left flex items-center gap-3 p-3 rounded-2xl hover:bg-white/70 active:bg-white transition-colors group"
    >
      {/* color dot */}
      <span
        className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-0.5"
        style={{ backgroundColor: color }}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-[11px] font-medium px-2 py-0.5 rounded-full"
            style={{ backgroundColor: color + "22", color }}
          >
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

      <span className="font-bold tabular-nums text-rose-600 text-sm flex-shrink-0">
        -¥{record.amount.toLocaleString()}
      </span>

      <Pencil size={14} className="text-muted-foreground opacity-0 group-hover:opacity-60 transition-opacity flex-shrink-0" />
    </button>
  );
}

// ────────────────────────────────────────────────────────────
// EXPENSE MODAL (Add / Edit)
// ────────────────────────────────────────────────────────────
function ExpenseModal({
  isOpen,
  onClose,
  record,
  defaultMonth,
}: {
  isOpen: boolean;
  onClose: () => void;
  record: MoneyRecord | null;
  defaultMonth: string;
}) {
  const queryClient = useQueryClient();
  const today = format(new Date(), "yyyy-MM-dd");

  const [date, setDate] = useState(today);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0].id);
  const [memo, setMemo] = useState("");

  useEffect(() => {
    if (isOpen) {
      setDate(record?.date ?? today);
      setAmount(record?.amount?.toString() ?? "");
      setCategory(record?.category ?? CATEGORIES[0].id);
      setMemo(record?.description ?? "");
    }
  }, [isOpen, record]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getGetMoneyRecordsQueryKey() });

  const { mutate: create, isPending: isCreating } = useCreateMoneyRecord({
    mutation: { onSuccess: () => { invalidate(); onClose(); } },
  });
  const { mutate: update, isPending: isUpdating } = useUpdateMoneyRecord({
    mutation: { onSuccess: () => { invalidate(); onClose(); } },
  });
  const { mutate: remove, isPending: isDeleting } = useDeleteMoneyRecord({
    mutation: { onSuccess: () => { invalidate(); onClose(); } },
  });

  const isPending = isCreating || isUpdating || isDeleting;

  const handleSave = () => {
    const num = parseInt(amount, 10);
    if (!amount || isNaN(num) || num <= 0) return;
    const payload = { type: "expense" as const, amount: num, category, description: memo || undefined, date };
    if (record) update({ id: record.id, data: payload });
    else create({ data: payload });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={record ? "支出を編集" : "支出を追加"}>
      <div className="space-y-4">

        {/* Date */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
            日付
          </label>
          <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>

        {/* Amount */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
            金額 *
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">¥</span>
            <Input
              type="number"
              inputMode="numeric"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0"
              className="pl-8 text-xl font-bold tabular-nums"
              autoFocus
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
            カテゴリ
          </label>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={cn(
                  "py-2 px-2 rounded-xl text-sm font-medium transition-all duration-150 border",
                  category === cat.id
                    ? "border-current text-white shadow-sm"
                    : "border-transparent bg-muted/40 text-muted-foreground hover:bg-muted/60"
                )}
                style={category === cat.id ? { backgroundColor: cat.color, borderColor: cat.color } : {}}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Memo */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
            メモ
          </label>
          <Input
            value={memo}
            onChange={e => setMemo(e.target.value)}
            placeholder="内容・メモ（任意）"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          {record ? (
            <Button
              variant="danger"
              size="icon"
              onClick={() => remove({ id: record.id })}
              disabled={isPending}
            >
              <Trash2 size={18} />
            </Button>
          ) : (
            <div />
          )}
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose} disabled={isPending}>
              キャンセル
            </Button>
            <Button onClick={handleSave} disabled={isPending || !amount}>
              保存する
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
