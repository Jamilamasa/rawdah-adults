export default function RootLoading() {
  return (
    <div className="min-h-dvh flex items-center justify-center px-4">
      <div className="flex flex-col items-center gap-4">
        <div className="h-14 w-14 rounded-full border-4 border-panel-200 border-t-panel-700 animate-spin" />
        <p className="text-sm font-semibold text-panel-800">Loading your workspace...</p>
      </div>
    </div>
  );
}
