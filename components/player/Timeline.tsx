export default function Timeline() {
  return (
    <div className="w-[700px] flex items-center gap-4">
      <button className="px-3 py-1 bg-black text-white rounded">Play</button>

      <input type="range" className="flex-1" />
    </div>
  );
}
