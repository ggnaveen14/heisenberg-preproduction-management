import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/search")({
  component: GlobalSearch,
});

interface Hit {
  module: string;
  label: string;
  title: string;
  subtitle?: string;
  projectId: string;
  to: string;
}

const SOURCES = [
  { table: "scripts", module: "Script", title: "title", sub: null, path: "script" },
  {
    table: "characters",
    module: "Character",
    title: "name",
    sub: "description",
    path: "characters",
  },
  { table: "locations", module: "Location", title: "name", sub: "address", path: "locations" },
  {
    table: "story_beats",
    module: "Story Beat",
    title: "title",
    sub: "description",
    path: "structure",
  },
  { table: "production_notes", module: "Note", title: "title", sub: "content", path: "notes" },
  {
    table: "storyboards",
    module: "Storyboard",
    title: "shot_description",
    sub: "camera_angle",
    path: "storyboard",
  },
  {
    table: "call_sheets",
    module: "Call Sheet",
    title: "title",
    sub: "location_details",
    path: "callsheets",
  },
] as const;

function GlobalSearch() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [searched, setSearched] = useState(false);

  const runSearch = async (term: string) => {
    if (term.trim().length < 2) {
      setHits([]);
      setSearched(false);
      return;
    }
    const results: Hit[] = [];
    await Promise.all(
      SOURCES.map(async (s) => {
        const cols = ["project_id", s.title, ...(s.sub ? [s.sub] : [])].join(",");
        const query = (supabase as any)
          .from(s.table)
          .select(cols)
          .ilike(s.title, `%${term}%`)
          .limit(20);
        const { data } = await query;
        (data ?? []).forEach((row: any) => {
          results.push({
            module: s.module,
            label: s.module,
            title: row[s.title] || "Untitled",
            subtitle: s.sub ? row[s.sub] : undefined,
            projectId: row.project_id,
            to: `/project/${row.project_id}/${s.path}`,
          });
        });
      }),
    );
    setHits(results);
    setSearched(true);
  };

  return (
    <div>
      <PageHeader
        title="Global Search"
        description="Search across scripts, characters, locations, structure, notes, storyboards and call sheets."
      />
      <div className="mx-auto max-w-2xl p-6">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            placeholder="Search everything…"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              runSearch(e.target.value);
            }}
            className="pl-9"
          />
        </div>

        <div className="mt-4 space-y-2">
          {hits.map((h, i) => (
            <button
              key={i}
              onClick={() => navigate({ to: h.to })}
              className="flex w-full items-start gap-3 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:border-primary/50"
            >
              <Badge variant="secondary" className="mt-0.5">
                {h.label}
              </Badge>
              <div className="min-w-0">
                <p className="truncate font-medium">{h.title}</p>
                {h.subtitle && (
                  <p className="truncate text-sm text-muted-foreground">{h.subtitle}</p>
                )}
              </div>
            </button>
          ))}
          {searched && hits.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No results found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
