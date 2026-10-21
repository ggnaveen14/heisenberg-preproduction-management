import { createFileRoute, useParams } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { UserPlus, Trash2, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, EmptyState } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/project/$projectId/team")({
  component: Team,
});

const ROLES = ["assistant_director", "producer", "director", "writer", "admin"] as const;
const roleLabel = (r: string) => r.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

interface Member {
  id: string;
  invited_email: string;
  role: string;
  status: string;
  member_user_id: string | null;
  created_at: string;
}

function Team() {
  const { projectId } = useParams({ from: "/_authenticated/project/$projectId/team" });
  const qc = useQueryClient();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>("assistant_director");

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["project_members", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_members")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Member[];
    },
  });

  const invite = useMutation({
    mutationFn: async () => {
      const clean = email.trim().toLowerCase();
      if (!clean || !clean.includes("@")) throw new Error("Enter a valid email address");
      const { data: u } = await supabase.auth.getUser();
      const { error } = await supabase.from("project_members").insert({
        project_id: projectId,
        owner_id: u.user!.id,
        invited_email: clean,
        role: role as any,
        status: "active",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["project_members", projectId] });
      setEmail("");
      toast.success("Team member added");
    },
    onError: (e: any) =>
      toast.error(
        e?.message?.includes("duplicate")
          ? "That email is already on the team"
          : (e?.message ?? "Failed to add"),
      ),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("project_members").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["project_members", projectId] });
      toast.success("Member removed");
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed to remove"),
  });

  return (
    <div>
      <PageHeader
        title="Team"
        description="Invite collaborators by email. They access this project after signing in with that email."
      />
      <div className="p-6">
        <div className="mb-6 rounded-xl border border-border bg-card p-5">
          <h3 className="mb-3 font-semibold">Add team member</h3>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1 grid gap-1.5">
              <Label>Email address</Label>
              <Input
                type="email"
                placeholder="person@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") invite.mutate();
                }}
              />
            </div>
            <div className="grid gap-1.5 sm:w-52">
              <Label>Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {roleLabel(r)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => invite.mutate()} disabled={invite.isPending}>
              <UserPlus className="mr-1 h-4 w-4" />
              Add
            </Button>
          </div>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : members.length === 0 ? (
          <EmptyState
            title="No team members yet"
            description="Add a collaborator by email to share this project with them."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((m) => (
              <div
                key={m.id}
                className="group flex items-start justify-between gap-2 rounded-xl border border-border bg-card p-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 shrink-0 text-primary" />
                    <span className="truncate font-medium">{m.invited_email}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Badge variant="secondary">{roleLabel(m.role)}</Badge>
                    <Badge variant={m.member_user_id ? "default" : "outline"}>
                      {m.member_user_id ? "Joined" : "Invited"}
                    </Badge>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (confirm("Remove this member?")) remove.mutate(m.id);
                  }}
                  className="rounded p-1 text-destructive opacity-0 transition-opacity hover:bg-accent group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
