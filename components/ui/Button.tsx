import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

export function Button({ variant = "secondary", className = "", ...props }: ButtonProps) {
  const base =
    "inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-[13px] font-semibold font-sans transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";
  const variants = {
    primary:
      "bg-cyan text-[#0c2026] hover:brightness-110",
    secondary:
      "bg-panel-2 text-soft border border-line hover:border-line-2",
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}
