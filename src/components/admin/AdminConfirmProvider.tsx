"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/components/ui/cn";

type ConfirmRequest = {
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
};

type ParsedConfirm = {
  title: string;
  description: string;
};

type AdminConfirmContextValue = {
  confirm: (request: string | ConfirmRequest) => Promise<boolean>;
};

const AdminConfirmContext = createContext<AdminConfirmContextValue | null>(null);

function parseConfirmMessage(message: string): ParsedConfirm {
  const quotes = [...message.matchAll(/"([^"]+)"/g)].map((match) => match[1]);

  if (message.includes("Move apps to") && quotes.length >= 2) {
    return {
      title: "Delete category?",
      description: `"${quotes[1]}" will be deleted and apps will move to "${quotes[0]}". This cannot be undone.`,
    };
  }

  const bulkMatch = message.match(/^Delete (\d+) selected (\w+)\?$/);
  if (bulkMatch) {
    const count = bulkMatch[1];
    const noun = bulkMatch[2];
    return {
      title: `Delete ${count} ${noun}?`,
      description: `${count} ${noun} will be deleted. This cannot be undone.`,
    };
  }

  const removeMatch = message.match(/^Remove "([^"]+)" from admin users\?$/);
  if (removeMatch) {
    return {
      title: "Remove admin user?",
      description: `"${removeMatch[1]}" will be removed. This cannot be undone.`,
    };
  }

  const typedMatch = message.match(/^Delete ([^"]+?) "([^"]+)"\?$/);
  if (typedMatch) {
    const subject = typedMatch[1].trim();
    const name = typedMatch[2];
    const label = subject === "rule for" ? "access rule" : subject;
    return {
      title: `Delete ${label}?`,
      description: `"${name}" will be deleted. This cannot be undone.`,
    };
  }

  if (quotes[0]) {
    return {
      title: "Delete?",
      description: `"${quotes[0]}" will be deleted. This cannot be undone.`,
    };
  }

  if (message.toLowerCase().includes("set weight")) {
    return {
      title: "Apply weight change?",
      description: "All country weights will be set to 5.",
    };
  }

  return {
    title: message.endsWith("?") ? message : `${message}?`,
    description: "This cannot be undone.",
  };
}

function isDestructiveAction(request: ConfirmRequest): boolean {
  const label = (request.confirmLabel ?? "Delete").toLowerCase();
  return label.includes("delete") || label.includes("remove");
}

function TrashIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function ConfirmDialog({
  request,
  onCancel,
  onConfirm,
}: {
  request: ConfirmRequest;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const parsed = parseConfirmMessage(request.message);
  const destructive = isDestructiveAction(request);

  return (
    <motion.div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="admin-confirm-title"
      aria-describedby="admin-confirm-desc"
      className="relative w-[min(92vw,440px)] rounded-xl bg-white p-6 text-[#111111] shadow-[0_10px_38px_rgba(0,0,0,0.14)]"
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.98 }}
      transition={{ duration: 0.18 }}
      onClick={(event) => event.stopPropagation()}
    >
      <div className="flex items-start gap-4">
        <div className={cn("shrink-0 pt-0.5", destructive ? "text-red-500" : "text-keyra-primary")}>
          {destructive ? <TrashIcon /> : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
              <path d="M12 8v5M12 16h.01" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h2 id="admin-confirm-title" className="text-[15px] font-bold leading-snug text-[#111111]">
            {parsed.title}
          </h2>
          <p id="admin-confirm-desc" className="mt-1.5 text-[14px] leading-relaxed text-[#111111]">
            {parsed.description}
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-1">
        <button
          type="button"
          className="rounded-lg px-4 py-2 text-sm font-semibold text-[#111111] transition hover:bg-black/[0.04]"
          onClick={onCancel}
        >
          {request.cancelLabel ?? "Cancel"}
        </button>
        <button
          type="button"
          className={cn(
            "rounded-lg px-4 py-2 text-sm font-medium text-white transition",
            destructive
              ? "bg-red-500 hover:bg-red-600 active:bg-red-700"
              : "bg-[#111111] hover:bg-[#1a1a1a]",
          )}
          onClick={onConfirm}
        >
          {request.confirmLabel ?? "Delete"}
        </button>
      </div>
    </motion.div>
  );
}

export function AdminConfirmProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [request, setRequest] = useState<ConfirmRequest>({ message: "" });
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((input: string | ConfirmRequest) => {
    const req = typeof input === "string" ? { message: input } : input;
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
      setRequest(req);
      setOpen(true);
    });
  }, []);

  function close(result: boolean) {
    setOpen(false);
    resolveRef.current?.(result);
    resolveRef.current = null;
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <AdminConfirmContext.Provider value={{ confirm }}>
      {children}
      {mounted
        ? createPortal(
            <AnimatePresence>
              {open ? (
                <motion.div
                  className="fixed inset-0 z-[200] flex items-center justify-center p-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <button
                    type="button"
                    aria-label="Close dialog backdrop"
                    className="absolute inset-0 bg-black/40"
                    onClick={() => close(false)}
                  />
                  <ConfirmDialog
                    request={request}
                    onCancel={() => close(false)}
                    onConfirm={() => close(true)}
                  />
                </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </AdminConfirmContext.Provider>
  );
}

export function useAdminConfirm() {
  const ctx = useContext(AdminConfirmContext);
  if (!ctx) {
    throw new Error("useAdminConfirm must be used within AdminConfirmProvider");
  }
  return ctx.confirm;
}
