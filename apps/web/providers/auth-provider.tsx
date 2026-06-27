"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const rehydrateResult = useAuthStore.persist.rehydrate();

    if (rehydrateResult instanceof Promise) {
      void rehydrateResult.finally(() => {
        setReady(true);
      });
      return;
    }

    window.setTimeout(() => {
      setReady(true);
    }, 0);
  }, []);

  if (!ready) {
    return null;
  }

  return <>{children}</>;
}
