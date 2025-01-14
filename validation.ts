export const validateUserInput = (userData: { name: string; email: string; password: string; birthDate: string }) => {
  const { password } = userData;
  const MAX_PASSWORD_LENGTH = 6;

  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d\s]+$/;
  if (!passwordRegex.test(password)) {
    throw new Error('Invalid password. The password must have at least 1 digit and 1 letter.');
  }

  if (password.length < MAX_PASSWORD_LENGTH) {
    throw new Error('Invalid password. The password must have at least 6 characters');
  }

  if (/\s/.test(password)) {
    throw new Error('Password must not contain spaces.');
  }
};
