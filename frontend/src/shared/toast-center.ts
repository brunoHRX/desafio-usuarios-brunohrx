import { ICustomElementViewModel } from 'aurelia';
import { notify, type Toast } from './notify';

export class ToastCenter implements ICustomElementViewModel {
  toasts: Toast[] = [];
  private unsub?: () => void;

  binding() {
    this.unsub = notify.subscribe(ts => this.toasts = ts);
  }
  detaching() { this.unsub?.(); }

  classes(kind: Toast['kind']) {
    
    const base = 'rounded px-3 py-2 shadow text-sm';
    if (kind === 'success') return `${base} bg-green-600 text-white`;
    if (kind === 'error')   return `${base} bg-red-600 text-white`;
    if (kind === 'warning') return `${base} bg-yellow-600 text-black`;
    return `${base} bg-slate-800 text-white`;
  }
}
