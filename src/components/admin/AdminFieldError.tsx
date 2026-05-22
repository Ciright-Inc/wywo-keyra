export function AdminFieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-700">{message}</p>;
}

export function fieldClass(base: string, hasError: boolean): string {
  return hasError
    ? `${base} border-red-500/50 ring-1 ring-red-500/20 focus-visible:border-red-500/60`
    : base;
}
