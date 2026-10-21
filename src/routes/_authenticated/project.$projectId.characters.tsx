import { createFileRoute, useParams } from "@tanstack/react-router";
import { CrudModule } from "@/components/crud-module";

export const Route = createFileRoute("/_authenticated/project/$projectId/characters")({
  component: Characters,
});

function Characters() {
  const { projectId } = useParams({ from: "/_authenticated/project/$projectId/characters" });
  return (
    <CrudModule
      projectId={projectId}
      table="characters"
      title="Characters"
      description="Develop your cast — goals, conflicts and arcs."
      titleKey="name"
      subtitleKey="description"
      fields={[
        { key: "name", label: "Name" },
        { key: "age", label: "Age", badge: true },
        { key: "description", label: "Description", type: "textarea" },
        { key: "goal", label: "Goal", type: "textarea" },
        { key: "motivation", label: "Motivation", type: "textarea" },
        { key: "internal_conflict", label: "Internal Conflict", type: "textarea" },
        { key: "external_conflict", label: "External Conflict", type: "textarea" },
        { key: "character_arc", label: "Character Arc", type: "textarea" },
        { key: "relationships", label: "Relationships", type: "textarea" },
        { key: "costume_notes", label: "Costume Notes", type: "textarea" },
      ]}
    />
  );
}
