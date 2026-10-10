import { Link } from "react-router-dom";

export function SampleNotice() {
  return (
    <p className="sample-notice">
      Sample data. <Link to="/signin">Sign in</Link> to load your account from the API.
    </p>
  );
}

export function ErrorBanner({ message, onRetry }) {
  return (
    <div className="error-banner" role="alert">
      <p>{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, detail, action }) {
  return (
    <div className="empty-state">
      <p className="empty-title">{title}</p>
      {detail && <p>{detail}</p>}
      {action}
    </div>
  );
}

export function StatSkeleton() {
  return (
    <div className="stat-grid" aria-hidden="true">
      {Array.from({ length: 4 }, (_, index) => (
        <div className="stat-card skeleton-card" key={index}>
          <span className="skeleton skeleton-line" />
          <span className="skeleton skeleton-value" />
          <span className="skeleton skeleton-line short" />
        </div>
      ))}
    </div>
  );
}
