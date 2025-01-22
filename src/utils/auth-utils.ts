import { CustomError } from '../errors/format-error';

export function validateAuth(user: string | null): void {
  if (!user) {
    throw new CustomError('Usuário não autenticado ou tempo de login expirado.', 401, 'Faça login para continuar.');
  }
}
