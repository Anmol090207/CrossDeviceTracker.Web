import { formatDayLabel, formatDuration, formatRelative } from "../utils/time";
import { EmptyState } from "./Feedback";
import { FormFactorIcon, IconCheck, IconInfo, IconTimeline } from "./icons";

function ActivityIcon({ item }) {
  if (item.kind === "sync") {
    return (
      <span className="activity-icon is-sync">
        <IconCheck />
      </span>
    );
  }
  return (
      <span className="activity-icon is-session">
        <IconTimeline />
      </span>
  );
}

function ActivityItem({ item }) {
  return (
    <li className="activity-item">
      <div className="activity-rail">
        <ActivityIcon item={item} />
      </div>
      <div className="activity-body">
        <div className="activity-top">
          <h3>{item.title}</h3>
          <time dateTime={item.at}>{formatRelative(item.at)}</time>
        </div>
        <p className="activity-meta">
          <FormFactorIcon formFactor={item.formFactor} />
          <span>{item.deviceName}</span>
          {item.kind === "session" && (
            <>
              <span className="meta-gap">Duration: {formatDuration(item.durationSeconds)}</span>
              <span className="meta-gap">App: {item.appName}</span>
            </>
          )}
        </p>
      </div>
    </li>
  );
}

export function ActivityHeader({ title = "Activity Timeline" }) {
  return (
    <header className="panel-header">
      <h2>{title}</h2>
      <p className="overlap-note">
        <IconInfo />
        Overlap periods automatically detected
      </p>
    </header>
  );
}

export default function ActivityList({ items, grouped = false }) {
  if (!items.length) {
    return <EmptyState title="No activity in this range." detail="Sessions appear here after a device syncs." />;
  }

  if (!grouped) {
    return (
      <ol className="activity-list">
        {items.map((item) => (
          <ActivityItem key={item.id} item={item} />
        ))}
      </ol>
    );
  }

  const groups = [];
  for (const item of items) {
    const label = formatDayLabel(item.at);
    const last = groups.at(-1);
    if (!last || last.label !== label) groups.push({ label, items: [item] });
    else last.items.push(item);
  }

  return (
    <div className="activity-groups">
      {groups.map((group) => (
        <section key={group.label}>
          <h3 className="activity-day">{group.label}</h3>
          <ol className="activity-list">
            {group.items.map((item) => (
              <ActivityItem key={item.id} item={item} />
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
