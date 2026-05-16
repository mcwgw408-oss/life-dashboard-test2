import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { 
  useGetTodos, useCreateTodo, useUpdateTodo, useDeleteTodo, getGetTodosQueryKey,
  useGetPriorities, useCreatePriority, useUpdatePriority, useDeletePriority, getGetPrioritiesQueryKey,
  useGetCondition, useUpsertCondition, getGetConditionQueryKey,
  useGetHomeMemo, useUpsertHomeMemo, getGetHomeMemoQueryKey
} from "@workspace/api-client-react";
import { Card, Input, Button, Checkbox, Textarea, PageHeader, Modal } from "@/components/ui-elements";
import { Home as HomeIcon, Plus, Trash2, Smile, Edit2 } from "lucide-react";
import { format } from "date-fns";

export default function Home() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader title="ホーム" subtitle={format(new Date(), "yyyy年MM月dd日 (E)")} icon={HomeIcon} />
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <TodoSection />
          <HomeMemoSection />
        </div>
        <div className="lg:col-span-4 space-y-6">
          <ConditionSection />
          <PrioritySection />
        </div>
      </div>
    </div>
  );
}

function TodoSection() {
  const queryClient = useQueryClient();
  const { data: todos = [], isLoading } = useGetTodos();
  const [newTodo, setNewTodo] = useState("");

  const { mutate: create } = useCreateTodo({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetTodosQueryKey() }) }
  });
  const { mutate: update } = useUpdateTodo({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetTodosQueryKey() }) }
  });
  const { mutate: remove } = useDeleteTodo({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetTodosQueryKey() }) }
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    create({ data: { text: newTodo } });
    setNewTodo("");
  };

  return (
    <Card className="flex flex-col h-full min-h-[300px]">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <div className="w-2 h-6 bg-secondary rounded-full" />
        今日のタスク
      </h3>
      
      <div className="flex-1 overflow-y-auto space-y-2 mb-4 pr-2">
        {isLoading ? (
          <div className="animate-pulse space-y-2">
            {[1,2,3].map(i => <div key={i} className="h-12 bg-muted/50 rounded-xl" />)}
          </div>
        ) : todos.length === 0 ? (
          <p className="text-muted-foreground text-center py-8 text-sm">タスクはありません</p>
        ) : (
          todos.map(todo => (
            <div key={todo.id} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-muted/30 transition-colors group">
              <Checkbox 
                checked={todo.done} 
                onChange={(done) => update({ id: todo.id, data: { done } })} 
              />
              <span className={`flex-1 ${todo.done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                {todo.text}
              </span>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => remove({ id: todo.id })}
                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-500 hover:bg-red-50"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleAdd} className="flex gap-2 mt-auto">
        <Input 
          value={newTodo} 
          onChange={e => setNewTodo(e.target.value)} 
          placeholder="新しいタスクを追加..." 
          className="bg-white"
        />
        <Button type="submit" size="icon" disabled={!newTodo.trim()} className="shrink-0 aspect-square rounded-2xl">
          <Plus size={20} />
        </Button>
      </form>
    </Card>
  );
}

function PrioritySection() {
  const queryClient = useQueryClient();
  const { data: priorities = [] } = useGetPriorities();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { mutate: update } = useUpdatePriority({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetPrioritiesQueryKey() }) }
  });
  const { mutate: create } = useCreatePriority({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetPrioritiesQueryKey() }) }
  });

  const handleSave = (id: number | undefined, text: string, rank: number) => {
    if (id) update({ id, data: { text } });
    else create({ data: { text, rank } });
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <div className="w-2 h-6 bg-accent rounded-full" />
          トップ3優先事項
        </h3>
        <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(true)}>
          <Edit2 size={16} />
        </Button>
      </div>

      <div className="space-y-3">
        {[1, 2, 3].map(rank => {
          const p = priorities.find(x => x.rank === rank);
          return (
            <div key={rank} className="flex items-start gap-3 p-3 bg-muted/20 rounded-2xl border border-white/50">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent/20 text-accent-foreground font-bold text-sm shrink-0 mt-0.5">
                {rank}
              </span>
              <p className={`text-sm flex-1 ${p ? "text-foreground" : "text-muted-foreground italic"}`}>
                {p ? p.text : "未設定"}
              </p>
            </div>
          );
        })}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="優先事項を編集">
        <div className="space-y-4">
          {[1, 2, 3].map(rank => {
             const p = priorities.find(x => x.rank === rank);
             return (
               <div key={rank} className="space-y-1">
                 <label className="text-sm font-medium text-muted-foreground">優先度 {rank}</label>
                 <Input 
                   defaultValue={p?.text || ""}
                   onBlur={(e) => handleSave(p?.id, e.target.value, rank)}
                   placeholder={`優先度 ${rank} のタスク...`}
                 />
               </div>
             )
          })}
          <div className="pt-4 flex justify-end">
            <Button onClick={() => setIsModalOpen(false)}>完了</Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}

const CONDITIONS = [
  { level: 1, emoji: "😫", label: "とても悪い" },
  { level: 2, emoji: "🙁", label: "悪い" },
  { level: 3, emoji: "😐", label: "普通" },
  { level: 4, emoji: "🙂", label: "良い" },
  { level: 5, emoji: "😁", label: "とても良い" },
];

function ConditionSection() {
  const queryClient = useQueryClient();
  const { data: condition } = useGetCondition();
  const { mutate } = useUpsertCondition({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetConditionQueryKey() }) }
  });

  const today = format(new Date(), "yyyy-MM-dd");
  const currentLevel = condition?.level || 3;

  return (
    <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <Smile size={20} className="text-primary" />
        今日の調子
      </h3>
      
      <div className="flex justify-between items-center mb-4 bg-white/50 p-2 rounded-2xl">
        {CONDITIONS.map(c => (
          <button
            key={c.level}
            onClick={() => mutate({ data: { date: today, level: c.level, note: condition?.note } })}
            className={`text-3xl transition-transform duration-200 hover:scale-110 p-2 rounded-xl ${currentLevel === c.level ? "bg-white shadow-sm scale-110" : "opacity-50 grayscale hover:grayscale-0"}`}
            title={c.label}
          >
            {c.emoji}
          </button>
        ))}
      </div>
      
      <Input 
        value={condition?.note || ""}
        onChange={(e) => mutate({ data: { date: today, level: currentLevel, note: e.target.value } })}
        placeholder="一言メモ..."
        className="bg-white/50 border-white text-sm"
      />
    </Card>
  );
}

function HomeMemoSection() {
  const queryClient = useQueryClient();
  const { data: memo } = useGetHomeMemo();
  const { mutate, isPending } = useUpsertHomeMemo({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetHomeMemoQueryKey() }) }
  });
  
  const [content, setContent] = useState("");
  useEffect(() => { if (memo) setContent(memo.content); }, [memo]);

  return (
    <Card className="flex flex-col h-[300px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <div className="w-2 h-6 bg-primary/50 rounded-full" />
          メモ
        </h3>
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={() => mutate({ data: { content } })}
          disabled={isPending || content === memo?.content}
        >
          {isPending ? "保存中..." : "保存"}
        </Button>
      </div>
      <Textarea 
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="flex-1 bg-white/50 border-transparent shadow-inner resize-none focus:bg-white"
        placeholder="自由にメモを書き込めます..."
      />
    </Card>
  );
}
