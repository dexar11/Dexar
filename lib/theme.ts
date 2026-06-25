"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ThemeStore {
  theme: "dark" | "light";
  toggle: () => void;
  setTheme: (t: "dark" | "light") => void;
}

export const useTheme = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: "light",
      toggle: () =>
        set((s) => {
          const next = s.theme === "dark" ? "light" : "dark";
          if (typeof document !== "undefined")
            document.documentElement.setAttribute("data-theme", next);
          return { theme: next };
        }),
      setTheme: (t) => {
        if (typeof document !== "undefined")
          document.documentElement.setAttribute("data-theme", t);
        set({ theme: t });
      },
    }),
    { name: "arc-theme" },
  ),
);
