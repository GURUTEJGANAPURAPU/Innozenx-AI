import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getMission, type Mission } from "@/lib/missions-store";
import { MissionView } from "@/components/mission-workspace";

export const Route = createFileRoute("/app/$missionId")({
  component: MissionPage,
});

function MissionPage() {
  const { missionId } = Route.useParams();
  const [mission, setMission] = useState<Mission | undefined>(() => getMission(missionId));

  useEffect(() => {
    setMission(getMission(missionId));
  }, [missionId]);

  if (!mission) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <div className="font-display text-xl font-semibold">Mission not found</div>
        <p className="mt-2 text-[13.5px] text-muted-foreground">
          It may have been cleared from this browser.
        </p>
        <Link
          to="/app"
          className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-primary to-accent px-4 py-2 text-[13px] font-semibold text-white"
        >
          Start a new mission
        </Link>
      </div>
    );
  }

  return <MissionView mission={mission} key={mission.id} />;
}
