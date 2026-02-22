import { SkeletonBlock } from '@/components/shared/SkeletonBlock';

export default function DashboardRouteLoading() {
  return (
    <div className="space-y-5">
      <SkeletonBlock className="h-10 w-64" />
      <div className="content-grid">
        <SkeletonBlock className="h-28" />
        <SkeletonBlock className="h-28" />
        <SkeletonBlock className="h-28" />
      </div>
      <SkeletonBlock className="h-72" />
      <SkeletonBlock className="h-72" />
    </div>
  );
}
