import { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/auth";
import { useContent } from "../context/content";
import { setTracking, trackPageview } from "../lib/analytics";
import ContactWidget from "./ContactWidget";
import NavBar from "./NavBar";
import SiteFooter from "./SiteFooter";

// Client-side navigation keeps the old scroll position, so reset it on page changes and
// honour #fragments (including same-page links such as blog pagination).
function useScrollManagement() {
  const { pathname, search, hash } = useLocation();
  const previousPath = useRef(pathname);

  useEffect(() => {
    const target = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
    if (target) {
      target.scrollIntoView({ block: "start" });
    } else if (previousPath.current !== pathname) {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
    previousPath.current = pathname;
  }, [pathname, search, hash]);
}

// Site analytics (see src/lib/analytics.js): only with the live API, and never for the
// signed-in owner, so your own browsing doesn't skew the numbers.
function usePageAnalytics() {
  const { pathname } = useLocation();
  const { source } = useContent();
  const { user, ready } = useAuth();
  const on = source === "api" && ready && !user;

  useEffect(() => {
    setTracking(on);
    if (on) {
      trackPageview(pathname);
    }
  }, [on, pathname]);
}

export default function SiteLayout() {
  useScrollManagement();
  usePageAnalytics();

  return (
    <div className="site-shell">
      <a className="skip-link" href="#content">
        Skip to content
      </a>
      <NavBar />
      <main id="content" className="site-main" tabIndex={-1}>
        <Outlet />
      </main>
      <SiteFooter />
      <ContactWidget />
    </div>
  );
}
