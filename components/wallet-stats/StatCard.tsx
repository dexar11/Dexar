"use client";

import { Skeleton }   from "@/components/ui/LoadingSpinner";
import { FieldLabel } from "@/components/ui/FieldLabel";

interface StatCardProps {
  label:     string;
  value:     string | number;
  isLoading: boolean;
  variant?:  "highlight" | "neutral";
}

export function StatCard({ label, value, isLoading, variant = "neutral" }: StatCardProps) {
  return (
    <div className="flex flex-col gap-1.5 rounded-xl border px-4 py-3"
      style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
      <FieldLabel>{label}</FieldLabel>
      {isLoading ? (
        <Skeleton className="h-7 w-16 mt-0.5" />
      ) : (
        <span className="text-xl font-semibold leading-tight"
          style={{ color: variant === "highlight" ? "#C9693A" : "var(--text-primary)" }}>
          {value}
        </span>
      )}
    </div>
  );
}
