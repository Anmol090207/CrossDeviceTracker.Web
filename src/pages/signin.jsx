import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signIn } from "../services/api";
import "../css/auth.css";

function SignIn() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
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
      <div className="signIn">
        <form onSubmit={handleSubmit} className="signIn-form">
          <div className="logo-placeholder"></div>

          <h1>Sign In</h1>

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
            placeholder="Enter your password"
            className="password-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>

          <p className="auth-switch">
            Don't have an account?{" "}
            <Link to="/signup" className="auth-link">
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default SignIn;
