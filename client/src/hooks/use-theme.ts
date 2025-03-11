import { create } from "zustand";

type Theme = "light" | "dark";

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useTheme = create<ThemeStore>((set) => ({
  theme: (typeof window !== "undefined" && 
    (localStorage.getItem("theme") as Theme || 
    (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"))) || "light",
  setTheme: (theme) => {
    localStorage.setItem("theme", theme);
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    set({ theme });
  },
}));

// Initialize theme on load
if (typeof window !== "undefined") {
  const theme = useTheme.getState().theme;
  document.documentElement.classList.add(theme);
}
