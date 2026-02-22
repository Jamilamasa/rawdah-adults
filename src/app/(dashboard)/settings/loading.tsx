import { SkeletonBlock } from '@/components/shared/SkeletonBlock';

export default function SettingsLoading() {
  return (
    <div className="space-y-4">
      <SkeletonBlock className="h-10 w-72" />
      <div className="grid gap-4 xl:grid-cols-2">
        <SkeletonBlock className="h-72" />
        <SkeletonBlock className="h-72" />
      </div>
      <SkeletonBlock className="h-40" />
    </div>
  );
}
