import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { 
  useGetWorkNotes, useCreateWorkNote, useUpdateWorkNote, useDeleteWorkNote, getGetWorkNotesQueryKey,
  type GetWorkNotesCategory, type WorkNote
} from "@workspace/api-client-react";
import { Card, Input, Button, Textarea, PageHeader, Modal, cn } from "@/components/ui-elements";
import { Briefcase, Plus, FileText, Trash2, Edit } from "lucide-react";
import { format } from "date-fns";

const CATEGORIES: { id: GetWorkNotesCategory, label: string }[] = [
  { id: "idea", label: "アイデア" },
  { id: "blog", label: "ブログ" },
  { id: "content", label: "コンテンツ" },
  { id: "memo", label: "作業メモ" },
];

export default function Work() {
  const [activeTab, setActiveTab] = useState<GetWorkNotesCategory>("idea");
  const { data: notes = [] } = useGetWorkNotes({ category: activeTab });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<WorkNote | null>(null);

  const handleAdd = () => {
    setEditingNote(null);
    setIsModalOpen(true);
  };

  const handleEdit = (note: WorkNote) => {
    setEditingNote(note);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <PageHeader title="仕事" icon={Briefcase} />
        <Button onClick={handleAdd} className="shrink-0 shadow-lg shadow-primary/20"><Plus size={18} /> 新規作成</Button>
      </div>
      
      {/* Custom Tabs */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.id)}
            className={cn(
              "px-5 py-2.5 rounded-full font-medium text-sm whitespace-nowrap transition-all duration-300",
              activeTab === cat.id 
                ? "bg-primary text-primary-foreground shadow-md" 
                : "bg-card text-muted-foreground hover:bg-white/80 border border-white/60"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground flex flex-col items-center justify-center opacity-50">
            <FileText size={48} className="mb-4" strokeWidth={1} />
            <p>ノートがありません</p>
          </div>
        ) : (
          notes.map(note => (
            <Card key={note.id} onClick={() => handleEdit(note)} className="flex flex-col h-48 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full" />
              <div className="flex-1 overflow-hidden">
                <p className="text-sm whitespace-pre-wrap leading-relaxed opacity-90 line-clamp-5">{note.content}</p>
              </div>
              <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-num">{format(new Date(note.createdAt), "yyyy.MM.dd")}</span>
                <span className="bg-muted px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">編集</span>
              </div>
            </Card>
          ))
        )}
      </div>

      <NoteModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        note={editingNote} 
        category={activeTab} 
      />
    </div>
  );
}

function NoteModal({ isOpen, onClose, note, category }: { isOpen: boolean, onClose: () => void, note: WorkNote | null, category: GetWorkNotesCategory }) {
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  
  useEffect(() => {
    if (isOpen) setContent(note?.content || "");
  }, [isOpen, note]);

  const { mutate: create, isPending: isCreating } = useCreateWorkNote({
    mutation: { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetWorkNotesQueryKey() }); onClose(); } }
  });
  
  const { mutate: update, isPending: isUpdating } = useUpdateWorkNote({
    mutation: { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetWorkNotesQueryKey() }); onClose(); } }
  });

  const { mutate: remove, isPending: isDeleting } = useDeleteWorkNote({
    mutation: { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetWorkNotesQueryKey() }); onClose(); } }
  });

  const handleSave = () => {
    if (!content.trim()) return;
    if (note) update({ id: note.id, data: { content } });
    else create({ data: { category, content } });
  };

  const isPending = isCreating || isUpdating || isDeleting;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={note ? "ノートを編集" : "新規ノート"}>
      <div className="space-y-4">
        <Textarea 
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="内容を入力..."
          className="h-64 bg-white/50"
          autoFocus
        />
        
        <div className="flex justify-between items-center pt-2">
          {note ? (
            <Button variant="danger" size="icon" onClick={() => remove({ id: note.id })} disabled={isPending}>
              <Trash2 size={18} />
            </Button>
          ) : <div />}
          
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose} disabled={isPending}>キャンセル</Button>
            <Button onClick={handleSave} disabled={isPending || !content.trim()}>保存</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
