import { useEffect } from "react";
import { create } from "zustand";

interface SearchModeState {
  searchMode: boolean;
  open: () => void;
  close: () => void;
}

export const useSearchMode = create<SearchModeState>((set) => ({
  searchMode: false,
  open: () => set({ searchMode: true }),
  close: () => set({ searchMode: false }),
}));

export function SearchModeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    return () => {
      useSearchMode.getState().close();
    };
  }, []);

  return <>{children}</>;
}
