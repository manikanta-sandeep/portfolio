import { Link, useLocation } from "react-router-dom";
import Seo from "../components/Seo";
import { ArrowLeftIcon } from "../components/Icons";

export default function NotFoundPage() {
  const { pathname } = useLocation();

  return (
    <div className="container not-found">
      <Seo title="Not Found" description="This page could not be found." path={pathname} noindex />
      <p className="not-found-code">404</p>
      <h1>This page wandered off</h1>
      <p>The link may be old, or the page may have moved.</p>
      <div className="button-row center-row">
        <Link className="btn btn-primary" to="/">
          <ArrowLeftIcon />
          Back home
        </Link>
        <Link className="btn btn-secondary" to="/search">
          Search the site
        </Link>
      </div>
    </div>
  );
}
