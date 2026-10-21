import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Generic, project-scoped CRUD against any module table.
// Tables are addressed loosely to keep module code compact.
type AnyRow = Record<string, any>;

export function useProjectRows<T extends AnyRow = AnyRow>(
  table: string,
  projectId: string | undefined,
  orderBy: { column: string; ascending?: boolean } = { column: "created_at", ascending: false },
) {
  return useQuery({
    queryKey: [table, projectId],
    enabled: !!projectId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from(table)
        .select("*")
        .eq("project_id", projectId)
        .order(orderBy.column, { ascending: orderBy.ascending ?? false });
      if (error) throw error;
      return (data ?? []) as T[];
    },
  });
}

export function useUpsertRow(table: string, projectId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (row: AnyRow) => {
      const { data: userData } = await supabase.auth.getUser();
      const user_id = userData.user?.id;
      const payload: AnyRow = { ...row, user_id, project_id: projectId };
      if (row.id) {
        const { id, ...rest } = payload;
        const { error } = await (supabase as any).from(table).update(rest).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any).from(table).insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [table, projectId] }),
    onError: (e: any) => toast.error(e?.message ?? "Save failed"),
  });
}

export function useDeleteRow(table: string, projectId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [table, projectId] }),
    onError: (e: any) => toast.error(e?.message ?? "Delete failed"),
  });
}
