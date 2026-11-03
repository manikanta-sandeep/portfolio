import { Link } from "react-router-dom";
import { useAuth } from "../context/auth";
import { useContent } from "../context/content";
import { CogIcon, UserIcon } from "./Icons";
import SocialLinks from "./SocialLinks";

export default function SiteFooter() {
  const { profile: profileData } = useContent();
  const { user } = useAuth();
  // The admin entry point is only for the site owner, so it stays a quiet icon down here.
  const admin = user ? { to: "/admin", label: "Dashboard", Icon: CogIcon } : { to: "/admin/login", label: "Sign in", Icon: UserIcon };

  return (
    <footer className="site-footer">
      <div className="container footer-row">
        <div className="footer-brand">
          <span className="brand-mark brand-mark-sm" aria-hidden="true">
            {profileData.initials}
          </span>
          <span>
            &copy; {new Date().getFullYear()} {profileData.displayName}
          </span>
        </div>
        <div className="footer-icons">
          <SocialLinks variant="square" />
          <div className="social-links social-square">
            <Link to={admin.to} className="social-link" aria-label={admin.label} title={admin.label}>
              <admin.Icon />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
