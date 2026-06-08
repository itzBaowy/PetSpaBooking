import { useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

export function useToast() {
  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    // TODO: Implement actual toast display using a state manager or context
    console.log(`[${type.toUpperCase()}] ${message}`);
  }, []);

  return { showToast };
}
