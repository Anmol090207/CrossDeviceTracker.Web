import { IconSync } from "./icons";

export default function SyncChip({ sync, loading, onRefresh }) {
  const state = loading ? "loading" : sync?.state || "empty";
  const label = loading ? "Syncing…" : sync?.label || "Sync";

  return (
    <button type="button" className={`sync-chip sync-chip--${state}`} onClick={onRefresh} disabled={loading}>
      <IconSync className={loading ? "spin" : ""} />
      {label}
    </button>
  );
}
