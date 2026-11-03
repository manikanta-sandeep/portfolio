import PropTypes from "prop-types";
import { publicUrl } from "../lib/paths";
import { NewspaperIcon } from "./Icons";

const PALETTES = 5;

function paletteFor(category) {
  let hash = 0;
  for (const char of category) {
    hash = (hash * 31 + char.charCodeAt(0)) % 9973;
  }
  return hash % PALETTES;
}

// Uses the post's cover image when it has one, otherwise a gradient keyed to the category.
export default function PostCover({ post, size = "md" }) {
  if (post.cover) {
    return (
      <div className={`post-cover post-cover-${size}`}>
        <img src={publicUrl(post.cover)} alt="" loading="lazy" />
      </div>
    );
  }

  return (
    <div className={`post-cover post-cover-${size} cover-palette-${paletteFor(post.category)}`} aria-hidden="true">
      <NewspaperIcon />
      <span>{post.category}</span>
    </div>
  );
}

PostCover.propTypes = {
  post: PropTypes.shape({
    cover: PropTypes.string,
    category: PropTypes.string.isRequired
  }).isRequired,
  size: PropTypes.oneOf(["sm", "md"])
};
