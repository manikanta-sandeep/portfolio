import PropTypes from "prop-types";
import { useCallback, useEffect, useState } from "react";
import { ArrowDownIcon, ArrowUpIcon } from "../components/Icons";
import { useToast } from "../context/toast";
import { api } from "../lib/api";
import { AdminSpinner } from "./AdminLayout";
import TrendChart from "./TrendChart";

const RANGES = [
  { days: 1, label: "Today" },
  { days: 7, label: "7 days" },
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" }
];
const REFRESH_MS = 60 * 1000;

// ---------- Formatting ----------

const fullNumber = new Intl.NumberFormat();
const compactNumber = new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 });

function formatCount(value) {
  return value < 10000 ? fullNumber.format(value) : compactNumber.format(value);
}

function formatDuration(ms) {
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return seconds % 60 ? `${minutes}m ${seconds % 60}s` : `${minutes}m`;
  }
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

const formatPercent = (value) => `${Math.round(value * 100)}%`;

// Each figure: how to show it, whether more is better, and whether it can be charted over time.
const METRICS = [
  { key: "visitors", label: "Visitors", format: formatCount, chart: true },
  { key: "visits", label: "Visits", format: formatCount, chart: true },
  { key: "pageviews", label: "Page views", format: formatCount, chart: true },
  { key: "avgVisitMs", label: "Avg. visit time", format: formatDuration, chart: true, duration: true },
  { key: "clicks", label: "Clicks", format: formatCount, chart: true },
  { key: "bounceRate", label: "Bounce rate", format: formatPercent, lowerIsBetter: true },
  { key: "pagesPerVisit", label: "Pages per visit", format: (value) => value.toFixed(1) }
];

const CLICK_KINDS = {
  internal: "Page link",
  outbound: "Other site",
  download: "Download",
  email: "Email",
  button: "Button"
};

// ---------- Pieces ----------

function Delta({ current, previous, lowerIsBetter }) {
  if (!previous) {
    return <span className="analytics-delta muted">{current ? "New this period" : "No change"}</span>;
  }
  const change = (current - previous) / previous;
  if (Math.abs(change) < 0.005) {
    return <span className="analytics-delta muted">No change</span>;
  }
  const up = change > 0;
  const good = lowerIsBetter ? !up : up;
  const Icon = up ? ArrowUpIcon : ArrowDownIcon;
  return (
    <span className={`analytics-delta ${good ? "is-good" : "is-bad"}`}>
      <Icon />
      {Math.round(Math.abs(change) * 100)}%<span className="sr-only">{up ? " higher" : " lower"} than the previous period</span>
    </span>
  );
}

Delta.propTypes = {
  current: PropTypes.number.isRequired,
  previous: PropTypes.number.isRequired,
  lowerIsBetter: PropTypes.bool
};

