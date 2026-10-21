import { createFileRoute, useParams } from "@tanstack/react-router";
import { CrudModule } from "@/components/crud-module";

export const Route = createFileRoute("/_authenticated/project/$projectId/notes")({
  component: Notes,
});

function Notes() {
  const { projectId } = useParams({ from: "/_authenticated/project/$projectId/notes" });
  return (
    <CrudModule
      projectId={projectId}
      table="production_notes"
      title="Production Notes"
      description="Keep every production note in one place."
      titleKey="title"
      subtitleKey="content"
      fields={[
        { key: "title", label: "Title" },
        {
          key: "category",
          label: "Category",
          type: "select",
          options: ["General", "Budget", "Creative", "Technical", "Legal", "Scheduling"],
          default: "General",
          badge: true,
        },
        { key: "content", label: "Content", type: "textarea" },
      ]}
    />
  );
}
