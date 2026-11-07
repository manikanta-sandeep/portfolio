import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";

const HEIGHT = 220;
const MARGIN = { top: 12, right: 12, bottom: 28, left: 48 };
const DURATION_STEPS = [1, 2, 5, 10, 15, 30, 60, 120, 300, 600, 900, 1800, 3600].map((s) => s * 1000);

// Four clean intervals from zero: 1/2/5 x 10^n for counts, clock-friendly steps for durations.
function yTicks(max, isDuration) {
  const target = Math.max(max, isDuration ? 1000 : 1) / 4;
  let step;
  if (isDuration) {
    step = DURATION_STEPS.find((candidate) => candidate >= target) ?? Math.ceil(target / 3600000) * 3600000;
  } else {
    const power = 10 ** Math.floor(Math.log10(target));
    step = [1, 2, 5, 10].map((m) => m * power).find((candidate) => candidate >= target);
    step = Math.max(1, step);
  }
  return [0, 1, 2, 3, 4].map((i) => i * step);
}

function useWidth(ref) {
  const [width, setWidth] = useState(640);
  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return undefined;
    }
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(280, Math.round(entry.contentRect.width))));
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return width;
}

// Single-series area chart with a crosshair that snaps to the nearest point. Hover or
// keyboard (arrow keys) shows the value; the parent offers the same numbers as a table.
export default function TrendChart({ points, label, formatValue, formatTick, formatX, formatXLong, isDuration }) {
  const containerRef = useRef(null);
  const width = useWidth(containerRef);
  const [active, setActive] = useState(null);

  const plotWidth = width - MARGIN.left - MARGIN.right;
  const plotHeight = HEIGHT - MARGIN.top - MARGIN.bottom;
  const ticks = yTicks(Math.max(0, ...points.map((point) => point.value)), isDuration);
  const yMax = ticks.at(-1);
  const x = (index) => MARGIN.left + (points.length === 1 ? plotWidth / 2 : (index * plotWidth) / (points.length - 1));
  const y = (value) => MARGIN.top + plotHeight - (value / yMax) * plotHeight;
  const baseline = y(0);

  const line = points.map((point, index) => `${index ? "L" : "M"}${x(index).toFixed(1)},${y(point.value).toFixed(1)}`).join("");
  const area = `${line}L${x(points.length - 1).toFixed(1)},${baseline}L${x(0).toFixed(1)},${baseline}Z`;
  const labelEvery = Math.max(1, Math.ceil(points.length / Math.max(2, Math.floor(plotWidth / 90))));

  function pointerIndex(event) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const relative = event.clientX - bounds.left - MARGIN.left;
    const index = points.length === 1 ? 0 : Math.round((relative / plotWidth) * (points.length - 1));
    return Math.min(points.length - 1, Math.max(0, index));
  }

  function onKeyDown(event) {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      const step = event.key === "ArrowLeft" ? -1 : 1;
      setActive((current) => Math.min(points.length - 1, Math.max(0, (current ?? points.length - 1) + (current === null ? 0 : step))));
    } else if (event.key === "Escape") {
      setActive(null);
    }
  }

  const total = points.reduce((sum, point) => sum + point.value, 0);
  const peak = points.reduce((best, point) => (point.value > best.value ? point : best), points[0]);
  const summary = `${label}. ${points.length} points from ${formatXLong(points[0].start)} to ${formatXLong(points.at(-1).start)}. Highest: ${formatValue(peak.value)} on ${formatXLong(peak.start)}.${isDuration ? "" : ` Total ${formatValue(total)}.`} Use the arrow keys to read each point.`;
  const hovered = active === null ? null : points[active];
  const tooltipLeft = hovered ? Math.min(Math.max(x(active), 70), width - 70) : 0;

  return (
    <div className="trend-chart" ref={containerRef}>
      <svg
        width={width}
        height={HEIGHT}
        role="img"
        aria-label={summary}
        tabIndex={0}
        onPointerMove={(event) => setActive(pointerIndex(event))}
        onPointerLeave={() => setActive(null)}
        onFocus={() => setActive((current) => current ?? points.length - 1)}
        onBlur={() => setActive(null)}
        onKeyDown={onKeyDown}
      >
        {ticks.map((tick) => (
          <g key={tick}>
            <line className="trend-grid" x1={MARGIN.left} x2={width - MARGIN.right} y1={y(tick)} y2={y(tick)} />
            <text className="trend-axis" x={MARGIN.left - 8} y={y(tick)} textAnchor="end" dominantBaseline="middle">
              {formatTick(tick)}
            </text>
          </g>
        ))}
        {points.map((point, index) =>
          index % labelEvery === 0 ? (
            <text key={point.start} className="trend-axis" x={x(index)} y={HEIGHT - 8} textAnchor={index === 0 ? "start" : "middle"}>
              {formatX(point.start)}
            </text>
          ) : null
        )}
        <path className="trend-area" d={area} />
        <path className="trend-line" d={line} />
        {hovered && (
          <g>
            <line className="trend-crosshair" x1={x(active)} x2={x(active)} y1={MARGIN.top} y2={baseline} />
            <circle className="trend-dot" cx={x(active)} cy={y(hovered.value)} r={4} />
          </g>
        )}
      </svg>
      {hovered && (
        <div className="trend-tooltip" style={{ left: tooltipLeft }} aria-hidden="true">
          <span className="trend-tooltip-key" />
          <strong>{formatValue(hovered.value)}</strong>
          <span>{formatXLong(hovered.start)}</span>
        </div>
      )}
    </div>
  );
}

TrendChart.propTypes = {
  points: PropTypes.arrayOf(PropTypes.shape({ start: PropTypes.number.isRequired, value: PropTypes.number.isRequired })).isRequired,
  label: PropTypes.string.isRequired,
  formatValue: PropTypes.func.isRequired,
  formatTick: PropTypes.func.isRequired,
  formatX: PropTypes.func.isRequired,
  formatXLong: PropTypes.func.isRequired,
  isDuration: PropTypes.bool
};
