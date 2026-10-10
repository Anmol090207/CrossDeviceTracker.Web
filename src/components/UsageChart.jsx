import { useId, useState } from "react";
import { formatDuration, formatHour } from "../utils/time";

const WIDTH = 640;
const HEIGHT = 268;
const PAD = { top: 18, right: 16, bottom: 32, left: 54 };

function cropHours(hours) {
  if (!hours?.length) return [];
  const hasValue = (point) => point.mobileSeconds || point.desktopSeconds || point.overlapSeconds;
  let start = hours.findIndex(hasValue);
  if (start === -1) return hours.filter((point) => point.hour >= 7 && point.hour <= 17);
  let end = hours.length - 1;
  while (end > start && !hasValue(hours[end])) end -= 1;
  start = Math.max(0, start - 1);
  end = Math.min(hours.length - 1, end + 1);
  return hours.slice(start, end + 1);
}

function niceMax(points) {
  const peak = Math.max(
    45 * 60,
    ...points.map((point) => Math.max(point.mobileSeconds, point.desktopSeconds, point.overlapSeconds)),
  );
  const step = 45 * 60;
  return Math.ceil(peak / step) * step;
}

function smoothPath(points) {
  if (!points.length) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let index = 0; index < points.length - 1; index += 1) {
    const current = points[index];
    const next = points[index + 1];
    const mid = (current.x + next.x) / 2;
    path += ` C ${mid} ${current.y}, ${mid} ${next.y}, ${next.x} ${next.y}`;
  }
  return path;
}

function seriesPoints(hours, key, xFor, yFor) {
  return hours.map((point) => ({
    hour: point.hour,
    x: xFor(point.hour),
    y: yFor(point[key]),
  }));
}

export default function UsageChart({ hourly, mode = "split" }) {
  const gradientId = useId().replace(/:/g, "");
  const points = cropHours(hourly);
  const [hovered, setHovered] = useState(null);
  const max = niceMax(points.length ? points : [{ mobileSeconds: 0, desktopSeconds: 0, overlapSeconds: 0 }]);
  const plotWidth = WIDTH - PAD.left - PAD.right;
  const plotHeight = HEIGHT - PAD.top - PAD.bottom;
  const firstHour = points[0]?.hour ?? 7;
  const lastHour = points.at(-1)?.hour ?? 17;
  const span = Math.max(1, lastHour - firstHour);

  const xFor = (hour) => PAD.left + ((hour - firstHour) / span) * plotWidth;
  const yFor = (seconds) => PAD.top + (1 - seconds / max) * plotHeight;
  const baseline = PAD.top + plotHeight;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => max * ratio);

  const desktop = seriesPoints(points, "desktopSeconds", xFor, yFor);
  const mobile = seriesPoints(points, "mobileSeconds", xFor, yFor);
  const preferred = points.findIndex((point) => point.hour === 10);
  const activeIndex = hovered ?? (preferred >= 0 ? preferred : Math.floor(points.length / 2));
  const active = points[activeIndex];

  function area(series) {
    if (!series.length) return "";
    return `${smoothPath(series)} L ${series.at(-1).x} ${baseline} L ${series[0].x} ${baseline} Z`;
  }

  function onMove(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - rect.left) / rect.width;
    const hour = firstHour + ratio * span;
    let nearest = 0;
    let best = Infinity;
    points.forEach((point, index) => {
      const distance = Math.abs(point.hour - hour);
      if (distance < best) {
        best = distance;
        nearest = index;
      }
    });
    setHovered(nearest);
  }

  return (
    <section className="panel chart-panel">
      <header className="panel-header chart-header">
        <h2>Usage Timeline</h2>
        <ul className="legend">
          <li><i className="legend-dot is-mobile" /> {mode === "split" ? "Mobile" : "Screen time"}</li>
          {mode === "split" && <li><i className="legend-dot is-desktop" /> Desktop</li>}
          {mode === "split" && <li><i className="legend-dot is-overlap" /> Overlap</li>}
        </ul>
      </header>
      <div className="chart-frame">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-label="Hourly mobile, desktop, and overlap screen time"
          onMouseMove={onMove}
          onMouseLeave={() => setHovered(null)}
        >
          <defs>
            <linearGradient id={`${gradientId}-mobile`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.35" />
            </linearGradient>
            <linearGradient id={`${gradientId}-desktop`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.72" />
              <stop offset="100%" stopColor="#c4b5fd" stopOpacity="0.28" />
            </linearGradient>
          </defs>
          {ticks.map((tick) => (
            <g key={tick}>
              <line
                x1={PAD.left}
                x2={WIDTH - PAD.right}
                y1={yFor(tick)}
                y2={yFor(tick)}
                stroke="#eef1f5"
              />
              <text x={PAD.left - 10} y={yFor(tick) + 4} textAnchor="end" className="chart-label">
                {formatDuration(tick)}
              </text>
            </g>
          ))}
          {points.map((point) => (
            <line
              key={point.hour}
              x1={xFor(point.hour)}
              x2={xFor(point.hour)}
              y1={PAD.top}
              y2={baseline}
              stroke="#e7ebf0"
              strokeDasharray="3 4"
            />
          ))}
          {mode === "split" && (
            <path d={area(desktop)} fill={`url(#${gradientId}-desktop)`} stroke="#8b5cf6" strokeWidth="2" />
          )}
          <path d={area(mobile)} fill={`url(#${gradientId}-mobile)`} stroke="#3b82f6" strokeWidth="2" />
          {mode === "split" &&
            points.map((point) => (
              <circle
                key={`overlap-${point.hour}`}
                cx={xFor(point.hour)}
                cy={yFor(point.overlapSeconds)}
                r="3.2"
                fill="#fb923c"
              />
            ))}
          {active && (
            <line
              x1={xFor(active.hour)}
              x2={xFor(active.hour)}
              y1={PAD.top}
              y2={baseline}
              stroke="#94a3b8"
              strokeDasharray="2 3"
            />
          )}
        </svg>
        {active && (
          <div
            className="chart-tooltip"
            style={{
              left: `${((xFor(active.hour) / WIDTH) * 100).toFixed(2)}%`,
              top: `${((yFor(Math.max(active.mobileSeconds, active.desktopSeconds)) / HEIGHT) * 100).toFixed(2)}%`,
              transform: activeIndex > points.length * 0.62 ? "translate(-108%, -70%)" : "translate(12px, -70%)",
            }}
          >
            <strong>{formatHour(active.hour)}</strong>
            <p className="is-mobile">{mode === "split" ? "Mobile" : "Screen time"}: {formatDuration(active.mobileSeconds)}</p>
            {mode === "split" && <p className="is-desktop">Desktop: {formatDuration(active.desktopSeconds)}</p>}
            {mode === "split" && <p className="is-overlap">Overlap: {formatDuration(active.overlapSeconds)}</p>}
          </div>
        )}
      </div>
      <table className="sr-only">
        <caption>Usage by hour</caption>
        <thead>
          <tr>
            <th>Hour</th>
            <th>Mobile</th>
            <th>Desktop</th>
            <th>Overlap</th>
          </tr>
        </thead>
        <tbody>
          {points.map((point) => (
            <tr key={point.hour}>
              <td>{formatHour(point.hour)}</td>
              <td>{formatDuration(point.mobileSeconds)}</td>
              <td>{formatDuration(point.desktopSeconds)}</td>
              <td>{formatDuration(point.overlapSeconds)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
