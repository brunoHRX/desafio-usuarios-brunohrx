/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

// test/user-dialog.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserDialog } from '../src/components/user-dialog';
import { api, ApiError } from '../src/services/api'; // não precisa do ApiError real aqui

vi.mock('../src/services/api', async (orig) => {
  const real = await (orig as any)();
  return {
    ...real,
    api: {
      post: vi.fn(),
      put: vi.fn(),
    },
    ApiError: real.ApiError,
  };
});

describe('UserDialog', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('exibe erros por campo vindos do backend (create)', async () => {
    const dlg = new UserDialog({} as any);
    dlg.mode = 'create';
    dlg.usuario = 'ab';         // válido (>= 2)
    dlg.email = 'x@x.com';
    dlg.senha = '12345678';

    // ⬇️ mocka um erro no formato que o componente consome
    (api.post as any).mockRejectedValue({
      status: 400,
      message: 'Erro de validação',
      problem: {
        title: 'Erros de validação',
        errors: {
          usuario: ['Usuário muito curto'],
          Email: ['E-mail inválido'],
        },
      },
    });

    await dlg.ok();

    expect(dlg.formError).toContain('Erros de validação');
    expect(dlg.fieldErrors.usuario).toBe('Usuário muito curto'); 
    expect(dlg.fieldErrors.email).toBe('E-mail inválido');       
    expect(dlg.saving).toBe(false);
  });
});
