import { useRef, useState } from "react";
import PropTypes from "prop-types";
import { useToast } from "../context/toast";
import { copyToClipboard } from "../lib/clipboard";
import { slugify } from "../lib/format";
import { publicUrl } from "../lib/paths";
import { CheckIcon, CopyIcon, PlayIcon } from "./Icons";
import InlineText from "./InlineText";
import LoopVideo from "./LoopVideo";

function CodeBlock({ language, code }) {
  const notify = useToast();
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await copyToClipboard(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      notify("Couldn't copy the code. Select it and copy manually.", "error");
    }
  }

  return (
    <div className="code-block">
      <div className="code-block-bar">
        <span>{language || "code"}</span>
        <button type="button" onClick={copy} aria-label="Copy code">
          {copied ? <CheckIcon /> : <CopyIcon />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}

CodeBlock.propTypes = {
  language: PropTypes.string,
  code: PropTypes.string.isRequired
};

// Shows a large play button over the poster, then hands over to the native controls;
// the button returns when the video ends.
function VideoBlock({ src, poster, caption }) {
  const video = useRef(null);
  const [showOverlay, setShowOverlay] = useState(true);

  function play() {
    const playing = video.current?.play();
    playing?.catch(() => setShowOverlay(false));
  }

  return (
    <figure className="post-figure">
      <div className="video-frame">
        <video
          ref={video}
          controls={!showOverlay}
          playsInline
          preload="metadata"
          poster={poster ? publicUrl(poster) : undefined}
          onPlay={() => setShowOverlay(false)}
          onEnded={() => setShowOverlay(true)}
        >
          <source src={publicUrl(src)} type="video/mp4" />
          <a href={publicUrl(src)}>Download the video</a>
        </video>
        {showOverlay && (
          <button type="button" className="video-play" onClick={play} aria-label={`Play video${caption ? `: ${caption}` : ""}`}>
            <span className="video-play-icon">
              <PlayIcon />
            </span>
          </button>
        )}
      </div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

VideoBlock.propTypes = {
  src: PropTypes.string.isRequired,
  poster: PropTypes.string,
  caption: PropTypes.string
};

function renderBlock(block, index) {
  if (typeof block === "string") {
    return (
      <p key={index}>
        <InlineText text={block} />
      </p>
    );
  }

  switch (block.type) {
    case "h2":
      return (
        <h2 key={index} id={slugify(block.text)}>
          {block.text}
        </h2>
      );
    case "h3":
      return (
        <h3 key={index} id={slugify(block.text)}>
          {block.text}
        </h3>
      );
    case "ul":
    case "ol": {
      const List = block.type;
      return (
        <List key={index}>
          {block.items.map((item) => (
            <li key={item}>
              <InlineText text={item} />
            </li>
          ))}
        </List>
      );
    }
    case "quote":
      return (
        <blockquote key={index}>
          <InlineText text={block.text} />
        </blockquote>
      );
    case "code":
      return <CodeBlock key={index} language={block.language} code={block.code} />;
    case "image":
      return (
        <figure key={index} className="post-figure">
          <img src={publicUrl(block.src)} alt={block.alt || ""} loading="lazy" />
          {block.caption && <figcaption>{block.caption}</figcaption>}
        </figure>
      );
    case "video":
      return <VideoBlock key={index} src={block.src} poster={block.poster} caption={block.caption} />;
    case "animation":
      return (
        <figure key={index} className="post-figure">
          <LoopVideo src={block.src} poster={block.poster} label={block.caption || "Animation"} />
          {block.caption && <figcaption>{block.caption}</figcaption>}
        </figure>
      );
    case "youtube":
      return (
        <figure key={index} className="post-figure">
          <div className="embed-frame">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${block.id}`}
              title={block.title || "YouTube video"}
              loading="lazy"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </figure>
      );
    default:
      return null;
  }
}

export default function PostContent({ blocks }) {
  return <>{blocks.map(renderBlock)}</>;
}

PostContent.propTypes = {
  blocks: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.object])).isRequired
};
