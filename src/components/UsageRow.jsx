import { formatDuration, formatPercent } from "../utils/time";

export default function UsageRow({ color, title, seconds, percentage, meta }) {
  const width = Math.max(0, Math.min(100, percentage || 0));
  return (
    <article className="usage-row">
      <span className="usage-swatch" style={{ background: color }} />
      <div className="usage-main">
        <div className="usage-top">
          <h3>{title}</h3>
          <span>{formatDuration(seconds)}</span>
        </div>
        <div className="usage-bar-row">
          <div className="usage-track" aria-hidden="true">
            <span className="usage-fill" style={{ width: `${width}%` }} />
          </div>
          <span className="usage-percent">{formatPercent(percentage)}</span>
        </div>
        {meta && <p className="usage-meta">{meta}</p>}
      </div>
    </article>
  );
}
