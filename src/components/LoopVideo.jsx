import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
import { publicUrl } from "../lib/paths";
import { PlayIcon } from "./Icons";

const reducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

// A short silent animation that plays like a GIF: muted, looping, inline. People who ask
// their system for reduced motion get the poster and a play button instead of autoplay.
export default function LoopVideo({ src, poster, label }) {
  const video = useRef(null);
  const [still] = useState(reducedMotion);
  const [playing, setPlaying] = useState(!still);

  useEffect(() => {
    if (!still) {
      video.current?.play().catch(() => setPlaying(false));
    }
  }, [still]);

  return (
    <div className="video-frame loop-video">
      <video
        ref={video}
        src={publicUrl(src)}
        poster={poster ? publicUrl(poster) : undefined}
        muted
        loop
        playsInline
        autoPlay={!still}
        preload={still ? "none" : "auto"}
        controls={!playing}
        aria-label={label}
        onPlay={() => setPlaying(true)}
      />
      {!playing && (
        <button type="button" className="video-play" onClick={() => video.current?.play()} aria-label={`Play: ${label}`}>
          <span className="video-play-icon">
            <PlayIcon />
          </span>
        </button>
      )}
    </div>
  );
}

LoopVideo.propTypes = {
  src: PropTypes.string.isRequired,
  poster: PropTypes.string,
  label: PropTypes.string.isRequired
};
