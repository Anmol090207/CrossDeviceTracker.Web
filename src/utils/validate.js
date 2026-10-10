const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateCredentials(email, password) {
  if (!email.trim()) return "Please enter your email address.";
  if (!EMAIL_PATTERN.test(email.trim())) return "Please enter a valid email address.";
  if (!password) return "Please enter your password.";
  return "";
}
