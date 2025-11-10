interface EmptyStateProps {
  message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="bg-primary/10 border-2 border-dashed border-primary/30 rounded-xl p-8 text-center">
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}
