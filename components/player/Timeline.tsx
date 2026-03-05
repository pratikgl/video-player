"use client";

import { Slider } from "../ui/slider";
import { useState } from "react";

export default function Timeline() {
  const [value, setValue] = useState<number[]>([0]);

  return (
    <div className="w-[700px] flex items-center gap-4">
      <button className="px-3 py-1 bg-black text-white rounded">Play</button>

      <Slider
        defaultValue={[0]}
        max={100}
        step={1}
        className="flex-1"
        value={value}
        onValueChange={setValue}
      />
    </div>
  );
}
