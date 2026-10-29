export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d\s]).{8,}$/;

export const PASSWORD_MESSAGE =
  'Password must contain lowercase, uppercase, number, and special character, and at least 8 characters';
