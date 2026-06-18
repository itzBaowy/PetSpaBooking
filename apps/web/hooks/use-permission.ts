import { useCallback } from "react";

export function usePermission() {
  const hasPermission = useCallback((permission: string): boolean => {
    // TODO: Implement permission checking based on user role
    return true;
  }, []);

  const hasRole = useCallback((role: string): boolean => {
    // TODO: Implement role checking from auth store
    return true;
  }, []);

  return { hasPermission, hasRole };
}
