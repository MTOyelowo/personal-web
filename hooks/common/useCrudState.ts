import { useState, useCallback } from "react";

interface UseCrudStateConfig<TItem, TForm> {
  items: TItem[] | undefined;
  emptyForm: TForm;
  itemToForm: (item: TItem) => TForm;
  getId: (item: TItem) => string;
}

export function useCrudState<TItem, TForm>({
  items,
  emptyForm,
  itemToForm,
  getId,
}: UseCrudStateConfig<TItem, TForm>) {
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [form, setForm] = useState<TForm>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    label: string;
  } | null>(null);

  const startNew = useCallback(() => {
    setEditing("new");
    setForm(emptyForm);
  }, [emptyForm]);

  const startEdit = useCallback(
    (id: string) => {
      const item = items?.find((i) => getId(i) === id);
      if (!item) return;
      setEditing(id);
      setForm(itemToForm(item));
    },
    [items, getId, itemToForm],
  );

  const cancelEdit = useCallback(() => {
    setEditing(null);
    setForm(emptyForm);
  }, [emptyForm]);

  const isNew = editing === "new";

  return {
    editing,
    isNew,
    form,
    setForm,
    deleteTarget,
    setDeleteTarget,
    startNew,
    startEdit,
    cancelEdit,
  };
}
