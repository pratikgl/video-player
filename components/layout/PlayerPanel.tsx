import ThreeVideoPlayer from "../player/ThreeVideoPlayer";
import Timeline from "../player/Timeline";

export default function PlayerPanel() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
      <ThreeVideoPlayer />

      <Timeline />
    </div>
  );
}
