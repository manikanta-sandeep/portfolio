import PropTypes from "prop-types";
import { useContent } from "../context/content";
import { GitHubIcon, GoogleScholarIcon, LinkedInIcon, MailIcon } from "./Icons";

// Links whose profile field is empty are left out.
function buildLinks(profile) {
  return [
    { label: "GitHub", value: profile.github, href: profile.github, Icon: GitHubIcon },
    { label: "LinkedIn", value: profile.linkedin, href: profile.linkedin, Icon: LinkedInIcon },
    { label: "Google Scholar", value: profile.scholar, href: profile.scholar, Icon: GoogleScholarIcon },
    {
      label: "Email",
      value: profile.email,
      href: `mailto:${profile.email}?subject=${encodeURIComponent("Let's work together")}`,
      Icon: MailIcon
    }
  ].filter((link) => link.value);
}

export default function SocialLinks({ variant = "round" }) {
  const { profile } = useContent();
  const socialLinks = buildLinks(profile);
  return (
    <div className={`social-links social-${variant}`}>
      {socialLinks.map(({ label, href, Icon }) => (
        <a
          key={label}
          href={href}
          className="social-link"
          target="_blank"
          // rel="me" tells search engines these profiles belong to the person this site is about.
          rel="me noopener noreferrer"
          title={label}
          aria-label={label}
        >
          <Icon />
        </a>
      ))}
    </div>
  );
}

SocialLinks.propTypes = {
  variant: PropTypes.oneOf(["round", "square"])
};
