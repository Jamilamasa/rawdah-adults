import { SkeletonBlock } from '@/components/shared/SkeletonBlock';

export default function AILoading() {
  return (
    <div className="space-y-4">
      <SkeletonBlock className="h-10 w-56" />
      <SkeletonBlock className="h-64" />
      <SkeletonBlock className="h-48" />
    </div>
  );
}
