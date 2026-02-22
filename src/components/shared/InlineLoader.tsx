import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function InlineLoader({ label = 'Loading...', className }: { label?: string; className?: string }) {
  return (
    <div className={cn('inline-flex items-center gap-2 text-sm text-muted-foreground', className)}>
      <Loader2 className="size-4 animate-spin" />
      <span>{label}</span>
    </div>
  );
}
