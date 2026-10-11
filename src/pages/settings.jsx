import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import { useAuth } from "../hooks/useAuth";

export default function Settings() {
  const { session, signOut } = useAuth();

  return (
    <section className="page">
      <PageHeader title="Settings" subtitle="Account and session" />
      <div className="settings-grid">
        <article className="panel settings-card">
          <h2>Account</h2>
          {session ? (
            <>
              <dl className="settings-list">
                <div>
                  <dt>Email</dt>
                  <dd>{session.email}</dd>
                </div>
                <div>
                  <dt>Session</dt>
                  <dd>Signed in on this browser</dd>
                </div>
              </dl>
              <p className="settings-note">
                Profile and password updates will connect here when the API exposes them.
              </p>
            </>
          ) : (
            <p className="settings-note">
              You are viewing sample data. <Link to="/signin">Sign in</Link> to load your account.
            </p>
          )}
        </article>
        <article className="panel settings-card">
          <h2>Devices</h2>
          <p className="settings-note">
            Link a phone, laptop, or tablet with a one-time token, then paste it into the desktop app.
          </p>
          <Link className="btn-primary settings-link" to="/devices">
            Manage devices
          </Link>
        </article>
        <article className="panel settings-card">
          <h2>Session</h2>
          <p className="settings-note">Signing out removes the access token stored in this browser.</p>
          <button type="button" className="btn-secondary" onClick={signOut} disabled={!session}>
            Sign out
          </button>
        </article>
      </div>
    </section>
  );
}
