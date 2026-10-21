import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import {
  FileText,
  Network,
  Users,
  MapPin,
  Package,
  Clapperboard,
  ClipboardList,
  CalendarRange,
  StickyNote,
  Download,
} from "lucide-react";
import { useProject } from "@/lib/use-project";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/project/$projectId/")({
  component: Overview,
});

const tiles = (pid: string) => [
  {
    title: "Script Writer",
    to: `/project/${pid}/script`,
    icon: FileText,
    desc: "Write & format your screenplay",
  },
  {
    title: "Story Structure",
    to: `/project/${pid}/structure`,
    icon: Network,
    desc: "Build your beat board",
  },
  {
    title: "Characters",
    to: `/project/${pid}/characters`,
    icon: Users,
    desc: "Cast & character development",
  },
  {
    title: "Locations",
    to: `/project/${pid}/locations`,
    icon: MapPin,
    desc: "Scout & manage locations",
  },
  {
    title: "Props & Costumes",
    to: `/project/${pid}/props`,
    icon: Package,
    desc: "Track every item",
  },
  {
    title: "Storyboard",
    to: `/project/${pid}/storyboard`,
    icon: Clapperboard,
    desc: "Visualize your shots",
  },
  {
    title: "Call Sheets",
    to: `/project/${pid}/callsheets`,
    icon: ClipboardList,
    desc: "Daily production sheets",
  },
  {
    title: "Schedule",
    to: `/project/${pid}/schedule`,
    icon: CalendarRange,
    desc: "Stripboard scheduling",
  },
  { title: "Notes", to: `/project/${pid}/notes`, icon: StickyNote, desc: "Production notes" },
  { title: "Export", to: `/project/${pid}/export`, icon: Download, desc: "PDF export center" },
];

function Overview() {
  const { projectId } = useParams({ from: "/_authenticated/project/$projectId/" });
  const { data: project } = useProject(projectId);

  return (
    <div>
      <PageHeader
        title={project?.title || "Project"}
        description={project?.logline || undefined}
        actions={
          <div className="flex items-center gap-2">
            {project?.status && <Badge variant="secondary">{project.status}</Badge>}
            {project?.genre && <Badge variant="outline">{project.genre}</Badge>}
            {project?.version && <Badge variant="outline">v{project.version}</Badge>}
          </div>
        }
      />
      <div className="p-6">
        {project?.synopsis && (
          <div className="mb-6 rounded-xl border border-border bg-card p-5">
            <h3 className="mb-1 text-sm font-semibold">Synopsis</h3>
            <p className="text-sm text-muted-foreground">{project.synopsis}</p>
          </div>
        )}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tiles(projectId).map((t) => (
            <Link
              key={t.title}
              to={t.to}
              className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/50"
            >
              <t.icon className="mb-3 h-6 w-6 text-primary" />
              <h3 className="font-semibold">{t.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
