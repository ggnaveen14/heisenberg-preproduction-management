import { createFileRoute, useParams } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Save,
  Download,
  Upload,
  FileDown,
  Search as SearchIcon,
  Maximize2,
  Minimize2,
  Check,
  Loader2,
  Bold,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useProject } from "@/lib/use-project";
import {
  type ScriptElement,
  type ElementType,
  ELEMENT_LABELS,
  nextTabType,
  nextEnterType,
  emptyElement,
  blankScript,
  toFountain,
  fromFountain,
  extractSceneHeadings,
} from "@/lib/screenplay";
import { ExportManager } from "@/lib/export-manager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

// ---- Rich text (bold) helpers: store markdown-style **bold**, render real bold ----
function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function markdownToHtml(md: string): string {
  const re = /\*\*([\s\S]+?)\*\*/g;
  let html = "";
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(md))) {
    html += escapeHtml(md.slice(last, m.index));
    html += `<strong>${escapeHtml(m[1])}</strong>`;
    last = m.index + m[0].length;
  }
  html += escapeHtml(md.slice(last));
  return html;
}
function htmlToMarkdown(node: Node): string {
  let out = "";
  node.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      out += child.textContent || "";
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const el = child as HTMLElement;
      if (el.tagName === "BR") {
        out += "\n";
        return;
      }
      const inner = htmlToMarkdown(el);
      const fw = el.style?.fontWeight;
      const bold =
        el.tagName === "B" || el.tagName === "STRONG" || fw === "bold" || Number(fw) >= 600;
      out += bold && inner ? `**${inner}**` : inner;
    }
  });
  return out;
}

function RichLine({
  value,
  placeholder,
  className,
  inputRef,
  onChange,
  onKeyDown,
}: {
  value: string;
  placeholder: string;
  className: string;
  inputRef: (el: HTMLDivElement | null) => void;
  onChange: (md: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (htmlToMarkdown(node) !== value) node.innerHTML = markdownToHtml(value);
  }, [value]);
  return (
    <div
      ref={(r) => {
        ref.current = r;
        inputRef(r);
      }}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      data-placeholder={placeholder}
      className={className}
      onInput={() => {
        if (ref.current) onChange(htmlToMarkdown(ref.current));
      }}
      onKeyDown={onKeyDown}
    />
  );
}

export const Route = createFileRoute("/_authenticated/project/$projectId/script")({
  component: ScriptWriter,
});

