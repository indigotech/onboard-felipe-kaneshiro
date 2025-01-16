import { CustomError } from "./errors/format-error";

export const validateUserInput = (userData: { name: string; email: string; password: string; birthDate: string }) => {
  const { password } = userData;
  const MAX_PASSWORD_LENGTH = 6;

  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d\s]+$/;
  if (!passwordRegex.test(password)) {
    throw new CustomError(
      'Senha inválida',
      400,
      "A senha deve conter pelo menos 1 letra e 1 número."
    );
  }

  if (password.length < MAX_PASSWORD_LENGTH) {
    throw new CustomError(
      "Senha inválida",
      400,
      "A senha deve conter pelo menos 6 caracteres."
    );
  }

  if (/\s/.test(password)) {
    throw new CustomError(
      "Senha inválida",
      400,
      "A senha não deve conter espaços."
    );
  }
};
