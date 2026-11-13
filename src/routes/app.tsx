import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Sidebar } from "@/components/sidebar";
import { ActivityPanel } from "@/components/activity-panel";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "Workspace · INNOZENX AI" },
      { name: "description", content: "Command your AI agent team from the INNOZENX workspace." },
    ],
  }),
  component: AppLayout,
});

function AppLayout() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar />
      <main className="relative flex-1 overflow-y-auto scrollbar-thin">
        <div className="mx-auto w-full max-w-5xl px-6 py-10 md:px-10 md:py-14">
          <Outlet />
        </div>
      </main>
      <ActivityPanel />
    </div>
  );
}
