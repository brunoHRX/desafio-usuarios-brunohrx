// Resumo do usuário (saída do backend)
export type UserSummary = {
  id: number;
  usuario: string;
  email: string;
  ativo: boolean;
  /** Token de controle de concorrência (vindo como base64 do backend) */
  rowVersion: string;
};

// Payload para criação (POST /users)
export type UserCreateDto = {
  usuario: string;
  email: string;
  senha: string;
};

// Payload para atualização (PUT /users/{id})
export type UserUpdateDto = {
  usuario?: string;
  email?: string;
  ativo?: boolean;
  /** RowVersion atual (base64) — obrigatório no PUT */
  rowVersion: string;
};

// Paginação genérica
export type PagedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};
