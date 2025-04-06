import React from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  rightContent?: React.ReactNode;
}

export default function PageHeader({
  title,
  description,
  rightContent,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {rightContent && <div className="mt-4 md:mt-0">{rightContent}</div>}
    </div>
  );
}