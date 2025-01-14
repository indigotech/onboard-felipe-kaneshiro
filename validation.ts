export const validateUserInput = (userData: { name: string; email: string; password: string; birthDate: string }) => {
  const { password } = userData;

  //Password conditions validation
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d\s]+$/;
  if (!passwordRegex.test(password)) {
    throw new Error('Invalid password. The password must have at least 1 digit and 1 letter.');
  }

  //Password length validation
  if (password.length < 6) {
    throw new Error('Invalid password. The password must have at least 6 characters');
  }

  //No spaces key on password validation
  if (/\s/.test(password)) {
    throw new Error('Password must not contain spaces.');
  }
};
