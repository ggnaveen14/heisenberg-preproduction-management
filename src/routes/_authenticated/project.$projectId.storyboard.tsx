import { createFileRoute, useParams } from "@tanstack/react-router";
import { CrudModule } from "@/components/crud-module";
import { useProject } from "@/lib/use-project";
import { ExportManager } from "@/lib/export-manager";

export const Route = createFileRoute("/_authenticated/project/$projectId/storyboard")({
  component: Storyboard,
});

function Storyboard() {
  const { projectId } = useParams({ from: "/_authenticated/project/$projectId/storyboard" });
  const { data: project } = useProject(projectId);
  const title = project?.title || "Project";

  return (
    <CrudModule
      projectId={projectId}
      table="storyboards"
      title="Storyboard"
      description="Plan your shots — angles, lenses and movement."
      titleKey="shot_description"
      subtitleKey="scene_link"
      sortOptions={[
        { key: "shot_number", label: "Shot Number" },
        { key: "camera_angle", label: "Camera Angle" },
        { key: "camera_movement", label: "Camera Movement" },
        { key: "scene_link", label: "Scene" },
      ]}
      onExportPDF={(rows) => ExportManager.exportStoryboardPDF(title, rows)}
      fields={[
        { key: "shot_description", label: "Shot Description", type: "textarea" },
        { key: "scene_link", label: "Scene", badge: true },
        { key: "shot_number", label: "Shot Number", badge: true },
        {
          key: "camera_angle",
          label: "Camera Angle",
          type: "select",
          options: [
            "Wide",
            "Medium",
            "Close-Up",
            "Extreme Close-Up",
            "Over-the-Shoulder",
            "POV",
            "High Angle",
            "Low Angle",
            "Dutch",
            "Aerial",
          ],
          badge: true,
        },
        { key: "angle_description", label: "Angle Description", type: "textarea" },
        {
          key: "camera_movement",
          label: "Camera Movement",
          type: "select",
          options: [
            "Static",
            "Pan",
            "Tilt",
            "Dolly",
            "Track",
            "Crane",
            "Handheld",
            "Steadicam",
            "Zoom",
          ],
          badge: true,
        },
        { key: "notes", label: "Notes", type: "textarea" },
      ]}
    />
  );
}
