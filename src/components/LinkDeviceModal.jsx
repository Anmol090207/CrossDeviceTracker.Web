import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { createLinkToken } from "../services/api";
import { pick } from "../utils/object";
import { IconClose } from "./icons";

export default function LinkDeviceModal({ open, onClose }) {
  const { session } = useAuth();
  const [link, setLink] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    function onKeyDown(event) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  async function generate() {
    setError("");
    setCopied(false);
    if (!session) {
      setError("Sign in to generate a device link token.");
      return;
    }
    setLoading(true);
    try {
      const payload = await createLinkToken();
      setLink({
        token: pick(payload, "token", "Token") || "",
        expiresAt: pick(payload, "expiresAt", "ExpiresAt") || "",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function copyToken() {
    if (!link?.token) return;
    try {
      await navigator.clipboard.writeText(link.token);
      setCopied(true);
    } catch {
      setError("Could not copy the token. Select it and copy it manually.");
    }
  }

  const expires = link?.expiresAt ? new Date(link.expiresAt) : null;
  const expiryLabel =
    expires && !Number.isNaN(expires.getTime())
      ? expires.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
      : "";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="device-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="link-device-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="device-modal-header">
          <h2 id="link-device-title">Link New Device</h2>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close">
            <IconClose />
          </button>
        </header>
        <p className="device-modal-copy">
          Generate a temporary token and enter it in the desktop application.
        </p>
        {error && (
          <p className="error-message" role="alert">
            {error} {!session && <Link to="/signin">Sign in</Link>}
          </p>
        )}
        <button type="button" className="btn-primary" onClick={generate} disabled={loading}>
          {loading ? "Generating…" : "Generate Device Token"}
        </button>
        {link?.token && (
          <div className="token-block">
            <h3>Device Token</h3>
            <p className="token-value">{link.token}</p>
            {expiryLabel && <p className="token-expiry">Expires: {expiryLabel}</p>}
            <button type="button" className="btn-secondary" onClick={copyToken}>
              {copied ? "Copied" : "Copy Token"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
