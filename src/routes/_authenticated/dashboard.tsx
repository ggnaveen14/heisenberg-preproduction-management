import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, MoreVertical, Copy, Archive, Trash2, Pencil, Film } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader, EmptyState } from "@/components/page-header";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

interface Project {
  id: string;
  title: string;
  genre: string | null;
  logline: string | null;
  synopsis: string | null;
  author: string | null;
  status: string;
  version: string;
  archived: boolean;
  updated_at: string;
}

const STATUSES = ["Development", "Pre-Production", "Production", "Post-Production", "Completed"];

function Dashboard() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [showArchived, setShowArchived] = useState(false);
  const [editing, setEditing] = useState<Partial<Project> | null>(null);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data as Project[];
    },
  });

  const upsert = useMutation({
    mutationFn: async (p: Partial<Project>) => {
      const { data: u } = await supabase.auth.getUser();
      if (p.id) {
        const { error } = await supabase
          .from("projects")
          .update({
            title: p.title,
            genre: p.genre,
            logline: p.logline,
            synopsis: p.synopsis,
            author: p.author,
            status: p.status,
            version: p.version,
          })
          .eq("id", p.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("projects").insert({
          user_id: u.user!.id,
          title: p.title || "Untitled Project",
          genre: p.genre,
          logline: p.logline,
          synopsis: p.synopsis,
          author: p.author,
          status: p.status || "Development",
          version: p.version || "1.0",
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      setEditing(null);
      toast.success("Project saved");
    },
    onError: (e: any) => toast.error(e?.message ?? "Save failed"),
  });

  const duplicate = useMutation({
    mutationFn: async (p: Project) => {
      const { data: u } = await supabase.auth.getUser();
      const { error } = await supabase.from("projects").insert({
        user_id: u.user!.id,
        title: `${p.title} (Copy)`,
        genre: p.genre,
        logline: p.logline,
        synopsis: p.synopsis,
        author: p.author,
        status: p.status,
        version: p.version,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project duplicated");
    },
  });

  const toggleArchive = useMutation({
    mutationFn: async (p: Project) => {
      const { error } = await supabase
        .from("projects")
        .update({ archived: !p.archived })
        .eq("id", p.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project deleted");
    },
  });

  const visible = projects.filter((p) => p.archived === showArchived);

  return (
    <div>
      <PageHeader
        title="Projects"
        description="Create and manage your film productions."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => setShowArchived((s) => !s)}>
              {showArchived ? "Active" : "Archived"}
            </Button>
            <Button size="sm" onClick={() => setEditing({})}>
              <Plus className="mr-1 h-4 w-4" />
              New Project
            </Button>
          </>
        }
      />

      <div className="p-6">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : visible.length === 0 ? (
          <EmptyState
            title={showArchived ? "No archived projects" : "No projects yet"}
            description={
              showArchived
                ? "Archived projects will appear here."
                : "Start your first production to begin writing and planning."
            }
            action={
              !showArchived && (
                <Button onClick={() => setEditing({})}>
                  <Plus className="mr-1 h-4 w-4" />
                  New Project
                </Button>
              )
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((p) => (
              <div
                key={p.id}
                className="group flex flex-col rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/50"
              >
                <div className="flex items-start justify-between">
                  <button
                    onClick={() =>
                      navigate({ to: "/project/$projectId", params: { projectId: p.id } })
                    }
                    className="flex items-center gap-2 text-left"
                  >
                    <Film className="h-4 w-4 text-primary" />
                    <span className="font-semibold leading-tight">{p.title}</span>
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="rounded p-1 opacity-0 transition-opacity hover:bg-accent group-hover:opacity-100">
                      <MoreVertical className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditing(p)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => duplicate.mutate(p)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleArchive.mutate(p)}>
                        <Archive className="mr-2 h-4 w-4" />
                        {p.archived ? "Unarchive" : "Archive"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => {
                          if (confirm("Delete this project and all its data?")) remove.mutate(p.id);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">
                  {p.logline || "No logline yet."}
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <Badge variant="secondary">{p.status}</Badge>
                  {p.genre && <Badge variant="outline">{p.genre}</Badge>}
                  <span className="ml-auto text-[11px] text-muted-foreground">v{p.version}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit Project" : "New Project"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="grid gap-3">
              <div className="grid gap-1.5">
                <Label>Title</Label>
                <Input
                  value={editing.title ?? ""}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label>Genre</Label>
                  <Input
                    value={editing.genre ?? ""}
                    onChange={(e) => setEditing({ ...editing, genre: e.target.value })}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>Author</Label>
                  <Input
                    value={editing.author ?? ""}
                    onChange={(e) => setEditing({ ...editing, author: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label>Status</Label>
                  <Select
                    value={editing.status ?? "Development"}
                    onValueChange={(v) => setEditing({ ...editing, status: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label>Version</Label>
                  <Input
                    value={editing.version ?? "1.0"}
                    onChange={(e) => setEditing({ ...editing, version: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label>Logline</Label>
                <Textarea
                  rows={2}
                  value={editing.logline ?? ""}
                  onChange={(e) => setEditing({ ...editing, logline: e.target.value })}
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Synopsis</Label>
                <Textarea
                  rows={4}
                  value={editing.synopsis ?? ""}
                  onChange={(e) => setEditing({ ...editing, synopsis: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={() => editing && upsert.mutate(editing)} disabled={upsert.isPending}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
