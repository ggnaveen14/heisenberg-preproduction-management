import { createFileRoute, useParams } from "@tanstack/react-router";
import { CrudModule } from "@/components/crud-module";

export const Route = createFileRoute("/_authenticated/project/$projectId/locations")({
  component: Locations,
});

function Locations() {
  const { projectId } = useParams({ from: "/_authenticated/project/$projectId/locations" });
  return (
    <CrudModule
      projectId={projectId}
      table="locations"
      title="Locations"
      description="Scout and manage shooting locations."
      titleKey="name"
      subtitleKey="address"
      fields={[
        { key: "name", label: "Location Name" },
        { key: "address", label: "Address" },
        { key: "scene_references", label: "Scene References" },
        {
          key: "permission_status",
          label: "Permission Status",
          type: "select",
          options: ["Pending", "Requested", "Approved", "Denied"],
          default: "Pending",
          badge: true,
        },
        { key: "contact_info", label: "Contact Information", type: "textarea" },
        { key: "notes", label: "Notes", type: "textarea" },
        { key: "photo_url", label: "Photo URL" },
      ]}
    />
  );
}
