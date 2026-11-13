import { useEffect, useState } from "react";
import { loadMissions, type Mission } from "@/lib/missions-store";

export function useMissions(): Mission[] {
  const [missions, setMissions] = useState<Mission[]>(() => loadMissions());
  useEffect(() => {
    const sync = () => setMissions(loadMissions());
    sync();
    window.addEventListener("innozenx:missions", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("innozenx:missions", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return missions;
}
