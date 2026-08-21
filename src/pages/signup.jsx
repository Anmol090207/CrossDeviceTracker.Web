import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signUp } from "../services/api";
import { signIn } from "../services/api";
import "../css/auth.css";

function SignUp() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }

    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password);

      const data = await signIn(email, password);

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("email", data.email);

      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <div className="auth-visual-content">
          <h2>
            Every device, <span>one timeline.</span>
          </h2>
          <p>
            See exactly where your time goes across your phone, laptop, and
            tablet — synced automatically, all in one place.
          </p>
        </div>
      </div>
      <div className="signUp">
        <form onSubmit={handleSubmit} className="signUp-form" noValidate>
          {/* Logo Placeholder */}
          <div className="logo-placeholder"></div>

          <h1>Sign Up</h1>

          <p className="auth-description">
            Track your work. Across every device.
          </p>

          {error && <p className="error-message">{error}</p>}

          <input
            type="email"
            placeholder="Email Address"
            className="email-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Create a password"
            className="password-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Creating Account..." : "Sign Up"}
          </button>

          <p className="auth-switch">
            Already have an account?{" "}
            <Link to="/signin" className="auth-link">
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default SignUp;
