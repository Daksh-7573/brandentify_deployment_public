import React, { ReactNode } from "react";
import { Separator } from "@/components/ui/separator";

interface PageHeaderProps {
  heading: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function PageHeader({
  heading,
  description,
  icon,
  action,
  className = ""
}: PageHeaderProps) {
  return (
    <div className={`bg-transparent ${className}`}>
      <div className="container px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2 text-white">
            {icon}
            {heading}
          </h1>
          {description && (
            <p className="text-white/70 text-sm mt-1 max-w-xl">
              {description}
            </p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  );
}