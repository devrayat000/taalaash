import { useCallback, useSyncExternalStore } from "react";

export function useMediaQueryValue<Value>(items: Record<string, Value>) {
  const subscribe = useCallback(
    (callback: () => void) => {
      for (const key in items) {
        if (Object.prototype.hasOwnProperty.call(items, key)) {
          const matchMedia = window.matchMedia(key);
          matchMedia.addEventListener("change", callback);
        }
      }

      return () => {
        for (const key in items) {
          if (Object.prototype.hasOwnProperty.call(items, key)) {
            const matchMedia = window.matchMedia(key);
            matchMedia.removeEventListener("change", callback);
          }
        }
      };
    },
    [items]
  );

  const getSnapshot = useCallback(() => {
    for (const key in items) {
      if (Object.prototype.hasOwnProperty.call(items, key)) {
        const element = items[key];
        window.matchMedia(key).matches;
      }
    }
  }, [items]);

  const getServerSnapshot = () => {
    throw Error("useMediaQuery is a client-only hook");
  };

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
