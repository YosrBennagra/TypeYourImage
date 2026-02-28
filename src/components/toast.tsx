import {
    useCallback,
    useMemo,
    useState,
    type ReactNode,
} from 'react';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';
import { ToastContext } from '../lib/toast-context';

/* ── Types ──────────────────────────────────────────────────── */

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    readonly id: number;
    readonly message: string;
    readonly type: ToastType;
}

let toastId = 0;

export function ToastProvider({ children }: { readonly children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = ++toastId;
        setToasts((prev) => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    }, []);

    const removeToast = useCallback((id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const contextValue = useMemo(() => ({ toast: addToast }), [addToast]);

    return (
        <ToastContext.Provider value={contextValue}>
            {children}

            {/* Toast container */}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
                {toasts.map((t) => (
                    <ToastItem key={t.id} toast={t} onDismiss={() => removeToast(t.id)} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

/* ── Toast item ─────────────────────────────────────────────── */

const ICON_MAP: Record<ToastType, ReactNode> = {
    success: <FiCheckCircle className="w-4 h-4 text-neon-green" />,
    error: <FiAlertCircle className="w-4 h-4 text-red-400" />,
    info: <FiInfo className="w-4 h-4 text-neon-cyan" />,
};

const BG_MAP: Record<ToastType, string> = {
    success: 'border-neon-green/20 bg-neon-green/[0.04]',
    error: 'border-red-400/20 bg-red-400/[0.04]',
    info: 'border-neon-cyan/20 bg-neon-cyan/[0.04]',
};

function ToastItem({
    toast,
    onDismiss,
}: {
    readonly toast: Toast;
    readonly onDismiss: () => void;
}) {
    return (
        <div
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-lg animate-toast-in ${BG_MAP[toast.type]}`}
            role="alert"
        >
            {ICON_MAP[toast.type]}
            <span className="text-sm text-zinc-200 max-w-[260px]">{toast.message}</span>
            <button
                type="button"
                onClick={onDismiss}
                className="ml-1 text-zinc-600 hover:text-zinc-300 transition-colors"
                aria-label="Dismiss"
            >
                <FiX className="w-3.5 h-3.5" />
            </button>
        </div>
    );
}
