import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

export function Button({ variant = "secondary", className = "", ...props }: ButtonProps) {
  const base =
    "inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-bold font-sans transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";
  const variants = {
    primary:
      "bg-gradient-to-r from-cyan to-lime text-[#061014] shadow-[0_4px_16px_rgba(88,230,255,0.25)] hover:brightness-110",
    secondary:
      "bg-panel-2 text-soft border border-line hover:border-line-2",
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}
