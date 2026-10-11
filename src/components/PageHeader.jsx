import { usePageTitle } from "../hooks/usePageTitle";

export default function PageHeader({ title, subtitle, children }) {
  usePageTitle(title);
  return (
    <header className="page-header">
      <div className="page-heading">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {children && <div className="page-header-actions">{children}</div>}
    </header>
  );
}
