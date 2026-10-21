import { createFileRoute, useParams } from "@tanstack/react-router";
import { useState } from "react";
import {
  FileDown,
  FileText,
  Network,
  ClipboardList,
  CalendarRange,
  Clapperboard,
  Package,
  Shirt,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useProject } from "@/lib/use-project";
import { ExportManager } from "@/lib/export-manager";
import { blankScript, type ScriptElement } from "@/lib/screenplay";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/project/$projectId/export")({
  component: ExportCenter,
});

function ExportCenter() {
  const { projectId } = useParams({ from: "/_authenticated/project/$projectId/export" });
  const { data: project } = useProject(projectId);
  const [busy, setBusy] = useState<string | null>(null);

  const fetchTable = async (table: string, order = "created_at") => {
    const { data } = await (supabase as any)
      .from(table)
      .select("*")
      .eq("project_id", projectId)
      .order(order, { ascending: true });
    return data ?? [];
  };

  const logExport = async (type: string, name: string) => {
    const { data: u } = await supabase.auth.getUser();
    await supabase
      .from("export_history")
      .insert({ user_id: u.user!.id, project_id: projectId, export_type: type, file_name: name });
  };

  const run = async (key: string, fn: () => Promise<void>) => {
    setBusy(key);
    try {
      await fn();
      toast.success("PDF exported");
    } catch (e: any) {
      toast.error(e?.message ?? "Export failed");
    } finally {
      setBusy(null);
    }
  };

  const title = project?.title || "Project";

  const actions = [
    {
      key: "script",
      icon: FileText,
      label: "Script PDF",
      desc: "Industry-formatted screenplay",
      run: async () => {
        const { data } = await supabase
          .from("scripts")
          .select("*")
          .eq("project_id", projectId)
          .limit(1)
          .maybeSingle();
        const elements = (Array.isArray(data?.content)
          ? data!.content
          : blankScript()) as unknown as ScriptElement[];
        ExportManager.exportScriptPDF({ title, author: project?.author || undefined, elements });
        await logExport("script", `${title}.pdf`);
      },
    },
    {
      key: "structure",
      icon: Network,
      label: "Story Structure PDF",
      desc: "Beats and acts",
      run: async () => {
        ExportManager.exportStoryStructurePDF(title, await fetchTable("story_beats", "position"));
        await logExport("structure", `${title}-structure.pdf`);
      },
    },
    {
      key: "schedule",
      icon: CalendarRange,
      label: "Schedule PDF",
      desc: "Shooting stripboard",
      run: async () => {
        ExportManager.exportSchedulePDF(title, await fetchTable("shooting_schedule", "position"));
        await logExport("schedule", `${title}-schedule.pdf`);
      },
    },
    {
      key: "storyboard",
      icon: Clapperboard,
      label: "Storyboard PDF",
      desc: "Shot list",
      run: async () => {
        ExportManager.exportStoryboardPDF(title, await fetchTable("storyboards", "position"));
        await logExport("storyboard", `${title}-storyboard.pdf`);
      },
    },
    {
      key: "costumes",
      icon: Shirt,
      label: "Costume & Dress PDF",
      desc: "Wardrobe department list",
      run: async () => {
        ExportManager.exportCostumesPDF(title, await fetchTable("costumes"));
        await logExport("costumes", `${title}-costumes.pdf`);
      },
    },
    {
      key: "callsheet",
      icon: ClipboardList,
      label: "Call Sheets PDF",
      desc: "First call sheet",
      run: async () => {
        const sheets = await fetchTable("call_sheets");
        if (!sheets.length) {
          toast.info("No call sheets to export");
          return;
        }
        ExportManager.exportCallSheetPDF(sheets[0]);
        await logExport("callsheet", `${title}-callsheet.pdf`);
      },
    },
  ];

  const exportFull = async () => {
    const [scriptRow, beats, characters, locations, props, storyboards, callSheets, schedule] =
      await Promise.all([
        supabase
          .from("scripts")
          .select("*")
          .eq("project_id", projectId)
          .limit(1)
          .maybeSingle()
          .then((r) => r.data),
        fetchTable("story_beats", "position"),
        fetchTable("characters"),
        fetchTable("locations"),
        fetchTable("props_costumes"),
        fetchTable("storyboards", "position"),
        fetchTable("call_sheets"),
        fetchTable("shooting_schedule", "position"),
      ]);
    ExportManager.exportFullProjectPDF({
      project: project!,
      script: {
        title,
        author: project?.author || undefined,
        elements: (Array.isArray(scriptRow?.content)
          ? scriptRow!.content
          : blankScript()) as unknown as ScriptElement[],
      },
      beats,
      characters,
      locations,
      props,
      storyboards,
      callSheets,
      schedule,
    });
    await logExport("full", `${title}-full-project.pdf`);
  };

  return (
    <div>
      <PageHeader
        title="Export Center"
        description="Generate professional PDF documents for your production."
      />
      <div className="p-6">
        <button
          onClick={() => run("full", exportFull)}
          disabled={busy === "full"}
          className="mb-6 flex w-full items-center gap-4 rounded-xl border border-primary/40 bg-primary/10 p-6 text-left transition-colors hover:bg-primary/15 disabled:opacity-60"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <FileDown className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold">Full Project Package</h3>
            <p className="text-sm text-muted-foreground">
              Cover page, table of contents, and every section in one PDF.
            </p>
          </div>
          <Button className="ml-auto" disabled={busy === "full"}>
            {busy === "full" ? "Generating…" : "Export"}
          </Button>
        </button>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {actions.map((a) => (
            <div key={a.key} className="flex flex-col rounded-xl border border-border bg-card p-5">
              <a.icon className="mb-3 h-6 w-6 text-primary" />
              <h3 className="font-semibold">{a.label}</h3>
              <p className="mb-4 flex-1 text-sm text-muted-foreground">{a.desc}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => run(a.key, a.run)}
                disabled={busy === a.key}
              >
                {busy === a.key ? "Generating…" : "Export PDF"}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
