"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AlertCircle, CheckCircle2, Info, X, XCircle } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

type ToastListener = (toasts: Toast[]) => void;

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let toastStore: Toast[] = [];
const toastListeners = new Set<ToastListener>();
let nextToastId = 0;

function emitToastStore() {
  toastListeners.forEach((listener) => listener(toastStore));
}

function subscribeToasts(listener: ToastListener) {
  toastListeners.add(listener);
  listener(toastStore);

  return () => {
    toastListeners.delete(listener);
  };
}

function removeToast(id: string) {
  toastStore = toastStore.filter((toast) => toast.id !== id);
  emitToastStore();
}

function pushToast(message: string, type: ToastType) {
  nextToastId += 1;
  const id = `toast_${nextToastId}`;

  toastStore = [...toastStore, { id, message, type }];
  emitToastStore();

  window.setTimeout(() => {
    removeToast(id);
  }, 5000);
}

export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return context;
};

function ToastViewport() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => subscribeToasts(setToasts), []);

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[9999] flex flex-col gap-3">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    if (!mountedRef.current || typeof window === "undefined") {
      return;
    }

    pushToast(message, type);
  }, []);

  const contextValue = useMemo<ToastContextType>(
    () => ({
      showToast,
      success: (message: string) => showToast(message, "success"),
      error: (message: string) => showToast(message, "error"),
      info: (message: string) => showToast(message, "info"),
      warning: (message: string) => showToast(message, "warning"),
    }),
    [showToast],
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastViewport />
    </ToastContext.Provider>
  );
};

const ToastItem = ({ toast, onClose }: { toast: Toast; onClose: () => void }) => {
  const icons = {
    success: <CheckCircle2 className="text-emerald-500" size={20} />,
    error: <XCircle className="text-rose-500" size={20} />,
    info: <Info className="text-blue-500" size={20} />,
    warning: <AlertCircle className="text-amber-500" size={20} />,
  };

  const colors = {
    success: "border-emerald-100 bg-white shadow-emerald-100/50",
    error: "border-rose-100 bg-white shadow-rose-100/50",
    info: "border-blue-100 bg-white shadow-blue-100/50",
    warning: "border-amber-100 bg-white shadow-amber-100/50",
  };

  return (
    <div
      className={`pointer-events-auto flex min-w-[320px] max-w-md items-center gap-3 rounded-2xl border px-5 py-4 shadow-2xl animate-in slide-in-from-right-10 fade-in duration-300 ${colors[toast.type]}`}
    >
      <div className="flex-shrink-0">{icons[toast.type]}</div>
      <p className="flex-1 text-sm font-bold leading-tight text-slate-700">{toast.message}</p>
      <button
        onClick={onClose}
        className="p-1 text-slate-300 transition-colors hover:text-slate-500"
      >
        <X size={16} />
      </button>
    </div>
  );
};
