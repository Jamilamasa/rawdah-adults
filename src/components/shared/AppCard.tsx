import { cn } from '@/lib/utils';

export function AppCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={cn('section-shell', className)}>{children}</section>;
}
