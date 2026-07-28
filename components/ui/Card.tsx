import type { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-card border border-line bg-panel shadow-card p-5 ${className}`}
      {...props}
    />
  );
}

export function CardHeader({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`flex items-start justify-between gap-2 mb-3 ${className}`} {...props} />;
}

export function CardTitle({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`text-[13.5px] font-bold text-text ${className}`} {...props} />
  );
}

export function CardSub({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`text-[11px] text-muted mt-0.5 ${className}`} {...props} />;
}
