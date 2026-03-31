import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center animate-in fade-in zoom-in-95">
      <Icon className="h-12 w-12 text-muted-foreground/60" />

      <p className="text-lg font-semibold">{title}</p>

      {description && (
        <p className="text-sm text-muted-foreground max-w-sm">
          {description}
        </p>
      )}

      {action && <div className="mt-2">{action}</div>}
    </div>
  );
};

export default EmptyState;
