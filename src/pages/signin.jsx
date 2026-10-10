import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../hooks/useAuth";
import { usePageTitle } from "../hooks/usePageTitle";
import { validateCredentials } from "../utils/validate";

export default function SignIn() {
  const { session, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  usePageTitle("Sign in");

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
      await signIn(email.trim(), password);
      navigate(location.state?.from || "/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Sign In"
      description="Track your work. Across every device."
      error={error || location.state?.message}
      onSubmit={handleSubmit}
      loading={loading}
      submitLabel="Sign In"
      loadingLabel="Signing In..."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="auth-link">
            Sign Up
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
        autoComplete="current-password"
        placeholder="Enter your password"
        className="password-input"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        aria-label="Password"
        required
      />
    </AuthLayout>
  );
}
