import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useContent } from "../context/content";
import Avatar from "./Avatar";
import { BookOpenIcon, BriefcaseIcon, CollectionIcon, InfoIcon, LightBulbIcon } from "./Icons";
import SocialLinks from "./SocialLinks";

const sections = [
  { label: "About", to: "/", Icon: InfoIcon, end: true },
  { label: "Experience", to: "/experience", Icon: BriefcaseIcon },
  { label: "Skills", to: "/skills", Icon: LightBulbIcon },
  { label: "Projects", to: "/projects", Icon: CollectionIcon },
  { label: "Beyond Work", to: "/extracurriculars", Icon: BookOpenIcon }
];

function ProfileCard() {
  const { profile: profileData } = useContent();
  const { pathname } = useLocation();
  const NameHeading = pathname === "/" ? "h1" : "h2";
  const showFullName = profileData.fullName && profileData.fullName !== profileData.displayName;

  return (
    <div className="profile-card">
      <Avatar size="lg" />
      <div className="profile-name">
        {/* The name is the page's main heading on the home page. */}
        <NameHeading>{profileData.displayName}</NameHeading>
        {profileData.pronouns && <span>{profileData.pronouns}</span>}
      </div>
      {showFullName && <p className="profile-fullname">{profileData.fullName}</p>}
      <p className="profile-headline">{profileData.headline}</p>
      {profileData.organizationName && (
        <p className="profile-org">
          {profileData.organizationUrl ? (
            <a href={profileData.organizationUrl} target="_blank" rel="noopener noreferrer">
              {profileData.organizationName}
            </a>
          ) : (
            profileData.organizationName
          )}
        </p>
      )}
      <SocialLinks variant="round" />
    </div>
  );
}

export default function PortfolioLayout() {
  return (
    <div className="container portfolio-layout">
      <aside className="portfolio-sidebar">
        <div className="sidebar-sticky">
          <ProfileCard />
          <nav className="side-nav" aria-label="Portfolio sections">
            {sections.map(({ label, to, Icon, end }) => (
              <NavLink key={to} to={to} end={end} className="side-nav-link">
                <Icon />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
      <div className="portfolio-content">
        <Outlet />
      </div>
    </div>
  );
}
