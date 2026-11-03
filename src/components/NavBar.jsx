import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContent } from "../context/content";
import { useTheme } from "../context/theme";
import { publicUrl } from "../lib/paths";
import { CloseIcon, MenuIcon, MoonIcon, SearchIcon, SunIcon } from "./Icons";

const PORTFOLIO_PATHS = ["/experience", "/skills", "/projects", "/research", "/extracurriculars"];

function isPortfolioPath(pathname) {
  return pathname === "/" || PORTFOLIO_PATHS.some((path) => pathname.startsWith(path));
}

const navItems = [
  { label: "Portfolio", to: "/", isActive: isPortfolioPath },
  { label: "Blog", to: "/blog", isActive: (pathname) => pathname.startsWith("/blog") },
  { label: "Contact", to: "/contact", isActive: (pathname) => pathname.startsWith("/contact") }
];

function isTypingTarget(target) {
  return target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
}

export default function NavBar() {
  const { profile: profileData } = useContent();
  const { theme, toggleTheme } = useTheme();
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname, search]);

  // "/" or Ctrl/Cmd+K opens search; Escape closes any open panel.
  useEffect(() => {
    function onKeyDown(event) {
      const shortcut = (event.key === "k" && (event.metaKey || event.ctrlKey)) || (event.key === "/" && !isTypingTarget(event.target));
      if (shortcut) {
        event.preventDefault();
        setSearchOpen(true);
      } else if (event.key === "Escape") {
        setSearchOpen(false);
        setMenuOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function submitSearch(event) {
    event.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      navigate(`/search?q=${encodeURIComponent(trimmed)}`);
      setQuery("");
    }
  }

  const themeLabel = theme === "dark" ? "Switch to light theme" : "Switch to dark theme";

  return (
    <header className="site-header">
      <nav className="container header-nav" aria-label="Primary">
        <div className="header-row">
          <div className="header-left">
            <Link to="/" className="brand">
              <span className="brand-mark" aria-hidden="true">
                {profileData.initials}
              </span>
              <span className="brand-name">{profileData.displayName}</span>
            </Link>
            <div className="nav-links">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`nav-link${item.isActive(pathname) ? " active" : ""}`}
                  aria-current={item.isActive(pathname) ? "page" : undefined}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="header-actions">
            <button
              type="button"
              className="icon-btn"
              onClick={() => setSearchOpen((open) => !open)}
              aria-label="Search"
              aria-expanded={searchOpen}
              title="Search (/)"
            >
              <SearchIcon />
            </button>
            <button type="button" className="icon-btn" onClick={toggleTheme} aria-label={themeLabel} title={themeLabel}>
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            </button>
            <a
              className="btn btn-primary btn-sm header-cta"
              href={publicUrl(profileData.resumeFile)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Resume
            </a>
            <button
              type="button"
              className="icon-btn menu-toggle"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="Menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              {menuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {searchOpen && (
          <form className="search-panel" role="search" onSubmit={submitSearch}>
            <label className="search-field">
              <SearchIcon />
              <span className="sr-only">Search the site</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search projects, posts, skills, pages..."
                autoFocus
              />
            </label>
          </form>
        )}

        {menuOpen && (
          <div className="mobile-menu" id="mobile-menu">
            {navItems.map((item) => (
              <Link key={item.to} to={item.to} className={`nav-link${item.isActive(pathname) ? " active" : ""}`}>
                {item.label}
              </Link>
            ))}
            <a
              className="btn btn-primary btn-block"
              href={publicUrl(profileData.resumeFile)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Resume
            </a>
          </div>
        )}
      </nav>
    </header>
  );
}
