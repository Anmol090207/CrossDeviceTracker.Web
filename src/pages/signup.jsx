import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../hooks/useAuth";
import { usePageTitle } from "../hooks/usePageTitle";
import { validateCredentials } from "../utils/validate";

export default function SignUp() {
  const { session, signUp } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  usePageTitle("Sign up");

  if (session) return <Navigate to="/" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    const message = validateCredentials(email, password);
    if (message) {
      setError(message);
      return;
    }
    setError("");
    setLoading(true);
    try {
      await signUp(email.trim(), password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Sign Up"
      description="Track your work. Across every device."
      error={error}
      onSubmit={handleSubmit}
      loading={loading}
      submitLabel="Sign Up"
      loadingLabel="Creating Account..."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/signin" className="auth-link">
            Sign In
          </Link>
        </>
      }
    >
      <input
        type="email"
        name="email"
        autoComplete="email"
        placeholder="Email Address"
        className="email-input"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        aria-label="Email address"
        required
      />
      <input
        type="password"
        name="password"
        autoComplete="new-password"
        placeholder="Create a password"
        className="password-input"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        aria-label="Password"
        required
      />
    </AuthLayout>
  );
}