function ScriptWriter() {
  const { projectId } = useParams({ from: "/_authenticated/project/$projectId/script" });
  const qc = useQueryClient();
  const { data: project } = useProject(projectId);

  const [scriptId, setScriptId] = useState<string | null>(null);
  const [elements, setElements] = useState<ScriptElement[]>(blankScript());
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [typewriter, setTypewriter] = useState(false);
  const [find, setFind] = useState("");
  const [replace, setReplace] = useState("");
  const [showFind, setShowFind] = useState(false);

  const refs = useRef<Record<string, HTMLDivElement | null>>({});

  // Load or create the project's script.
  const { isLoading } = useQuery({
    queryKey: ["script", projectId],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      let { data } = await supabase
        .from("scripts")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at")
        .limit(1)
        .maybeSingle();
      if (!data) {
        const { data: created, error } = await supabase
          .from("scripts")
          .insert({
            user_id: u.user!.id,
            project_id: projectId,
            title: project?.title || "Untitled Script",
            content: blankScript() as any,
          })
          .select("*")
          .single();
        if (error) throw error;
        data = created;
      }
      setScriptId(data.id);
      const content = data.content as any as ScriptElement[];
      setElements(Array.isArray(content) && content.length ? content : blankScript());
      setLastSaved(new Date(data.updated_at));
      return data;
    },
  });

  const save = useCallback(
    async (silent = false) => {
      if (!scriptId) return;
      setSaving(true);
      const { error } = await supabase
        .from("scripts")
        .update({ content: elements as any })
        .eq("id", scriptId);
      setSaving(false);
      if (error) {
        if (!silent) toast.error("Save failed");
        return;
      }
      setDirty(false);
      setLastSaved(new Date());
      qc.invalidateQueries({ queryKey: ["script", projectId] });
    },
    [scriptId, elements, projectId, qc],
  );

  // Autosave every 5 seconds when dirty.
  useEffect(() => {
    if (!dirty) return;
    const t = setInterval(() => void save(true), 5000);
    return () => clearInterval(t);
  }, [dirty, save]);

  // Focus the requested line, caret at end.
  useEffect(() => {
    if (focusId && refs.current[focusId]) {
      const el = refs.current[focusId]!;
      el.focus();
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
      setFocusId(null);
    }
  }, [focusId, elements]);

  const update = (id: string, patch: Partial<ScriptElement>) => {
    setElements((els) => els.map((e) => (e.id === id ? { ...e, ...patch } : e)));
    setDirty(true);
  };

  const setType = (id: string, type: ElementType) => update(id, { type });

  const addAfter = (id: string, type: ElementType) => {
    const el = emptyElement(type);
    setElements((els) => {
      const i = els.findIndex((e) => e.id === id);
      const copy = [...els];
      copy.splice(i + 1, 0, el);
      return copy;
    });
    setDirty(true);
    setFocusId(el.id);
  };

  const removeAt = (id: string) => {
    setElements((els) => {
      if (els.length === 1) return els;
      const i = els.findIndex((e) => e.id === id);
      const prev = els[i - 1];
      const copy = els.filter((e) => e.id !== id);
      if (prev) setFocusId(prev.id);
      return copy;
    });
    setDirty(true);
  };

  const toggleBold = (node: HTMLDivElement, el: ScriptElement) => {
    node.focus();
    // Native rich-text bold toggle on the contentEditable line.
    document.execCommand("bold");
    update(el.id, { text: htmlToMarkdown(node) });
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, el: ScriptElement) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === "b" || e.key === "B")) {
      e.preventDefault();
      toggleBold(e.currentTarget, el);
      return;
    }
    if (e.key === "Tab") {
      e.preventDefault();
      setType(el.id, nextTabType(el.type));
      return;
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      addAfter(el.id, nextEnterType(el.type));
      return;
    }
    if (e.key === "Backspace" && el.text === "") {
      const i = elements.findIndex((x) => x.id === el.id);
      if (i > 0) {
        e.preventDefault();
        removeAt(el.id);
      }
    }
  };

  const doReplaceAll = () => {
    if (!find) return;
    let count = 0;
    setElements((els) =>
      els.map((e) => {
        if (e.text.includes(find)) {
          count += e.text.split(find).length - 1;
          return { ...e, text: e.text.split(find).join(replace) };
        }
        return e;
      }),
    );
    setDirty(true);
    toast.success(`Replaced ${count} occurrence(s)`);
  };

  const importFountain = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setElements(fromFountain(String(reader.result)));
      setDirty(true);
      toast.success("Fountain imported");
    };
    reader.readAsText(file);
  };

  const exportFountain = () => {
    const blob = new Blob([toFountain(elements)], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project?.title || "script"}.fountain`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const scenes = extractSceneHeadings(elements);
  const lowerFind = find.toLowerCase();

  if (isLoading) return <div className="p-6 text-sm text-muted-foreground">Loading script…</div>;

  return (
    <div
      className={
        fullscreen
          ? "fixed inset-0 z-50 flex flex-col bg-background"
          : "flex h-[calc(100vh-3rem)] flex-col"
      }
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-card px-4 py-2">
        <span className="font-mono text-sm font-semibold">{project?.title || "Script"}</span>
        <div className="ml-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          {saving ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…
            </>
          ) : dirty ? (
            <span className="text-warning">Unsaved changes</span>
          ) : (
            <>
              <Check className="h-3.5 w-3.5 text-success" /> Saved{" "}
              {lastSaved
                ? `· ${lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                : ""}
            </>
          )}
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            title="Bold (Ctrl/⌘+B)"
            onMouseDown={(e) => {
              e.preventDefault();
              const node = document.activeElement as HTMLDivElement | null;
              const id = node && Object.keys(refs.current).find((k) => refs.current[k] === node);
              const el = id ? elements.find((x) => x.id === id) : null;
              if (node && el) toggleBold(node, el);
            }}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowFind((s) => !s)}>
            <SearchIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTypewriter((t) => !t)}
            className={typewriter ? "text-primary" : ""}
          >
            Typewriter
          </Button>
          <label className="inline-flex cursor-pointer items-center rounded-md px-2 py-1.5 text-sm hover:bg-accent">
            <Upload className="mr-1 h-4 w-4" />
            Import
            <input
              type="file"
              accept=".fountain,.txt"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && importFountain(e.target.files[0])}
            />
          </label>
          <Button variant="ghost" size="sm" onClick={exportFountain}>
            <Download className="mr-1 h-4 w-4" />
            Fountain
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              ExportManager.exportScriptPDF({
                title: project?.title || "Script",
                author: project?.author || undefined,
                elements,
              })
            }
          >
            <FileDown className="mr-1 h-4 w-4" />
            PDF
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setFullscreen((f) => !f)}>
            {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          <Button size="sm" onClick={() => save()}>
            <Save className="mr-1 h-4 w-4" />
            Save
          </Button>
        </div>
      </div>

      {showFind && (
        <div className="flex flex-wrap items-center gap-2 border-b border-border bg-card/60 px-4 py-2">
          <Input
            placeholder="Find"
            value={find}
            onChange={(e) => setFind(e.target.value)}
            className="h-8 w-40"
          />
          <Input
            placeholder="Replace"
            value={replace}
            onChange={(e) => setReplace(e.target.value)}
            className="h-8 w-40"
          />
          <Button size="sm" variant="outline" onClick={doReplaceAll}>
            Replace All
          </Button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Scene navigator */}
        <aside className="hidden w-56 shrink-0 overflow-y-auto border-r border-border bg-card/40 p-3 md:block">
          <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Scenes ({scenes.length})
          </p>
          <div className="space-y-0.5">
            {scenes.map((s, i) => (
              <button
                key={s.id}
                onClick={() => {
                  refs.current[s.id]?.scrollIntoView({ behavior: "smooth", block: "center" });
                  refs.current[s.id]?.focus();
                }}
                className="block w-full truncate rounded px-2 py-1.5 text-left text-xs hover:bg-accent"
              >
                <span className="text-muted-foreground">{i + 1}.</span> {s.text}
              </button>
            ))}
            {scenes.length === 0 && (
              <p className="px-1 text-xs text-muted-foreground">No scenes yet</p>
            )}
          </div>
        </aside>

        {/* Editor */}
        <div
          className={`flex-1 overflow-y-auto bg-[oklch(0.1_0.01_240)] py-8 ${typewriter ? "[&_.screenplay-page]:py-[40vh]" : ""}`}
        >
          <div className="screenplay-page">
            {elements.map((el) => {
              const highlight = find && el.text.toLowerCase().includes(lowerFind);
              return (
                <div key={el.id} className="group relative">
                  <RichLine
                    inputRef={(r) => {
                      refs.current[el.id] = r;
                    }}
                    value={el.text}
                    onChange={(md) => update(el.id, { text: md })}
                    onKeyDown={(e) => onKeyDown(e, el)}
                    placeholder={ELEMENT_LABELS[el.type]}
                    className={`sp-line sp-${el.type} w-full border-0 bg-transparent p-0 focus:ring-0 ${highlight ? "bg-yellow-200/60" : ""}`}
                  />
                  {/* element type selector on hover */}
                  <div className="absolute -left-[1.4in] top-0 opacity-0 transition-opacity group-focus-within:opacity-100">
                    <Select value={el.type} onValueChange={(v) => setType(el.id, v as ElementType)}>
                      <SelectTrigger className="h-6 w-32 border-none bg-transparent text-[10px] text-neutral-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(ELEMENT_LABELS).map(([k, v]) => (
                          <SelectItem key={k} value={k} className="text-xs">
                            {v}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-center text-xs text-neutral-500">
            TAB cycles element type · ENTER for next element · Shift+ENTER for a line break · select
            text and press Ctrl/⌘+B to bold
          </p>
        </div>
      </div>
    </div>
  );
}
