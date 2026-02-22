import { SkeletonBlock } from '@/components/shared/SkeletonBlock';

export default function PeopleLoading() {
  return (
    <div className="space-y-4">
      <SkeletonBlock className="h-10 w-72" />
      <SkeletonBlock className="h-48" />
      <SkeletonBlock className="h-24" />
      <SkeletonBlock className="h-24" />
      <SkeletonBlock className="h-52" />
    </div>
  );
}
