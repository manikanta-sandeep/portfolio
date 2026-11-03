import { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
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

export default function SiteLayout() {
  useScrollManagement();

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
