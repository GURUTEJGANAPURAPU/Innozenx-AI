import { createFileRoute } from "@tanstack/react-router";
import { NewMission } from "@/components/mission-workspace";

export const Route = createFileRoute("/app/")({
  component: NewMission,
});
