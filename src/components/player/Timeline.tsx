"use client";

import { useEffect, useState } from "react";
import { videoController } from "@/lib/videoController";
import { Slider } from "../ui/slider";

export default function Timeline() {
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    videoController.subscribe((t) => {
      setTime(t);
      setDuration(videoController.getDuration());
    });
  }, []);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    videoController.seek(value);
  };

  return (
    <div className="w-[900px] flex items-center gap-4">
      <button
        onClick={() => videoController.toggle()}
        className="px-3 py-1 bg-black text-white rounded"
      >
        Play / Pause
      </button>

      <input
        type="range"
        min={0}
        max={duration}
        step={0.01}
        value={time}
        onChange={handleSeek}
        className="flex-1"
      />
      <Slider
        defaultValue={[0]}
        max={100}
        step={1}
        className="flex-1"
        // value={value}
        // onValueChange={setValue}
      />
    </div>
  );
}
