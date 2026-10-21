import { createFileRoute, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, Wand2 } from "lucide-react";
import { useProjectRows, useUpsertRow, useDeleteRow } from "@/lib/db";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader, EmptyState } from "@/components/page-header";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/project/$projectId/structure")({
  component: Structure,
});

const TEMPLATES: Record<string, { act: string; title: string }[]> = {
  three_act: [
    { act: "Act I", title: "Opening Image" },
    { act: "Act I", title: "Inciting Incident" },
    { act: "Act I", title: "Plot Point 1" },
    { act: "Act II", title: "Rising Action" },
    { act: "Act II", title: "Midpoint" },
    { act: "Act II", title: "Plot Point 2" },
    { act: "Act III", title: "Climax" },
    { act: "Act III", title: "Resolution" },
  ],
  save_the_cat: [
    { act: "Act I", title: "Opening Image" },
    { act: "Act I", title: "Theme Stated" },
    { act: "Act I", title: "Set-Up" },
    { act: "Act I", title: "Catalyst" },
    { act: "Act I", title: "Debate" },
    { act: "Act II", title: "Break into Two" },
    { act: "Act II", title: "B Story" },
    { act: "Act II", title: "Fun and Games" },
    { act: "Act II", title: "Midpoint" },
    { act: "Act II", title: "Bad Guys Close In" },
    { act: "Act II", title: "All Is Lost" },
    { act: "Act II", title: "Dark Night of the Soul" },
    { act: "Act III", title: "Break into Three" },
    { act: "Act III", title: "Finale" },
    { act: "Act III", title: "Final Image" },
  ],
  heros_journey: [
    { act: "Departure", title: "Ordinary World" },
    { act: "Departure", title: "Call to Adventure" },
    { act: "Departure", title: "Refusal of the Call" },
    { act: "Departure", title: "Meeting the Mentor" },
    { act: "Departure", title: "Crossing the Threshold" },
    { act: "Initiation", title: "Tests, Allies, Enemies" },
    { act: "Initiation", title: "Approach to the Inmost Cave" },
    { act: "Initiation", title: "The Ordeal" },
    { act: "Initiation", title: "The Reward" },
    { act: "Return", title: "The Road Back" },
    { act: "Return", title: "The Resurrection" },
    { act: "Return", title: "Return with the Elixir" },
  ],
  custom: [],
};

const STRUCTURE_LABELS: Record<string, string> = {
  three_act: "Three Act Structure",
  save_the_cat: "Save the Cat",
  heros_journey: "Hero's Journey",
  custom: "Custom",
};

function Structure() {
  const { projectId } = useParams({ from: "/_authenticated/project/$projectId/structure" });
  const qc = useQueryClient();
  const { data: beats = [], isLoading } = useProjectRows("story_beats", projectId, {
    column: "position",
    ascending: true,
  });
  const upsert = useUpsertRow("story_beats", projectId);
  const del = useDeleteRow("story_beats", projectId);
  const [editing, setEditing] = useState<any | null>(null);
  const [structureType, setStructureType] = useState("three_act");

  const seed = async () => {
    const tpl = TEMPLATES[structureType];
    if (!tpl.length) {
      toast.info("Custom structure — add beats manually.");
      return;
    }
    const { data: u } = await supabase.auth.getUser();
    const rows = tpl.map((b, i) => ({
      user_id: u.user!.id,
      project_id: projectId,
      structure_type: structureType,
      act: b.act,
      title: b.title,
      position: i,
    }));
    const { error } = await (supabase as any).from("story_beats").insert(rows);
    if (error) {
      toast.error(error.message);
      return;
    }
    qc.invalidateQueries({ queryKey: ["story_beats", projectId] });
    toast.success(`${STRUCTURE_LABELS[structureType]} added`);
  };

  const move = async (index: number, dir: -1 | 1) => {
    const a = beats[index] as any;
    const b = beats[index + dir] as any;
    if (!a || !b) return;
    await (supabase as any).from("story_beats").update({ position: b.position }).eq("id", a.id);
    await (supabase as any).from("story_beats").update({ position: a.position }).eq("id", b.id);
    qc.invalidateQueries({ queryKey: ["story_beats", projectId] });
  };

  const blank = () => ({
    structure_type: structureType,
    act: "",
    title: "",
    description: "",
    notes: "",
    position: beats.length,
  });

  return (
    <div>
      <PageHeader
        title="Story Structure"
        description="Build and track your story beats."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Select value={structureType} onValueChange={setStructureType}>
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(STRUCTURE_LABELS).map((k) => (
                  <SelectItem key={k} value={k}>
                    {STRUCTURE_LABELS[k]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={seed}>
              <Wand2 className="mr-1 h-4 w-4" />
              Apply Template
            </Button>
            <Button size="sm" onClick={() => setEditing(blank())}>
              <Plus className="mr-1 h-4 w-4" />
              Add Beat
            </Button>
          </div>
        }
      />
      <div className="p-6">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : beats.length === 0 ? (
          <EmptyState
            title="No beats yet"
            description="Apply a structure template or add beats manually."
            action={
              <Button onClick={seed}>
                <Wand2 className="mr-1 h-4 w-4" />
                Apply Template
              </Button>
            }
          />
        ) : (
          <div className="mx-auto max-w-3xl space-y-2">
            {beats.map((b: any, i: number) => (
              <div
                key={b.id}
                className="group flex items-start gap-3 rounded-xl border border-border bg-card p-4"
              >
                <div className="flex flex-col gap-1 pt-0.5">
                  <button
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    className="rounded p-0.5 hover:bg-accent disabled:opacity-30"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => move(i, 1)}
                    disabled={i === beats.length - 1}
                    className="rounded p-0.5 hover:bg-accent disabled:opacity-30"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {b.act && <Badge variant="secondary">{b.act}</Badge>}
                    <span className="font-semibold">{b.title}</span>
                  </div>
                  {b.description && (
                    <p className="mt-1 text-sm text-muted-foreground">{b.description}</p>
                  )}
                  {b.notes && <p className="mt-1 text-xs italic text-primary/80">{b.notes}</p>}
                </div>
                <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button onClick={() => setEditing(b)} className="rounded p-1 hover:bg-accent">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Delete beat?")) del.mutate(b.id);
                    }}
                    className="rounded p-1 text-destructive hover:bg-accent"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit Beat" : "New Beat"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="grid gap-3">
              <div className="grid gap-1.5">
                <Label>Act / Section</Label>
                <Input
                  value={editing.act ?? ""}
                  onChange={(e) => setEditing({ ...editing, act: e.target.value })}
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Title</Label>
                <Input
                  value={editing.title ?? ""}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Description</Label>
                <Textarea
                  rows={3}
                  value={editing.description ?? ""}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Notes (theme, character arc)</Label>
                <Textarea
                  rows={2}
                  value={editing.notes ?? ""}
                  onChange={(e) => setEditing({ ...editing, notes: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => upsert.mutate(editing, { onSuccess: () => setEditing(null) })}
              disabled={upsert.isPending}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
