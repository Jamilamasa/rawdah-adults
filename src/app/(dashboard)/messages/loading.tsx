import { SkeletonBlock } from '@/components/shared/SkeletonBlock';

export default function MessagesLoading() {
  return (
    <div className="space-y-4">
      <SkeletonBlock className="h-10 w-72" />
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <SkeletonBlock className="h-[70dvh]" />
        <SkeletonBlock className="h-[70dvh]" />
      </div>
    </div>
  );
}
