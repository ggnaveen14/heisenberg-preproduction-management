import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { Clapperboard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) throw redirect({ to: "/dashboard" });
  },
  component: AuthPage,
  head: () => ({
    meta: [
      { title: "Sign In — Heisenberg Pre-Production" },
      { name: "description", content: "Sign in to your Heisenberg filmmaking workspace." },
    ],
  }),
});

function AuthPage() {
  const [loading, setLoading] = useState(false);

  const signIn = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: { prompt: "select_account" },
        },
      });
      if (error) {
        toast.error(error.message || "Sign in failed. Please try again.");
        setLoading(false);
        return;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign in failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-2xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Clapperboard className="h-7 w-7" />
          </div>
          <h1 className="font-mono text-xl font-bold tracking-tight">HEISENBERG</h1>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Pre-Production Management
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Your complete filmmaking workspace — from story to set.
          </p>
        </div>
        <Button onClick={signIn} disabled={loading} className="w-full" size="lg">
          {loading ? "Connecting…" : "Continue with Google"}
        </Button>
        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          Secure sign-in. We never post on your behalf.
        </p>
      </div>
    </div>
  );
}
