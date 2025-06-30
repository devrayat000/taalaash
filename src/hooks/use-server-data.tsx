"use client";

import { createStore } from "zustand/vanilla";
import { type ReactNode, createContext, useRef, useContext } from "react";
import { type StoreApi, useStore } from "zustand";
import { BookmarkedList } from "@/server/bookmark/service";
import { SearchHistory } from "@/services/history";
import { PostHitResults } from "@/server/post/service";

interface ServerData {
  searchHistory: SearchHistory;
  bookmarks: BookmarkedList;
  searchResults?: PostHitResults;
}

interface ServerAction {
  toggleBookmark: (postId: string) => void;
  addSearchHistory: (search: string) => void;
}

export type ServerStore = ServerData & ServerAction;

export const initServerStore = (initialData: ServerData): ServerData => {
  return initialData;
};

export const defaultInitState: ServerData = {
  searchHistory: [],
  bookmarks: [],
};

export const createServerStore = (initState: ServerData = defaultInitState) => {
  return createStore<ServerStore>()((set, get) => ({
    ...initState,
    toggleBookmark: (postId: string) => {
      const bookmarks = get().bookmarks;
      const index = bookmarks.findIndex((bm) => bm.postId === postId);
      if (index === -1) {
        set({ bookmarks: [...bookmarks, { postId }] });
      } else {
        set({ bookmarks: bookmarks.filter((bm) => bm.postId !== postId) });
      }
    },
    addSearchHistory: (search: string) => {
      const searchHistory = get().searchHistory;

      set({
        searchHistory: [
          {
            id: crypto.randomUUID(),
            query: search,
            createdAt: new Date(),
          },
          ...searchHistory,
        ],
      });
    },
  }));
};

const ServerStoreContext = createContext<StoreApi<ServerStore> | null>(null);

export interface ServerStoreProviderProps {
  initialData: ServerData;
  children: ReactNode;
}

export const ServerStoreProvider = ({
  children,
  initialData,
}: ServerStoreProviderProps) => {
  const storeRef = useRef<StoreApi<ServerStore>>();
  if (!storeRef.current) {
    storeRef.current = createServerStore(initServerStore(initialData));
  }

  return (
    <ServerStoreContext.Provider value={storeRef.current}>
      {children}
    </ServerStoreContext.Provider>
  );
};

export const useServerStore = <T,>(selector: (store: ServerStore) => T): T => {
  const serverStoreContext = useContext(ServerStoreContext);

  if (!serverStoreContext) {
    throw new Error(`useServerStore must be use within ServerStoreProvider`);
  }

  return useStore(serverStoreContext, selector);
};
