import { create } from "zustand";

// Zustand store for managing theme state
interface ThemeState {
	theme: "light" | "dark" | "system";
	setTheme: (theme: "light" | "dark" | "system") => void;
}

export const useTheme = create<ThemeState>((set) => {
	return {
		theme: "system",
		setTheme: (theme: "light" | "dark" | "system") => set({ theme }),
	};
});
