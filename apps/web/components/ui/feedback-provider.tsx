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

export type ToastType = "success" | "error" | "warning" | "info" | "custom";

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
  duration: number;
};

type FeedbackContextValue = {
  confirm: (options: ConfirmOptions) => Promise<ConfirmResult>;
  showToast: (message: string, type?: ToastType) => void;
};

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

type PendingConfirm = ConfirmOptions & {
  resolve: (result: ConfirmResult) => void;
};

const toastConfig: Record<
  ToastType,
  {
    title: string;
    icon: string;
    color: string;
    iconBackground: string;
    border: string;
    background: string;
  }
> = {
  success: {
    title: "Thành công",
    icon: "M4.5 12.75 9 17.25 19.5 6.75",
    color: "#5BDB6D",
    iconBackground: "#E9FBEF",
    border: "#5BDB6D",
    background: "#F4FFF6",
  },
  info: {
    title: "Thông tin",
    icon: "M12 17h.01M12 13.5c0-1.6 2.5-1.8 2.5-4A2.5 2.5 0 0 0 9.8 8.3",
    color: "#3B9BEA",
    iconBackground: "#EAF4FD",
    border: "#3B9BEA",
    background: "#F1F7FF",
  },
  warning: {
    title: "Cần chú ý",
    icon: "M12 7.5v6M12 17h.01",
    color: "#FFC42E",
    iconBackground: "#FFF7DC",
    border: "#F0C537",
    background: "#FFFBED",
  },
  error: {
    title: "Không thể thực hiện",
    icon: "M7.5 7.5 16.5 16.5M16.5 7.5 7.5 16.5",
    color: "#FF5B5F",
    iconBackground: "#FFEDEE",
    border: "#FF5B5F",
    background: "#FFF5F5",
  },
  custom: {
    title: "Thông báo",
    icon: "M12 8v8M8 12h8",
    color: "#8A9696",
    iconBackground: "#EEF2F2",
    border: "#8A9696",
    background: "#F7FAFA",
  },
};

const confirmButtonStyles: Record<ConfirmTone, string> = {
  default: "",
  success: "",
  danger: "bg-danger text-white hover:bg-danger/90 focus:ring-danger/20",
};

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

const toastMessageTranslations: Array<[RegExp, string]> = [
  [
    /cannot create withdrawal while provider has pending disputes/i,
    "Không thể tạo yêu cầu rút tiền khi đang có tranh chấp chờ xử lý. Vui lòng đợi tranh chấp được giải quyết.",
  ],
  [/insufficient (wallet )?balance/i, "Số dư ví không đủ để thực hiện giao dịch này."],
  [/provider deposit.*required|active deposit required/i, "Bạn cần hoàn tất ký quỹ trước khi sử dụng chức năng này."],
  [/this booking already has a dispute/i, "Lịch đặt này đã có yêu cầu tranh chấp."],
  [/dispute window has expired/i, "Thời hạn tạo tranh chấp cho lịch đặt này đã kết thúc."],
  [/only checked_out bookings can be disputed/i, "Chỉ có thể tạo tranh chấp cho lịch đặt đã check-out."],
  [/unauthorized/i, "Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại."],
  [/forbidden/i, "Bạn không có quyền thực hiện thao tác này."],
  [/network error|failed to fetch/i, "Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng và thử lại."],
  [/request failed with status code 5\d\d/i, "Máy chủ đang gặp sự cố. Vui lòng thử lại sau."],
];

function localizeToastMessage(message: string, type: ToastType) {
  const normalized = message.trim();
  for (const [pattern, translation] of toastMessageTranslations) {
    if (pattern.test(normalized)) return translation;
  }

  if (type === "error" && !/[À-ỹ]/.test(normalized) && /^[\x00-\x7F]+$/.test(normalized)) {
    return "Không thể thực hiện yêu cầu. Vui lòng thử lại hoặc liên hệ bộ phận hỗ trợ.";
  }

  return normalized || "Đã có lỗi xảy ra. Vui lòng thử lại.";
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
    const localizedMessage = localizeToastMessage(message, type);
    const duration = type === "error" || type === "warning" ? 6000 : 4200;
    setToasts((items) => [
      ...items.filter((toast) => toast.message !== localizedMessage).slice(-2),
      { id, message: localizedMessage, type, duration },
    ]);

    const timer = setTimeout(() => {
      setToasts((items) => items.filter((toast) => toast.id !== id));
      toastTimers.current.delete(id);
    }, duration);

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

      <div className="fixed right-4 top-20 z-[100] flex w-[min(420px,calc(100vw-2rem))] flex-col gap-3 sm:right-5">
        {toasts.map((toast) => {
          const config = toastConfig[toast.type];

          return (
            <div
              key={toast.id}
              role={toast.type === "error" ? "alert" : "status"}
              className="toast-enter relative flex items-start gap-3 overflow-hidden rounded-2xl border bg-white/95 p-4 pr-3 shadow-[0_18px_45px_rgba(15,23,42,0.16)] backdrop-blur-xl"
              style={{
                borderColor: config.border,
                backgroundColor: config.background,
              }}
            >
              <span
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 ring-black/5"
                style={{ backgroundColor: config.iconBackground, color: config.color }}
                aria-hidden="true"
              >
                <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.3} d={config.icon} />
                </svg>
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-sm font-extrabold leading-5 text-slate-950">
                  {config.title}
                </span>
                <span className="mt-1 block text-sm font-medium leading-5 text-slate-600">
                  {toast.message}
                </span>
              </span>

              <button
                type="button"
                aria-label="Đóng thông báo"
                onClick={() => closeToast(toast.id)}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-200"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
              <span
                className="toast-progress absolute inset-x-0 bottom-0 h-1 origin-left"
                style={{ backgroundColor: config.color, animationDuration: `${toast.duration}ms` }}
                aria-hidden="true"
              />
            </div>
          );
        })}
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
