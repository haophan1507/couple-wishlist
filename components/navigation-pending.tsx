"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type NavigationPendingContextValue = {
  pending: boolean;
  setLinkPending: (pending: boolean) => void;
};

const NavigationPendingContext = createContext<NavigationPendingContextValue | null>(null);

export function NavigationPendingProvider({ children }: { children: ReactNode }) {
  const [pendingCount, setPendingCount] = useState(0);

  const setLinkPending = useCallback((pending: boolean) => {
    setPendingCount((count) => {
      if (pending) return count + 1;
      return Math.max(0, count - 1);
    });
  }, []);

  const value = useMemo(
    () => ({
      pending: pendingCount > 0,
      setLinkPending,
    }),
    [pendingCount, setLinkPending],
  );

  return (
    <NavigationPendingContext.Provider value={value}>{children}</NavigationPendingContext.Provider>
  );
}

export function useNavigationPending() {
  const context = useContext(NavigationPendingContext);
  if (!context) {
    throw new Error("useNavigationPending must be used within NavigationPendingProvider");
  }
  return context;
}
