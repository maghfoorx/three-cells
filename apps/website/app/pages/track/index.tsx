import ThreeCellDailyForm from "./ThreeCellDailyForm";

export default function TrackPage() {
  return (
    <div className="flex h-full flex-1 flex-col gap-4 rounded-xl rounded-t-none p-4">
      <h1 className="font-semibold text-3xl">Journal your life</h1>
      <ThreeCellDailyForm />
    </div>
  );
}
