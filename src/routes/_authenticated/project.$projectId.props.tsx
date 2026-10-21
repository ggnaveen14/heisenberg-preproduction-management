import { createFileRoute, useParams } from "@tanstack/react-router";
import { CrudModule } from "@/components/crud-module";

export const Route = createFileRoute("/_authenticated/project/$projectId/props")({
  component: Props,
});

function Props() {
  const { projectId } = useParams({ from: "/_authenticated/project/$projectId/props" });
  return (
    <CrudModule
      projectId={projectId}
      table="props_costumes"
      title="Props & Set"
      description="Track props and set dressing across departments."
      titleKey="name"
      subtitleKey="responsible_person"
      fields={[
        { key: "name", label: "Item Name" },
        { key: "quantity", label: "Quantity", type: "number", default: 1, badge: true },
        {
          key: "department",
          label: "Department",
          type: "select",
          options: ["Props", "Set Dressing", "Makeup", "SFX"],
          default: "Props",
          badge: true,
        },
        { key: "scene_references", label: "Scene References" },
        {
          key: "availability_status",
          label: "Availability",
          type: "select",
          options: ["Needed", "Sourced", "Rented", "Owned", "Built"],
          default: "Needed",
          badge: true,
        },
        { key: "responsible_person", label: "Responsible Person" },
      ]}
    />
  );
}
