import { Slider } from "@/components/ui/slider";

export default function Sidebar() {
  return (
    <div className="w-[350px] border-r border-gray-200 p-4 flex flex-col gap-6">
      <h2 className="text-lg font-semibold">Transcript</h2>

      <div className="flex-1 overflow-y-auto">Transcript will go here</div>

      <div className="space-y-4">
        <div>
          <label className="text-sm">Padding</label>
          <Slider
            defaultValue={[75]}
            max={100}
            step={1}
            className="mx-auto w-full max-w-xs"
          />
        </div>

        <div>
          <label className="text-sm">Rounding</label>
          <Slider
            defaultValue={[75]}
            max={100}
            step={1}
            className="mx-auto w-full max-w-xs"
          />
        </div>
      </div>
    </div>
  );
}
