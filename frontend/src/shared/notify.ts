type ToastKind = 'success' | 'error' | 'info' | 'warning';

export type Toast = { id: number; kind: ToastKind; text: string; timeout: number };

let _id = 1;
const listeners = new Set<(toasts: Toast[]) => void>();
let toasts: Toast[] = [];

export const notify = {
  subscribe(cb: (toasts: Toast[]) => void) { listeners.add(cb); cb(toasts); return () => listeners.delete(cb); },
  push(kind: ToastKind, text: string, timeout = 4000) {
    const t: Toast = { id: _id++, kind, text, timeout };
    toasts = [...toasts, t]; listeners.forEach(cb => cb(toasts));
    setTimeout(() => { toasts = toasts.filter(x => x.id !== t.id); listeners.forEach(cb => cb(toasts)); }, timeout);
  },
  success: (t: string, ms?: number) => notify.push('success', t, ms),
  error:   (t: string, ms?: number) => notify.push('error',   t, ms),
  info:    (t: string, ms?: number) => notify.push('info',    t, ms),
  warning: (t: string, ms?: number) => notify.push('warning', t, ms),
};
