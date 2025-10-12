import { ApiError } from '../services/api';
import { notify } from './notify';

export function showApiError(err: unknown, fallback: string) {
  if (!(err instanceof ApiError)) {
    notify.error(fallback);
    console.error('[api error] unknown:', err);
    return;
  }

  const s = err.status;
  const pb = err.problem;
  const title = pb?.title || err.message || fallback;

  if (s === 401) { notify.error('Sessão expirada. Faça login novamente.'); return; }
  if (s === 403) { notify.error('Permissão negada.'); return; }
  if (s === 404) { notify.error('Recurso não encontrado.'); return; }
  if (s === 409) {
    notify.warning('Conflito de concorrência. Recarregue e tente novamente.');
    return;
  }

  // Validações (ModelState) — exiba primeira mensagem amigável
  const firstModelError = pb?.errors && Object.values(pb.errors)[0]?.[0];
  if (firstModelError) { notify.error(firstModelError); return; }

  notify.error(title || fallback);
}
