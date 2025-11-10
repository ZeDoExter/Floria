import { AlertCircle } from 'lucide-react';

interface FeedbackBannerProps {
  type: 'success' | 'error';
  message: string;
}

export function FeedbackBanner({ type, message }: FeedbackBannerProps) {
  return (
    <div className={`flex items-center gap-3 p-4 rounded-lg border ${
      type === 'success'
        ? 'bg-secondary/20 border-secondary text-foreground'
        : 'bg-accent/30 border-accent text-accent-foreground'
    }`}>
      <AlertCircle className="h-5 w-5 shrink-0" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}
