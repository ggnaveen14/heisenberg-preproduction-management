import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, FileDown, ArrowDownAZ } from "lucide-react";
import { useProjectRows, useUpsertRow, useDeleteRow } from "@/lib/db";
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

export interface FieldDef {
  key: string;
  label: string;
  type?: "text" | "textarea" | "number" | "select" | "date";
  options?: string[];
  default?: any;
  badge?: boolean;
  full?: boolean;
}

interface Props {
  projectId: string;
  table: string;
  title: string;
  description?: string;
  fields: FieldDef[];
  titleKey: string; // field shown as the card heading
  subtitleKey?: string; // secondary text on card
  sortOptions?: { key: string; label: string }[]; // enables a "Sort by" control
  onExportPDF?: (rows: any[]) => void; // enables a PDF export button using current (sorted) order
}

export function CrudModule({
  projectId,
  table,
  title,
  description,
  fields,
  titleKey,
  subtitleKey,
  sortOptions,
  onExportPDF,
}: Props) {
  const { data: rows = [], isLoading } = useProjectRows(table, projectId);
  const upsert = useUpsertRow(table, projectId);
  const del = useDeleteRow(table, projectId);
  const [editing, setEditing] = useState<Record<string, any> | null>(null);
  const [sortBy, setSortBy] = useState<string>("");

  const blank = () => Object.fromEntries(fields.map((f) => [f.key, f.default ?? ""]));

  const displayedRows = useMemo(() => {
    if (!sortBy) return rows;
    return [...rows].sort((a: any, b: any) =>
      String(a[sortBy] ?? "").localeCompare(String(b[sortBy] ?? "")),
    );
  }, [rows, sortBy]);

  return (
    <div>
      <PageHeader
        title={title}
        description={description}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {sortOptions && sortOptions.length > 0 && (
              <Select
                value={sortBy || "none"}
                onValueChange={(v) => setSortBy(v === "none" ? "" : v)}
              >
                <SelectTrigger className="h-9 w-[170px]">
                  <ArrowDownAZ className="mr-1 h-4 w-4 shrink-0" />
                  <SelectValue placeholder="Sort by…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Default order</SelectItem>
                  {sortOptions.map((o) => (
                    <SelectItem key={o.key} value={o.key}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {onExportPDF && (
              <Button size="sm" variant="outline" onClick={() => onExportPDF(displayedRows)}>
                <FileDown className="mr-1 h-4 w-4" />
                Export PDF
              </Button>
            )}
            <Button size="sm" onClick={() => setEditing(blank())}>
              <Plus className="mr-1 h-4 w-4" />
              Add
            </Button>
          </div>
        }
      />
      <div className="p-6">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : rows.length === 0 ? (
          <EmptyState
            title={`No ${title.toLowerCase()} yet`}
            description="Add your first entry to get started."
            action={
              <Button onClick={() => setEditing(blank())}>
                <Plus className="mr-1 h-4 w-4" />
                Add
              </Button>
            }
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {displayedRows.map((row: any) => (
              <div key={row.id} className="group rounded-xl border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{row[titleKey] || "Untitled"}</p>
                    {subtitleKey && row[subtitleKey] && (
                      <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                        {row[subtitleKey]}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button onClick={() => setEditing(row)} className="rounded p-1 hover:bg-accent">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Delete this entry?")) del.mutate(row.id);
                      }}
                      className="rounded p-1 text-destructive hover:bg-accent"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {fields
                    .filter((f) => f.badge && row[f.key])
                    .map((f) => (
                      <Badge key={f.key} variant="secondary">
                        {String(row[f.key])}
                      </Badge>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? `Edit ${title}` : `New ${title}`}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="grid gap-3">
              {fields.map((f) => (
                <div key={f.key} className="grid gap-1.5">
                  <Label>{f.label}</Label>
                  {f.type === "textarea" ? (
                    <Textarea
                      rows={3}
                      value={editing[f.key] ?? ""}
                      onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })}
                    />
                  ) : f.type === "select" ? (
                    <Select
                      value={editing[f.key] ?? ""}
                      onValueChange={(v) => setEditing({ ...editing, [f.key]: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select…" />
                      </SelectTrigger>
                      <SelectContent>
                        {(f.options ?? []).map((o) => (
                          <SelectItem key={o} value={o}>
                            {o}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
                      value={editing[f.key] ?? ""}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          [f.key]: f.type === "number" ? Number(e.target.value) : e.target.value,
                        })
                      }
                    />
                  )}
                </div>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                editing && upsert.mutate(editing, { onSuccess: () => setEditing(null) })
              }
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
