import { IconClock, IconLaptop, IconLayers, IconPhone } from "./icons";

const ICONS = {
  clock: IconClock,
  phone: IconPhone,
  laptop: IconLaptop,
  layers: IconLayers,
};

export default function StatGrid({ stats }) {
  return (
    <section className="stat-grid" aria-label="Screen time summary">
      {stats.map((stat) => {
        const Icon = ICONS[stat.icon] || IconClock;
        return (
          <article className="stat-card" key={stat.id}>
            <div>
              <p className="stat-label">{stat.label}</p>
              <p className="stat-value">{stat.value}</p>
              <p className={`stat-hint is-${stat.tone || "neutral"}`}>{stat.hint}</p>
            </div>
            <span className={`stat-icon stat-icon--${stat.icon}`}>
              <Icon />
            </span>
          </article>
        );
      })}
    </section>
  );
}
