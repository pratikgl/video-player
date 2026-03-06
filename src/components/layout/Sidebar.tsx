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
    <div className="w-[350px] border-r border-gray-200 p-9 flex flex-col pb-[80px]">
      <h2 className="text-lg pb-5 font-semibold">Transcript</h2>
      <div className="flex-1 overflow-y-auto">
        <Transcript />
      </div>

      <div className="space-y-4 pt-15">
        <div>
          <label className="text-sm">Padding</label>
          <div className="flex text-[14px] gap-3">
            <Slider
              max={100}
              step={1}
              className="mx-auto py-3 w-full max-w-xs"
              value={padding}
              onValueChange={handlePaddingChange}
            />
            <label className="flex w-[30px] justify-center h-[30px] p-1 bg-gray-50 rounded-sm">
              {padding}
            </label>
          </div>
        </div>

        <div>
          <label className="text-sm">Rounding</label>
          <div className="flex text-[14px] gap-3">
            <Slider
              max={100}
              step={1}
              className="mx-auto py-3 w-full max-w-xs"
              value={rounding}
              onValueChange={handleRoundingChange}
            />
            <label className="flex w-[30px] justify-center h-[30px] p-1 bg-gray-50 rounded-sm">
              {rounding}
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
