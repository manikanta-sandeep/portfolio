import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { isExternal } from "../lib/format";

const TOKEN = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\))/g;
const LINK = /^\[([^\]]+)\]\(([^)\s]+)\)$/;

// Renders the small markdown subset used in blog paragraphs: **bold**, `code`, [text](url).
export default function InlineText({ text }) {
  return text.split(TOKEN).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return <code key={index}>{part.slice(1, -1)}</code>;
    }
    const link = part.match(LINK);
    if (link) {
      const [, label, href] = link;
      return isExternal(href) ? (
        <a key={index} href={href} target="_blank" rel="noopener noreferrer">
          {label}
        </a>
      ) : (
        <Link key={index} to={href}>
          {label}
        </Link>
      );
    }
    return part;
  });
}

InlineText.propTypes = {
  text: PropTypes.string.isRequired
};
