"use client";

import { useEffect, useState } from "react";
import { Play, Pause } from "lucide-react";
import { videoController } from "@/lib/videoController";
import { Slider } from "../ui/slider";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "00")}`;
}

export default function Timeline() {
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    videoController.subscribe((t) => {
      setTime(t);
      setDuration(videoController.getDuration());
      setIsPlaying(videoController.isPlaying());
    });
  }, []);

  const handleToggle = () => {
    videoController.toggle();
    setIsPlaying((prev) => !prev);
  };

  const handleSeek = (value: number[]) => {
    videoController.seek(value[0]);
  };

  const tickInterval = 20; // every 20 seconds
  const totalDuration = duration || 0;
  const ticks: number[] = [];
  for (let t = 0; t <= totalDuration; t += tickInterval) {
    ticks.push(t);
  }

  return (
    <div className="w-full border-t border-gray-200 bg-white mt-10">
      <div className="flex items-center justify-center gap-3 py-5 border-b border-gray-100">
        <button
          onClick={handleToggle}
          className="w-9 h-9 rounded-full cursor-pointer bg-indigo-500 flex items-center justify-center text-white shrink-0 hover:bg-indigo-600"
        >
          {isPlaying ? (
            <Pause size={16} fill="white" />
          ) : (
            <Play size={16} fill="white" />
          )}
        </button>
        <span className="text-sm font-semibold">
          {formatTime(time)}{" "}
          <span className="font-normal text-gray-400">
            / {formatTime(totalDuration)}
          </span>
        </span>
      </div>

      <div className="px-4 pt-5 pb-3">
        <div className="relative h-5 mb-1 mx-4 select-none pointer-events-none">
          {ticks.map((t) => (
            <span
              key={t}
              className="absolute text-[11px] text-gray-400 -translate-x-1/2"
              style={{ left: `${(t / totalDuration) * 100}%` }}
            >
              {formatTime(t)}
            </span>
          ))}
        </div>

        <Slider
          min={0}
          max={totalDuration}
          step={0.01}
          value={[time]}
          onValueChange={handleSeek}
          className="w-full"
        />
      </div>
    </div>
  );
}
