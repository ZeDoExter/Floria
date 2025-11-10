import { LucideIcon } from 'lucide-react';

interface ActionButtonProps {
  icon: LucideIcon;
  onClick: () => void;
  ariaLabel: string;
  variant?: 'default' | 'danger';
}

export function ActionButton({ 
  icon: Icon, 
  onClick, 
  ariaLabel,
  variant = 'default' 
}: ActionButtonProps) {
  return (
    <button 
      onClick={onClick} 
      aria-label={ariaLabel}
      className={`p-2 rounded-lg transition-colors ${
        variant === 'danger' 
          ? 'text-accent hover:bg-accent/20' 
          : 'text-secondary hover:bg-secondary/20'
      }`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
