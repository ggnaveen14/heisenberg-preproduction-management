import { createFileRoute, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil, Trash2, Download, X } from "lucide-react";
import { useProjectRows, useUpsertRow, useDeleteRow } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { PageHeader, EmptyState } from "@/components/page-header";
import { ExportManager } from "@/lib/export-manager";

export const Route = createFileRoute("/_authenticated/project/$projectId/callsheets")({
  component: CallSheets,
});

type Person = { name: string; role: string; call: string };

function PersonEditor({
  label,
  list,
  onChange,
}: {
  label: string;
  list: Person[];
  onChange: (l: Person[]) => void;
}) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onChange([...list, { name: "", role: "", call: "" }])}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
      {list.map((p, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <Input
            placeholder="Name"
            value={p.name}
            onChange={(e) =>
              onChange(list.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))
            }
          />
          <Input
            placeholder="Role"
            value={p.role}
            onChange={(e) =>
              onChange(list.map((x, j) => (j === i ? { ...x, role: e.target.value } : x)))
            }
          />
          <Input
            placeholder="Call"
            className="w-24"
            value={p.call}
            onChange={(e) =>
              onChange(list.map((x, j) => (j === i ? { ...x, call: e.target.value } : x)))
            }
          />
          <button
            type="button"
            onClick={() => onChange(list.filter((_, j) => j !== i))}
            className="rounded p-1.5 text-destructive hover:bg-accent"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

function CallSheets() {
  const { projectId } = useParams({ from: "/_authenticated/project/$projectId/callsheets" });
  const { data: sheets = [], isLoading } = useProjectRows("call_sheets", projectId);
  const upsert = useUpsertRow("call_sheets", projectId);
  const del = useDeleteRow("call_sheets", projectId);
  const [editing, setEditing] = useState<any | null>(null);

  const blank = () => ({
    title: "",
    shoot_date: "",
    location_details: "",
    shooting_notes: "",
    cast_calls: [],
    crew_calls: [],
    contacts: [],
  });

  return (
    <div>
      <PageHeader
        title="Call Sheets"
        description="Build daily call sheets for cast and crew."
        actions={
          <Button size="sm" onClick={() => setEditing(blank())}>
            <Plus className="mr-1 h-4 w-4" />
            New Call Sheet
          </Button>
        }
      />
      <div className="p-6">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : sheets.length === 0 ? (
          <EmptyState
            title="No call sheets yet"
            description="Create a call sheet for your next shoot day."
            action={
              <Button onClick={() => setEditing(blank())}>
                <Plus className="mr-1 h-4 w-4" />
                New Call Sheet
              </Button>
            }
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sheets.map((s: any) => (
              <div key={s.id} className="group rounded-xl border border-border bg-card p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{s.title}</p>
                    <p className="text-sm text-muted-foreground">{s.shoot_date || "No date"}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => ExportManager.exportCallSheetPDF(s)}
                      className="rounded p-1 hover:bg-accent"
                      title="Export PDF"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => setEditing(s)} className="rounded p-1 hover:bg-accent">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Delete?")) del.mutate(s.id);
                      }}
                      className="rounded p-1 text-destructive hover:bg-accent"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {s.cast_calls?.length ?? 0} cast · {s.crew_calls?.length ?? 0} crew
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit Call Sheet" : "New Call Sheet"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label>Title</Label>
                  <Input
                    value={editing.title}
                    onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>Shoot Date</Label>
                  <Input
                    type="date"
                    value={editing.shoot_date ?? ""}
                    onChange={(e) => setEditing({ ...editing, shoot_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label>Location Details</Label>
                <Textarea
                  rows={2}
                  value={editing.location_details ?? ""}
                  onChange={(e) => setEditing({ ...editing, location_details: e.target.value })}
                />
              </div>
              <PersonEditor
                label="Cast Call Times"
                list={editing.cast_calls ?? []}
                onChange={(l) => setEditing({ ...editing, cast_calls: l })}
              />
              <PersonEditor
                label="Crew Call Times"
                list={editing.crew_calls ?? []}
                onChange={(l) => setEditing({ ...editing, crew_calls: l })}
              />
              <div className="grid gap-1.5">
                <Label>Shooting Notes</Label>
                <Textarea
                  rows={2}
                  value={editing.shooting_notes ?? ""}
                  onChange={(e) => setEditing({ ...editing, shooting_notes: e.target.value })}
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
