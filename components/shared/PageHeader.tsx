import type { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
}

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <div className="border-b border-line bg-bg-1 py-14">
      <div className="wrap">
        <div className="eyebrow">{eyebrow}</div>
        <h1 className="mt-3.5">{title}</h1>
        {description ? <p className="mt-4 max-w-[64ch] text-[16px]">{description}</p> : null}
      </div>
    </div>
  );
}
