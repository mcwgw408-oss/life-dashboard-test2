import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { 
  useGetHealthLogs, useUpsertHealthLog, getGetHealthLogsQueryKey,
  useGetHealthNotes, useCreateHealthNote, useUpdateHealthNote, useDeleteHealthNote, getGetHealthNotesQueryKey,
  type HealthNote, type GetHealthNotesCategory
} from "@workspace/api-client-react";
import { Card, Input, Button, Textarea, PageHeader, Modal, cn } from "@/components/ui-elements";
import { HeartPulse, Moon, Coffee, Pill, Activity, ChevronLeft, ChevronRight, Plus, Trash2, Edit2 } from "lucide-react";
import { format, addDays, subDays } from "date-fns";
import { ja } from "date-fns/locale";

const NOTE_CATEGORIES: { id: GetHealthNotesCategory, label: string }[] = [
  { id: "visiting_nurse", label: "訪問看護" },
  { id: "doctor", label: "受診" },
  { id: "counseling", label: "カウンセリング" },
];

export default function Health() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const dateStr = format(currentDate, "yyyy-MM-dd");

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <PageHeader title="健康" icon={HeartPulse} />
        
        {/* Date Navigator */}
        <div className="flex items-center gap-4 bg-card/80 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm border border-white/50">
          <Button variant="ghost" size="icon" onClick={() => setCurrentDate(subDays(currentDate, 1))} className="h-8 w-8">
            <ChevronLeft size={18} />
          </Button>
          <span className="font-bold w-32 text-center font-num">
            {format(currentDate, "yyyy.MM.dd (E)", { locale: ja })}
          </span>
          <Button variant="ghost" size="icon" onClick={() => setCurrentDate(addDays(currentDate, 1))} className="h-8 w-8">
            <ChevronRight size={18} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HealthLogSection date={dateStr} />
        <HealthNotesSection />
      </div>
    </div>
  );
}

function HealthLogSection({ date }: { date: string }) {
  const queryClient = useQueryClient();
  const { data: log } = useGetHealthLogs({ date });
  const { mutate, isPending } = useUpsertHealthLog({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetHealthLogsQueryKey() }) }
  });

  const [formData, setFormData] = useState({
    sleepHours: "", sleepNote: "", meals: "", medication: "", conditionMemo: ""
  });

  useEffect(() => {
    setFormData({
      sleepHours: log?.sleepHours?.toString() || "",
      sleepNote: log?.sleepNote || "",
      meals: log?.meals || "",
      medication: log?.medication || "",
      conditionMemo: log?.conditionMemo || ""
    });
  }, [log, date]);

  const handleSave = () => {
    mutate({ data: { 
      date, 
      sleepHours: formData.sleepHours ? parseFloat(formData.sleepHours) : undefined,
      sleepNote: formData.sleepNote,
      meals: formData.meals,
      medication: formData.medication,
      conditionMemo: formData.conditionMemo
    }});
  };

  return (
    <Card className="flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-lg">デイリー記録</h3>
        <Button size="sm" onClick={handleSave} disabled={isPending}>{isPending ? "保存中..." : "保存"}</Button>
      </div>

      <div className="space-y-5">
        <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
          <div className="flex items-center gap-2 mb-3 text-blue-700 font-bold">
            <Moon size={18} /> 睡眠
          </div>
          <div className="flex gap-3 items-center">
            <Input type="number" step="0.5" value={formData.sleepHours} onChange={e => setFormData({...formData, sleepHours: e.target.value})} placeholder="時間" className="w-24 bg-white font-num" />
            <span className="text-sm text-muted-foreground">時間</span>
            <Input value={formData.sleepNote} onChange={e => setFormData({...formData, sleepNote: e.target.value})} placeholder="睡眠の質など..." className="flex-1 bg-white" />
          </div>
        </div>

        <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100">
          <div className="flex items-center gap-2 mb-3 text-orange-700 font-bold">
            <Coffee size={18} /> 食事
          </div>
          <Textarea value={formData.meals} onChange={e => setFormData({...formData, meals: e.target.value})} placeholder="朝: パン&#10;昼: 定食..." className="bg-white" rows={2} />
        </div>

        <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
          <div className="flex items-center gap-2 mb-3 text-emerald-700 font-bold">
            <Pill size={18} /> 服薬
          </div>
          <Input value={formData.medication} onChange={e => setFormData({...formData, medication: e.target.value})} placeholder="飲んだ薬の記録..." className="bg-white" />
        </div>

        <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100">
          <div className="flex items-center gap-2 mb-3 text-rose-700 font-bold">
            <Activity size={18} /> 体調メモ
          </div>
          <Textarea value={formData.conditionMemo} onChange={e => setFormData({...formData, conditionMemo: e.target.value})} placeholder="頭痛あり、気分が良いなど..." className="bg-white" rows={3} />
        </div>
      </div>
    </Card>
  );
}

