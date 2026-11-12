import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
import { publicUrl } from "../lib/paths";
import { PlayIcon } from "./Icons";

const reducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

// A short silent animation: it starts muted and looping, and the browser's own controls let
// people pause it, scrub through it, or watch it full screen. People who ask their system
// for reduced motion get the poster and a play button instead of autoplay.
export default function LoopVideo({ src, poster, label }) {
  const video = useRef(null);
  const [still] = useState(reducedMotion);
  const [started, setStarted] = useState(!still);

  useEffect(() => {
    if (!still) {
      video.current?.play().catch(() => setStarted(false));
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
        controls
        controlsList="nodownload noremoteplayback"
        disableRemotePlayback
        aria-label={label}
        onPlay={() => setStarted(true)}
      />
      {!started && (
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
