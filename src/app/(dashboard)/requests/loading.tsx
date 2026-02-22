import { SkeletonBlock } from '@/components/shared/SkeletonBlock';

export default function RequestsLoading() {
  return (
    <div className="space-y-4">
      <SkeletonBlock className="h-10 w-72" />
      <SkeletonBlock className="h-24" />
      <SkeletonBlock className="h-36" />
      <SkeletonBlock className="h-36" />
    </div>
  );
}
