import { LogoMark } from "./icons";
import "../css/auth.css";

export default function AuthLayout({
  title,
  description,
  error,
  footer,
  onSubmit,
  loading,
  submitLabel,
  loadingLabel,
  children,
}) {
  return (
    <div className="auth-page">
      <div className="auth-visual">
        <div className="auth-visual-content">
          <div className="auth-brand">
            <LogoMark />
            <strong>CrossTime</strong>
          </div>
          <h2>
            Every device, <span>one timeline.</span>
          </h2>
          <p>
            See exactly where your time goes across your phone, laptop, and tablet — synced
            automatically, all in one place.
          </p>
        </div>
      </div>
      <div className="auth-panel">
        <form onSubmit={onSubmit} className="auth-form" noValidate>
          <LogoMark />
          <h1>{title}</h1>
          <p className="auth-description">{description}</p>
          {error && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}
          {children}
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? loadingLabel : submitLabel}
          </button>
          <p className="auth-switch">{footer}</p>
        </form>
      </div>
    </div>
  );
}