function HealthNotesSection() {
  const [activeTab, setActiveTab] = useState<GetHealthNotesCategory>("visiting_nurse");
  const { data: notes = [] } = useGetHealthNotes({ category: activeTab });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<HealthNote | null>(null);

  const handleAdd = () => { setEditingNote(null); setIsModalOpen(true); };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Tabs */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 p-1">
        {NOTE_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.id)}
            className={cn(
              "px-4 py-2 rounded-2xl font-medium text-sm whitespace-nowrap transition-all duration-300",
              activeTab === cat.id 
                ? "bg-secondary text-secondary-foreground shadow-md" 
                : "bg-card text-muted-foreground hover:bg-white/80"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <Card className="flex-1 min-h-[400px]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold">{NOTE_CATEGORIES.find(c => c.id === activeTab)?.label}の記録</h3>
          <Button size="sm" onClick={handleAdd} variant="secondary"><Plus size={16} /> 記録</Button>
        </div>

        <div className="space-y-3">
          {notes.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">記録がありません</p>
          ) : (
            notes.sort((a,b) => b.date.localeCompare(a.date)).map(note => (
              <div key={note.id} className="p-4 bg-muted/20 rounded-2xl border border-white/50 relative group">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-bold text-secondary-foreground bg-secondary/20 px-2 py-0.5 rounded font-num">{note.date}</span>
                  <Button variant="ghost" size="icon" onClick={() => { setEditingNote(note); setIsModalOpen(true); }} className="h-6 w-6 opacity-0 group-hover:opacity-100">
                    <Edit2 size={14} />
                  </Button>
                </div>
                <p className="text-sm whitespace-pre-wrap">{note.content}</p>
              </div>
            ))
          )}
        </div>
      </Card>

      <HealthNoteModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} note={editingNote} category={activeTab} />
    </div>
  );
}

function HealthNoteModal({ isOpen, onClose, note, category }: { isOpen: boolean, onClose: () => void, note: HealthNote | null, category: GetHealthNotesCategory }) {
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  
  useEffect(() => {
    if (isOpen) {
      setContent(note?.content || "");
      setDate(note?.date || format(new Date(), "yyyy-MM-dd"));
    }
  }, [isOpen, note]);

  const { mutate: create } = useCreateHealthNote({ mutation: { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetHealthNotesQueryKey() }); onClose(); } }});
  const { mutate: update } = useUpdateHealthNote({ mutation: { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetHealthNotesQueryKey() }); onClose(); } }});
  const { mutate: remove } = useDeleteHealthNote({ mutation: { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetHealthNotesQueryKey() }); onClose(); } }});

  const handleSave = () => {
    if (!content.trim()) return;
    if (note) update({ id: note.id, data: { content, date } });
    else create({ data: { category, content, date } });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={note ? "記録を編集" : "新規記録"}>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">日付</label>
          <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1" />
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">内容</label>
          <Textarea value={content} onChange={e => setContent(e.target.value)} className="mt-1 h-32" />
        </div>
        <div className="flex justify-between items-center pt-4">
          {note ? <Button variant="danger" size="icon" onClick={() => remove({ id: note.id })}><Trash2 size={18} /></Button> : <div/>}
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>キャンセル</Button>
            <Button onClick={handleSave} disabled={!content.trim()}>保存</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
