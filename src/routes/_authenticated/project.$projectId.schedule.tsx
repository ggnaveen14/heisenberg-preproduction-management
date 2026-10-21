import { createFileRoute, useParams } from "@tanstack/react-router";
import { CrudModule } from "@/components/crud-module";

export const Route = createFileRoute("/_authenticated/project/$projectId/schedule")({
  component: Schedule,
});

function Schedule() {
  const { projectId } = useParams({ from: "/_authenticated/project/$projectId/schedule" });
  return (
    <CrudModule
      projectId={projectId}
      table="shooting_schedule"
      title="Shooting Schedule"
      description="Stripboard-style scene scheduling by day."
      titleKey="scene"
      subtitleKey="description"
      fields={[
        { key: "shoot_day", label: "Shoot Day", type: "number", default: 1, badge: true },
        { key: "shoot_date", label: "Date", type: "date" },
        { key: "scene", label: "Scene" },
        {
          key: "int_ext",
          label: "INT/EXT",
          type: "select",
          options: ["INT", "EXT", "INT/EXT"],
          badge: true,
        },
        {
          key: "day_night",
          label: "Day/Night",
          type: "select",
          options: ["DAY", "NIGHT", "DAWN", "DUSK"],
          badge: true,
        },
        { key: "location", label: "Location" },
        { key: "cast_members", label: "Cast", type: "textarea" },
        { key: "pages", label: "Pages" },
        { key: "description", label: "Description", type: "textarea" },
      ]}
    />
  );
}
