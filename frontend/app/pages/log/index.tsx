import ThreeCellLogTable from "./ThreeCellLogTable";

export default function TrackLogPage() {
  return (
    <div className="flex h-full flex-1 flex-col gap-4 rounded-xl rounded-t-none p-4">
      <h1>Track log page</h1>
      <ThreeCellLogTable />
    </div>
  );
}
