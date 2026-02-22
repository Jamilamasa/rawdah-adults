import { SkeletonBlock } from '@/components/shared/SkeletonBlock';

export default function DashboardLoading() {
  return (
    <div className="space-y-5">
      <SkeletonBlock className="h-10 w-64" />
      <div className="content-grid">
        <SkeletonBlock className="h-24" />
        <SkeletonBlock className="h-24" />
        <SkeletonBlock className="h-24" />
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <SkeletonBlock className="h-80" />
        <SkeletonBlock className="h-80" />
        <SkeletonBlock className="h-80" />
        <SkeletonBlock className="h-80" />
      </div>
    </div>
  );
}
