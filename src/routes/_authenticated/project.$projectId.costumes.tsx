import { createFileRoute, useParams } from "@tanstack/react-router";
import { CrudModule } from "@/components/crud-module";

export const Route = createFileRoute("/_authenticated/project/$projectId/costumes")({
  component: Costumes,
});

function Costumes() {
  const { projectId } = useParams({ from: "/_authenticated/project/$projectId/costumes" });
  return (
    <CrudModule
      projectId={projectId}
      table="costumes"
      title="Costume & Dress"
      description="Wardrobe department — outfits, fittings and continuity."
      titleKey="name"
      subtitleKey="character_name"
      fields={[
        { key: "name", label: "Costume / Outfit Name" },
        { key: "character_name", label: "Character", badge: true },
        { key: "actor_name", label: "Actor" },
        { key: "size", label: "Size", badge: true },
        { key: "scene_references", label: "Scene References" },
        {
          key: "status",
          label: "Status",
          type: "select",
          options: ["Designed", "Sourced", "Fitting", "Ready", "Returned"],
          default: "Designed",
          badge: true,
        },
        { key: "responsible_person", label: "Responsible Person" },
        { key: "notes", label: "Notes", type: "textarea" },
      ]}
    />
  );
}
