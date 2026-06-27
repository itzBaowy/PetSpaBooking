"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Button } from "./button";
import { Textarea } from "./input";

export type ToastType = "success" | "error" | "warning" | "info";

type ConfirmTone = "default" | "danger" | "success";

type ConfirmOptions = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmTone;
  input?: {
    label: string;
    placeholder?: string;
    required?: boolean;
    defaultValue?: string;
  };
};

type ConfirmResult =
  | { confirmed: true; value?: string }
  | { confirmed: false; value?: string };

type Toast = {
  id: string;
  message: string;
  type: ToastType;
};

type FeedbackContextValue = {
  confirm: (options: ConfirmOptions) => Promise<ConfirmResult>;
  showToast: (message: string, type?: ToastType) => void;
};

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

type PendingConfirm = ConfirmOptions & {
  resolve: (result: ConfirmResult) => void;
};

const toastStyles: Record<ToastType, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  error: "border-red-200 bg-red-50 text-red-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  info: "border-blue-200 bg-blue-50 text-blue-800",
};

const confirmButtonStyles: Record<ConfirmTone, string> = {
  default: "",
  success: "",
  danger: "bg-danger text-white hover:bg-danger/90 focus:ring-danger/20",
};

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm | null>(
    null,
  );
  const [inputValue, setInputValue] = useState("");
  const [inputTouched, setInputTouched] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = createId();
    setToasts((items) => [...items, { id, message, type }]);

    const timer = setTimeout(() => {
      setToasts((items) => items.filter((toast) => toast.id !== id));
      toastTimers.current.delete(id);
    }, 3500);

    toastTimers.current.set(id, timer);
  }, []);

  const closeToast = useCallback((id: string) => {
    const timer = toastTimers.current.get(id);
    if (timer) clearTimeout(timer);
    toastTimers.current.delete(id);
    setToasts((items) => items.filter((toast) => toast.id !== id));
  }, []);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<ConfirmResult>((resolve) => {
      setInputValue(options.input?.defaultValue ?? "");
      setInputTouched(false);
      setPendingConfirm({ ...options, resolve });
    });
  }, []);

  const contextValue = useMemo(
    () => ({
      confirm,
      showToast,
    }),
    [confirm, showToast],
  );

  const inputIsInvalid =
    pendingConfirm?.input?.required && inputTouched && !inputValue.trim();

  function finishConfirm(result: ConfirmResult) {
    pendingConfirm?.resolve(result);
    setPendingConfirm(null);
    setInputValue("");
    setInputTouched(false);
  }

  function submitConfirm() {
    if (pendingConfirm?.input?.required && !inputValue.trim()) {
      setInputTouched(true);
      return;
    }

    finishConfirm({
      confirmed: true,
      value: pendingConfirm?.input ? inputValue.trim() : undefined,
    });
  }

  return (
    <FeedbackContext.Provider value={contextValue}>
      {children}

      <div className="fixed right-4 top-4 z-[70] flex w-[min(420px,calc(100vw-2rem))] flex-col gap-3">
        {toasts.map((toast) => (
          <button
            key={toast.id}
            type="button"
            className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold shadow-lg transition hover:translate-y-[-1px] ${toastStyles[toast.type]}`}
            onClick={() => closeToast(toast.id)}
          >
            {toast.message}
          </button>
        ))}
      </div>

      {pendingConfirm && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-black/45 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-lg rounded-3xl border border-border-muted bg-surface p-6 shadow-2xl"
          >
            <h2 className="text-xl font-bold text-foreground">
              {pendingConfirm.title}
            </h2>
            {pendingConfirm.description && (
              <p className="mt-2 text-sm leading-6 text-muted">
                {pendingConfirm.description}
              </p>
            )}

            {pendingConfirm.input && (
              <label className="mt-5 block">
                <span className="text-sm font-semibold text-foreground">
                  {pendingConfirm.input.label}
                </span>
                <Textarea
                  className="mt-2 min-h-32"
                  value={inputValue}
                  placeholder={pendingConfirm.input.placeholder}
                  onBlur={() => setInputTouched(true)}
                  onChange={(event) => setInputValue(event.target.value)}
                  autoFocus
                />
                {inputIsInvalid && (
                  <span className="mt-2 block text-xs font-semibold text-danger">
                    Vui lòng nhập nội dung trước khi xác nhận.
                  </span>
                )}
              </label>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                onClick={() => finishConfirm({ confirmed: false })}
              >
                {pendingConfirm.cancelLabel ?? "Hủy"}
              </Button>
              <Button
                className={confirmButtonStyles[pendingConfirm.tone ?? "default"]}
                onClick={submitConfirm}
              >
                {pendingConfirm.confirmLabel ?? "Xác nhận"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </FeedbackContext.Provider>
  );
}

export function useConfirmDialog() {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error("useConfirmDialog must be used within FeedbackProvider");
  }

  return context.confirm;
}

export function useToast() {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error("useToast must be used within FeedbackProvider");
  }

  return { showToast: context.showToast };
}
