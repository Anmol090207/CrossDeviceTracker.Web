import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  IconChart,
  IconClose,
  IconDownload,
  IconMenu,
  IconPhone,
  IconSettings,
  IconTimeline,
  LogoMark,
} from "./icons";

const NAV = [
  { to: "/", label: "Dashboard", icon: IconChart, end: true },
  { to: "/devices", label: "Devices", icon: IconPhone },
  { to: "/timeline", label: "Timeline", icon: IconTimeline },
  { to: "/reports", label: "Reports", icon: IconDownload },
  { to: "/settings", label: "Settings", icon: IconSettings },
];

export default function AppShell() {
  const { session, signOut } = useAuth();
  const location = useLocation();
  const [openPath, setOpenPath] = useState(null);
  const open = openPath === location.pathname;

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <button
        type="button"
        className="nav-toggle"
        aria-label="Open navigation"
        onClick={() => setOpenPath(location.pathname)}
      >
        <IconMenu />
      </button>
      {open && <button type="button" className="nav-backdrop" aria-label="Close navigation" onClick={() => setOpenPath(null)} />}
      <aside className={`sidebar ${open ? "is-open" : ""}`}>
        <div className="sidebar-top">
          <NavLink to="/" className="brand" onClick={() => setOpenPath(null)}>
            <LogoMark />
            <span>CrossTime</span>
          </NavLink>
          <button type="button" className="sidebar-close" aria-label="Close navigation" onClick={() => setOpenPath(null)}>
            <IconClose />
          </button>
        </div>
        <nav className="sidebar-nav" aria-label="Primary">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `nav-link${isActive ? " is-active" : ""}`}
              >
                <Icon />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          {session ? (
            <>
              <span className="sidebar-email" title={session.email}>
                {session.email}
              </span>
              <button type="button" className="text-button" onClick={signOut}>
                Sign out
              </button>
            </>
          ) : (
            <NavLink to="/signin" className="text-button">
              Sign in
            </NavLink>
          )}
        </div>
      </aside>
      <main id="main" className="app-main">
        {import.meta.env.VITE_TEST_MODE === "true" && (
          <p className="test-banner">Local test API. The Azure backend is not being used.</p>
        )}
        <Outlet />
      </main>
    </div>
  );
}
