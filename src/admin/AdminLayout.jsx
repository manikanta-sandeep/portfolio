import { Suspense } from "react";
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { COLLECTION_SCHEMAS } from "../../shared/contentSchema.js";
import {
  ChartIcon,
  ClipboardIcon,
  CogIcon,
  ExternalLinkIcon,
  InboxIcon,
  LogoutIcon,
  NewspaperIcon,
  TrendingUpIcon,
  UserIcon
} from "../components/Icons";
import Seo from "../components/Seo";
import { useAuth } from "../context/auth";
import { useContent } from "../context/content";
import "./admin.css";

const mainLinks = [
  { to: "/admin", label: "Dashboard", Icon: ChartIcon, end: true },
  { to: "/admin/analytics", label: "Analytics", Icon: TrendingUpIcon },
  { to: "/admin/posts", label: "Blog posts", Icon: NewspaperIcon },
  { to: "/admin/profile", label: "Profile", Icon: UserIcon },
  { to: "/admin/messages", label: "Messages", Icon: InboxIcon },
  { to: "/admin/notes", label: "Notes & Files", Icon: ClipboardIcon }
];

export function AdminSpinner() {
  return (
    <div className="admin-loading" role="status">
      <span className="spinner" aria-hidden="true" />
      <span className="sr-only">Loading</span>
    </div>
  );
}

export default function AdminLayout() {
  const { user, ready, logout } = useAuth();
  const { profile, source } = useContent();
  const location = useLocation();
  const navigate = useNavigate();

  if (!ready) {
    return <AdminSpinner />;
  }
  if (!user) {
    return <Navigate to={`/admin/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // Leave the admin area first; clearing the user while still here would bounce to the
  // sign-in page instead of the site.
  function signOut() {
    navigate("/", { replace: true });
    logout();
  }

  return (
    <div className="admin-shell">
      <Seo title="Admin" path={location.pathname} noindex />
      <aside className="admin-sidebar">
        <Link to="/admin" className="brand">
          <span className="brand-mark brand-mark-sm" aria-hidden="true">
            {profile.initials}
          </span>
          <span className="admin-brand-text">Admin</span>
        </Link>
        <nav className="admin-nav" aria-label="Admin">
          {mainLinks.map(({ to, label, Icon, end }) => (
            <NavLink key={to} to={to} end={end} className="admin-nav-link">
              <Icon />
              {label}
            </NavLink>
          ))}
          <p className="admin-nav-heading">Sections</p>
          {Object.entries(COLLECTION_SCHEMAS).map(([name, schema]) => (
            <NavLink key={name} to={`/admin/sections/${name}`} className="admin-nav-link admin-nav-sub">
              {schema.label}
            </NavLink>
          ))}
          <p className="admin-nav-heading">Account</p>
          <NavLink to="/admin/account" className="admin-nav-link">
            <CogIcon />
            Password
          </NavLink>
        </nav>
        <div className="admin-sidebar-foot">
          <p className="muted small">Signed in as {user.username}</p>
          <div className="button-row">
            <Link className="btn btn-secondary btn-sm" to="/">
              <ExternalLinkIcon />
              View site
            </Link>
            <button type="button" className="btn btn-secondary btn-sm" onClick={signOut}>
              <LogoutIcon />
              Sign out
            </button>
          </div>
        </div>
      </aside>
      <main id="content" className="admin-main">
        {source !== "api" && (
          <p className="admin-banner" role="alert">
            The public site couldn&apos;t load content from the API and is showing the built-in copy. Changes saved here
            still go to the database.
          </p>
        )}
        <Suspense fallback={<AdminSpinner />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
