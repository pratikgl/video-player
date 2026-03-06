"use client";

import { Slider } from "@/components/ui/slider";
import { useState } from "react";

import Transcript from "../transcript/Transcript";
import { playerController } from "@/lib/playerController";

export default function Sidebar() {
  const [padding, setPadding] = useState<number[]>([30]);
  const [rounding, setRounding] = useState<number[]>([30]);

  const handlePaddingChange = (value: number[]) => {
    setPadding(value);
    playerController.setPadding(value[0] / 100);
  };

  const handleRoundingChange = (value: number[]) => {
    setRounding(value);
    playerController.setRadius(value[0] / 100);
  };

  return (
    <div className="w-[350px] border-r border-gray-200 p-4 flex flex-col gap-6 pb-[150px]">
      <h2 className="text-lg font-semibold">Transcript</h2>

      <div className="flex-1 overflow-y-auto">
        <Transcript />
      </div>

      <div className="space-y-6">
        <div>
          <label className="text-sm">Padding</label>
          <Slider
            max={100}
            step={1}
            className="mx-auto py-3 w-full max-w-xs"
            value={padding}
            onValueChange={handlePaddingChange}
          />
        </div>

        <div>
          <label className="text-sm">Rounding</label>
          <Slider
            max={100}
            step={1}
            className="mx-auto py-3 w-full max-w-xs"
            value={rounding}
            onValueChange={handleRoundingChange}
          />
        </div>
      </div>
    </div>
  );
}
