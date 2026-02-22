import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-dashed border-panel-300 bg-white/70 px-5 py-10 text-center',
        className
      )}
    >
      {icon ? <div className="mx-auto mb-3 inline-flex text-panel-500">{icon}</div> : null}
      <h3 className="text-lg font-semibold text-panel-900">{title}</h3>
      {description ? <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