// Ranked list: label and value as text, with a thin bar for scale.
function BarList({ title, metric, rows, empty }) {
  const max = Math.max(1, ...rows.map((row) => row.value));
  return (
    <section className="card analytics-card" aria-label={title}>
      <header className="analytics-card-head">
        <h2 className="card-title">{title}</h2>
        <span className="muted small">{metric}</span>
      </header>
      {rows.length === 0 ? (
        <p className="muted small analytics-empty">{empty}</p>
      ) : (
        <ol className="bar-list">
          {rows.map((row) => (
            <li key={row.key}>
              <div className="bar-list-text">
                <span className="bar-list-label">
                  {row.href ? (
                    <a href={row.href} target="_blank" rel="noopener noreferrer">
                      {row.label}
                    </a>
                  ) : (
                    row.label
                  )}
                  {row.meta && <span className="bar-list-meta">{row.meta}</span>}
                </span>
                <span className="bar-list-value">{formatCount(row.value)}</span>
              </div>
              <span className="bar-list-bar" style={{ width: `${(row.value / max) * 100}%` }} />
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

BarList.propTypes = {
  title: PropTypes.string.isRequired,
  metric: PropTypes.string.isRequired,
  rows: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.node.isRequired,
      value: PropTypes.number.isRequired,
      meta: PropTypes.string,
      href: PropTypes.string
    })
  ).isRequired,
  empty: PropTypes.string.isRequired
};

const nameRows = (items, fallback) =>
  items.map((item) => ({ key: item.name || fallback, label: item.name || fallback, value: item.visits }));

// ---------- Page ----------

export default function AdminAnalyticsPage() {
  const notify = useToast();
  const [days, setDays] = useState(7);
  const [metricKey, setMetricKey] = useState("visitors");
  const [showTable, setShowTable] = useState(false);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(
    (signal) => {
      setLoading(true);
      return api(`/admin/analytics?days=${days}&tz=${new Date().getTimezoneOffset()}`, { signal })
        .then((data) => {
          setReport(data);
          setLoading(false);
        })
        .catch((error) => {
          if (error.name !== "AbortError") {
            setLoading(false);
            notify(error.message, "error");
          }
        });
    },
    [days, notify]
  );

  // Load on range change, then refresh every minute while the tab is visible.
  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    const timer = window.setInterval(() => document.visibilityState === "visible" && load(controller.signal), REFRESH_MS);
    return () => {
      controller.abort();
      window.clearInterval(timer);
    };
  }, [load]);

  if (!report) {
    return <AdminSpinner />;
  }

  const hourly = report.range.bucket === "hour";
  const metric = METRICS.find((entry) => entry.key === metricKey);
  const points = report.series.map((point) => ({ start: point.start, value: point[metric.key] }));
  const formatX = (time) =>
    hourly
      ? new Date(time).toLocaleTimeString(undefined, { hour: "numeric" })
      : new Date(time).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const formatXLong = (time) =>
    hourly
      ? new Date(time).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
      : new Date(time).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  const rangeLabel = RANGES.find((range) => range.days === report.range.days)?.label;
  const hasData = report.totals.pageviews > 0 || report.totals.clicks > 0;

  return (
    <div className={`analytics${loading ? " is-refreshing" : ""}`}>
      <header className="admin-header">
        <div>
          <h1>Analytics</h1>
          <p className="muted small">Visits to your public site. Your own visits while signed in aren&apos;t counted.</p>
        </div>
        <span className="analytics-live" title="Visitors active in the last 5 minutes">
          <span className="analytics-live-dot" aria-hidden="true" />
          {report.live} {report.live === 1 ? "visitor" : "visitors"} online now
        </span>
      </header>

      <div className="analytics-filters" role="group" aria-label="Date range">
        {RANGES.map((range) => (
          <button
            key={range.days}
            type="button"
            className={`analytics-range${days === range.days ? " is-active" : ""}`}
            aria-pressed={days === range.days}
            onClick={() => setDays(range.days)}
          >
            {range.label}
          </button>
        ))}
      </div>

      <div className="analytics-tiles">
        {METRICS.map((entry) => {
          const content = (
            <>
              <span className="analytics-tile-label">{entry.label}</span>
              <span className="analytics-tile-value">{entry.format(report.totals[entry.key])}</span>
              <Delta current={report.totals[entry.key]} previous={report.previous[entry.key]} lowerIsBetter={entry.lowerIsBetter} />
            </>
          );
          return entry.chart ? (
            <button
              key={entry.key}
              type="button"
              className={`card analytics-tile is-chartable${metricKey === entry.key ? " is-selected" : ""}`}
              aria-pressed={metricKey === entry.key}
              onClick={() => setMetricKey(entry.key)}
              title={`Show ${entry.label.toLowerCase()} in the chart`}
            >
              {content}
            </button>
          ) : (
            <div key={entry.key} className="card analytics-tile">
              {content}
            </div>
          );
        })}
      </div>
      <p className="muted small analytics-compare">Changes compare with the same stretch of time one period earlier.</p>

      <section className="card analytics-card analytics-trend" aria-labelledby="trend-heading">
        <header className="analytics-card-head">
          <div>
            <h2 id="trend-heading" className="card-title">
              {metric.label} per {hourly ? "hour" : "day"}
            </h2>
            <p className="muted small">{rangeLabel}. Pick a figure above to chart it.</p>
          </div>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowTable((value) => !value)}>
            {showTable ? "Show chart" : "Show table"}
          </button>
        </header>
        {showTable ? (
          <div className="analytics-table-wrap">
            <table className="analytics-table">
              <thead>
                <tr>
                  <th scope="col">{hourly ? "Hour" : "Day"}</th>
                  {METRICS.filter((entry) => entry.chart).map((entry) => (
                    <th key={entry.key} scope="col">
                      {entry.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {report.series.map((point) => (
                  <tr key={point.start}>
                    <th scope="row">{formatXLong(point.start)}</th>
                    {METRICS.filter((entry) => entry.chart).map((entry) => (
                      <td key={entry.key}>{entry.format(point[entry.key])}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <>
            <TrendChart
              points={points}
              label={`${metric.label} per ${hourly ? "hour" : "day"}, ${rangeLabel}`}
              formatValue={metric.format}
              formatTick={metric.duration ? formatDuration : formatCount}
              formatX={formatX}
              formatXLong={formatXLong}
              isDuration={Boolean(metric.duration)}
            />
            {!hasData && <p className="muted small analytics-empty">No visits recorded in this range yet.</p>}
          </>
        )}
      </section>

      <div className="analytics-grid">
        <BarList
          title="Top pages"
          metric="Views"
          empty="No page views yet."
          rows={report.pages.map((page) => ({
            key: page.path,
            label: page.path,
            href: page.path,
            value: page.pageviews,
            meta: `${formatCount(page.visitors)} ${page.visitors === 1 ? "visitor" : "visitors"} · ${formatDuration(page.avgMs)} avg. time`
          }))}
        />
        <BarList title="Sources" metric="Visits" empty="No visits yet." rows={nameRows(report.sources, "Direct / none")} />
      </div>

      <BarList
        title="Clicks"
        metric="Clicks"
        empty="No clicks yet."
        rows={report.clicks.map((click) => ({
          key: `${click.kind}|${click.label}|${click.target}`,
          label: click.label,
          value: click.clicks,
          meta: [CLICK_KINDS[click.kind] || click.kind, click.target].filter(Boolean).join(" · ")
        }))}
      />

      <div className="analytics-grid analytics-grid-3">
        <BarList title="Devices" metric="Visits" empty="No visits yet." rows={nameRows(report.devices, "Unknown")} />
        <BarList title="Browsers" metric="Visits" empty="No visits yet." rows={nameRows(report.browsers, "Unknown")} />
        <BarList title="Operating systems" metric="Visits" empty="No visits yet." rows={nameRows(report.os, "Unknown")} />
      </div>

      <p className="muted small analytics-footnote">
        No cookies are used. A visitor is counted once per day per device (an anonymous hash, no IP addresses stored); a
        visit ends after 30 minutes without activity. Time is counted only while the page is open in the foreground. Bots
        and browsers that send &quot;Do Not Track&quot; are excluded. Data older than about 13 months is deleted.
      </p>
    </div>
  );
}
