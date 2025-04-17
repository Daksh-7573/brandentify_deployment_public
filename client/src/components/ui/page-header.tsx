import { ReactNode } from "react";

interface PageHeaderProps {
  heading: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function PageHeader({
  heading,
  description,
  icon,
  action,
}: PageHeaderProps) {
  return (
    <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="container flex flex-col gap-1 py-4 md:py-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="flex items-center gap-2 text-2xl font-semibold">
            {icon && <span className="text-primary">{icon}</span>}
            {heading}
          </h1>
          {action && <div>{action}</div>}
        </div>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}