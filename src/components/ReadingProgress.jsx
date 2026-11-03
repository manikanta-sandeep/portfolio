import { useEffect, useState } from "react";
import PropTypes from "prop-types";

// Fixed bar along the top of the viewport that fills as the target element is read.
export default function ReadingProgress({ targetRef }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function update() {
      const element = targetRef.current;
      if (!element) {
        return;
      }
      const { top, height } = element.getBoundingClientRect();
      const read = ((window.innerHeight - top) / height) * 100;
      setProgress(Math.min(100, Math.max(0, read)));
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [targetRef]);

  return (
    <div
      className="reading-progress"
      style={{ transform: `scaleX(${progress / 100})` }}
      role="progressbar"
      aria-label="Reading progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress)}
    />
  );
}

ReadingProgress.propTypes = {
  targetRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }).isRequired
};
