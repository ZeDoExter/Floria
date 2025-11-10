interface PageHeaderProps {
  title: string;
  description: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="bg-linear-to-r from-secondary to-primary p-6 rounded-2xl text-secondary-foreground shadow-lg">
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="opacity-90 mt-1">{description}</p>
    </div>
  );
}
