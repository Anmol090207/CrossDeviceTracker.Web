import { formatDuration } from "../utils/time";
import { EmptyState } from "./Feedback";

export default function DailyChart({ days, emptyTitle = "No totals yet.", emptyDetail = "Bars appear after the analytics endpoint returns usage." }) {
  const peak = Math.max(1, ...days.map((day) => day.seconds));
  if (!days.length || days.every((day) => !day.seconds)) {
    return <EmptyState title={emptyTitle} detail={emptyDetail} />;
  }

  return (
    <div className="daily-chart" role="img" aria-label="Daily screen time">
      {days.map((day) => (
        <div className="daily-col" key={day.date}>
          <div className="daily-bar-wrap">
            <span
              className="daily-bar"
              style={{ height: `${Math.max(4, (day.seconds / peak) * 100)}%` }}
              title={`${day.label}: ${formatDuration(day.seconds)}`}
            />
          </div>
          <span className="daily-label">{day.label}</span>
        </div>
      ))}
    </div>
  );
}
