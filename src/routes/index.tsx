import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Clapperboard, FileText, Network, CalendarRange, Users, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) throw redirect({ to: "/dashboard" });
  },
  component: Landing,
});

const features = [
  {
    icon: FileText,
    title: "Pro Screenplay Editor",
    desc: "Courier-formatted writing with TAB/ENTER workflow, scene navigator, and Fountain import/export.",
  },
  {
    icon: Network,
    title: "Story Structure",
    desc: "Three-Act, Save the Cat, Hero's Journey and custom beat boards.",
  },
  {
    icon: Users,
    title: "Cast & Crew",
    desc: "Characters, locations, props and costumes — all linked to your scenes.",
  },
  {
    icon: CalendarRange,
    title: "Schedules & Call Sheets",
    desc: "Stripboard scheduling and printable call sheets for the set.",
  },
  {
    icon: Download,
    title: "Industry PDF Export",
    desc: "Pixel-perfect screenplay and full-project package exports.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Clapperboard className="h-5 w-5" />
          </div>
          <span className="font-mono font-bold tracking-tight">HEISENBERG</span>
        </div>
        <Button asChild variant="secondary">
          <Link to="/auth">Sign In</Link>
        </Button>
      </header>

      <section className="mx-auto max-w-4xl px-6 pb-16 pt-20 text-center">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-primary">
          Pre-Production Management
        </p>
        <h1 className="text-balance text-5xl font-bold tracking-tight sm:text-6xl">
          The complete workspace for serious filmmakers.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Develop your story, write the script, build your boards, schedule the shoot, and export
          industry-standard documents — all in one cinematic, distraction-free studio.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button asChild size="lg">
            <Link to="/auth">Start your production</Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl border border-border bg-card p-6">
              <f.icon className="mb-3 h-6 w-6 text-primary" />
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
