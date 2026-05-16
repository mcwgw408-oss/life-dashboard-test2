import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { 
  useGetClients, useCreateClient, useUpdateClient, useDeleteClient, getGetClientsQueryKey,
  type Client
} from "@workspace/api-client-react";
import { Card, Input, Button, Textarea, Select, PageHeader, Modal, cn } from "@/components/ui-elements";
import { Users, Plus, ChevronRight, User, Trash2 } from "lucide-react";

const STATUSES = ["進行中", "提案中", "終了"];

export default function Consulting() {
  const { data: clients = [] } = useGetClients();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const handleAdd = () => {
    setEditingClient(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <PageHeader title="コンサルティング" icon={Users} />
        <Button onClick={handleAdd} className="shadow-lg shadow-primary/20"><Plus size={18} /> クライアント追加</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground opacity-50">
            クライアントはまだ登録されていません
          </div>
        ) : (
          clients.map(client => (
            <ClientCard key={client.id} client={client} onClick={() => { setEditingClient(client); setIsModalOpen(true); }} />
          ))
        )}
      </div>

      <ClientModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        client={editingClient} 
      />
    </div>
  );
}

function ClientCard({ client, onClick }: { client: Client, onClick: () => void }) {
  const statusColors: Record<string, string> = {
    "進行中": "bg-emerald-100 text-emerald-700 border-emerald-200",
    "提案中": "bg-blue-100 text-blue-700 border-blue-200",
    "終了": "bg-gray-100 text-gray-600 border-gray-200"
  };
  const colorClass = statusColors[client.status || ""] || statusColors["進行中"];

  return (
    <Card onClick={onClick} className="flex flex-col h-full group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <User size={20} />
          </div>
          <h3 className="font-bold text-lg">{client.name}</h3>
        </div>
        {client.status && (
          <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium border", colorClass)}>
            {client.status}
          </span>
        )}
      </div>
      
      <div className="space-y-3 flex-1">
        {client.topic && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">相談内容</p>
            <p className="text-sm line-clamp-2">{client.topic}</p>
          </div>
        )}
        {client.nextAction && (
          <div className="bg-accent/10 p-3 rounded-xl border border-accent/20">
            <p className="text-xs text-accent-foreground/70 mb-1 font-bold">次のアクション</p>
            <p className="text-sm text-accent-foreground">{client.nextAction}</p>
          </div>
        )}
      </div>
      
      <div className="mt-4 pt-3 border-t flex justify-end">
        <span className="text-primary text-sm flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          詳細を見る <ChevronRight size={16} />
        </span>
      </div>
    </Card>
  );
}

function ClientModal({ isOpen, onClose, client }: { isOpen: boolean, onClose: () => void, client: Client | null }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Partial<Client>>({});
  
  useEffect(() => {
    if (isOpen) {
      setFormData(client || { status: "進行中" });
    }
  }, [isOpen, client]);

  const { mutate: create, isPending: isCreating } = useCreateClient({
    mutation: { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetClientsQueryKey() }); onClose(); } }
  });
  
  const { mutate: update, isPending: isUpdating } = useUpdateClient({
    mutation: { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetClientsQueryKey() }); onClose(); } }
  });

  const { mutate: remove, isPending: isDeleting } = useDeleteClient({
    mutation: { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetClientsQueryKey() }); onClose(); } }
  });

  const handleSave = () => {
    if (!formData.name) return;
    if (client) update({ id: client.id, data: formData as any });
    else create({ data: formData as any });
  };

  const isPending = isCreating || isUpdating || isDeleting;
  const updateField = (field: keyof Client, value: string) => setFormData(prev => ({ ...prev, [field]: value }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={client ? "クライアント情報" : "新規クライアント"}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <label className="text-sm font-medium text-muted-foreground ml-1">名前 *</label>
            <Input value={formData.name || ""} onChange={e => updateField("name", e.target.value)} className="mt-1 bg-white" />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="text-sm font-medium text-muted-foreground ml-1">ステータス</label>
            <Select value={formData.status || ""} onChange={e => updateField("status", e.target.value)} className="mt-1 bg-white">
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </Select>
          </div>
        </div>
        
        <div>
          <label className="text-sm font-medium text-muted-foreground ml-1">相談内容</label>
          <Textarea value={formData.topic || ""} onChange={e => updateField("topic", e.target.value)} className="mt-1 bg-white" rows={2} />
        </div>
        
        <div>
          <label className="text-sm font-medium text-muted-foreground ml-1">提案内容</label>
          <Textarea value={formData.proposal || ""} onChange={e => updateField("proposal", e.target.value)} className="mt-1 bg-white" rows={2} />
        </div>
        
        <div>
          <label className="text-sm font-medium text-accent-foreground ml-1">次のアクション</label>
          <Input value={formData.nextAction || ""} onChange={e => updateField("nextAction", e.target.value)} className="mt-1 bg-accent/5 border-accent/20 focus:ring-accent/30" />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground ml-1">報酬メモ</label>
            <Input value={formData.feeMemo || ""} onChange={e => updateField("feeMemo", e.target.value)} className="mt-1 bg-white" />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground ml-1">備考</label>
            <Input value={formData.notes || ""} onChange={e => updateField("notes", e.target.value)} className="mt-1 bg-white" />
          </div>
        </div>
        
        <div className="flex justify-between items-center pt-4 border-t mt-4">
          {client ? (
            <Button variant="danger" size="icon" onClick={() => remove({ id: client.id })} disabled={isPending}>
              <Trash2 size={18} />
            </Button>
          ) : <div />}
          
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose} disabled={isPending}>キャンセル</Button>
            <Button onClick={handleSave} disabled={isPending || !formData.name}>保存</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
