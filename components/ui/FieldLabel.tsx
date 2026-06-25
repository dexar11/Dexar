"use client";

interface FieldLabelProps {
  children:   React.ReactNode;
  className?: string;
}

export function FieldLabel({ children, className = "" }: FieldLabelProps) {
  return (
    <span className={`text-[10px] font-bold uppercase tracking-widest ${className}`}
      style={{ color: "var(--text-secondary)" }}>
      {children}
    </span>
  );
}
