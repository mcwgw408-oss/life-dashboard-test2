import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { 
  useGetDailyMemo, useUpsertDailyMemo, getGetDailyMemoQueryKey,
  useGetShoppingItems, useCreateShoppingItem, useUpdateShoppingItem, useDeleteShoppingItem, getGetShoppingItemsQueryKey
} from "@workspace/api-client-react";
import { Card, Input, Button, Checkbox, Textarea, PageHeader } from "@/components/ui-elements";
import { Calendar, Plus, Trash2, ShoppingCart } from "lucide-react";

export default function Daily() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader title="日課" icon={Calendar} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DailyMemoSection />
        <ShoppingListSection />
      </div>
    </div>
  );
}

function DailyMemoSection() {
  const queryClient = useQueryClient();
  const { data: memo } = useGetDailyMemo();
  const { mutate, isPending } = useUpsertDailyMemo({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetDailyMemoQueryKey() }) }
  });
  
  const [content, setContent] = useState("");
  useEffect(() => { if (memo) setContent(memo.content); }, [memo]);

  return (
    <Card className="flex flex-col h-[500px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <div className="w-2 h-6 bg-secondary rounded-full" />
          日課メモ
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
        className="flex-1 bg-white/50 border-transparent shadow-inner focus:bg-white leading-relaxed"
        placeholder="ルーティンや日記などを書き込めます..."
      />
    </Card>
  );
}

function ShoppingListSection() {
  const queryClient = useQueryClient();
  const { data: items = [], isLoading } = useGetShoppingItems();
  const [newItem, setNewItem] = useState("");

  const { mutate: create } = useCreateShoppingItem({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetShoppingItemsQueryKey() }) }
  });
  const { mutate: update } = useUpdateShoppingItem({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetShoppingItemsQueryKey() }) }
  });
  const { mutate: remove } = useDeleteShoppingItem({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetShoppingItemsQueryKey() }) }
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    create({ data: { text: newItem } });
    setNewItem("");
  };

  return (
    <Card className="flex flex-col h-[500px]">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <ShoppingCart size={20} className="text-primary" />
        買い物リスト
      </h3>
      
      <div className="flex-1 overflow-y-auto space-y-2 mb-4 pr-2">
        {isLoading ? (
          <div className="animate-pulse space-y-2">
            {[1,2,3].map(i => <div key={i} className="h-12 bg-muted/50 rounded-xl" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-2 opacity-50">
            <ShoppingCart size={48} strokeWidth={1} />
            <p className="text-sm">買い物リストは空です</p>
          </div>
        ) : (
          items.map(item => (
            <div key={item.id} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-muted/30 transition-colors group bg-white/40">
              <Checkbox 
                checked={item.bought} 
                onChange={(bought) => update({ id: item.id, data: { bought } })} 
              />
              <span className={`flex-1 ${item.bought ? "line-through text-muted-foreground" : "text-foreground"}`}>
                {item.text}
              </span>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => remove({ id: item.id })}
                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-500 hover:bg-red-50 h-8 w-8"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleAdd} className="flex gap-2 mt-auto">
        <Input 
          value={newItem} 
          onChange={e => setNewItem(e.target.value)} 
          placeholder="買うものを追加..." 
          className="bg-white"
        />
        <Button type="submit" size="icon" disabled={!newItem.trim()} className="shrink-0 aspect-square rounded-2xl">
          <Plus size={20} />
        </Button>
      </form>
    </Card>
  );
}
