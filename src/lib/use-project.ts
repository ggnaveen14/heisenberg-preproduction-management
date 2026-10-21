import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ProjectRow {
  id: string;
  title: string;
  genre: string | null;
  logline: string | null;
  synopsis: string | null;
  author: string | null;
  status: string;
  version: string;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

export function useProject(projectId: string | undefined) {
  return useQuery({
    queryKey: ["project", projectId],
    enabled: !!projectId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId!)
        .maybeSingle();
      if (error) throw error;
      return data as ProjectRow | null;
    },
  });
}
