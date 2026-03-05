import Sidebar from "@/components/layout/Sidebar";
import PlayerPanel from "@/components/layout/PlayerPanel";

export default function Home() {
  return (
    <main className="h-screen flex">
      <Sidebar />
      <PlayerPanel />
    </main>
  );
}
