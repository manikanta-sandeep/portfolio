// First-party site analytics: page views, time on page, clicks, sources, and devices.
// No cookies and no IP addresses are stored. A visitor is a salted hash of IP, browser, and
// day, so the same person counts once per day; a visit is one browser tab session.
import crypto from "node:crypto";
import { viewSalt } from "./content.js";
import { badRequest } from "./errors.js";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const RETENTION_DAYS = 400;
const MAX_ENGAGED_MS = HOUR;
const LIVE_WINDOW_MS = 5 * 60 * 1000;
const ID = /^[A-Za-z0-9_-]{8,64}$/;
const CLICK_KINDS = new Set(["internal", "outbound", "download", "email", "button"]);
export const RANGES = [1, 7, 30, 90];

// Crawlers, link-preview fetchers, uptime checks, and automated browsers.
const BOT = /bot|crawl|spider|slurp|archiver|headless|lighthouse|pagespeed|pingdom|uptime|monitor|preview|facebookexternalhit|embedly|quora link|whatsapp|telegram|discord|slack|skype|curl|wget|python|java\/|go-http|okhttp|node-fetch|axios|undici|phantom|selenium|puppeteer|playwright/i;

export function isBot(userAgent) {
  return !userAgent || BOT.test(userAgent);
}

function clean(value, max) {
  return typeof value === "string" ? value.replace(/\p{Cc}/gu, "").trim().slice(0, max) : "";
}

function browserName(ua) {
  if (/Edg\//.test(ua)) return "Edge";
  if (/OPR\/|Opera/.test(ua)) return "Opera";
  if (/SamsungBrowser/.test(ua)) return "Samsung Internet";
  if (/Firefox\/|FxiOS/.test(ua)) return "Firefox";
  if (/Chrome\/|CriOS/.test(ua)) return "Chrome";
  if (/Safari\//.test(ua)) return "Safari";
  return "Other";
}

function osName(ua) {
  if (/Windows/.test(ua)) return "Windows";
  if (/Android/.test(ua)) return "Android";
  if (/iPhone|iPad|iPod/.test(ua)) return "iOS";
  if (/CrOS/.test(ua)) return "ChromeOS";
  if (/Mac OS X|Macintosh/.test(ua)) return "macOS";
  if (/Linux/.test(ua)) return "Linux";
  return "Other";
}

function deviceType(width, ua) {
  if (Number.isFinite(width) && width > 0) {
    return width < 640 ? "Mobile" : width < 1024 ? "Tablet" : "Desktop";
  }
  return /Mobi|iPhone|Android.*Mobile/.test(ua) ? "Mobile" : /iPad|Tablet|Android/.test(ua) ? "Tablet" : "Desktop";
}

// Host only ("google.com"), and nothing for links from this site itself.
function referrerHost(value, ownHost) {
  try {
    const url = new URL(value);
    if (!/^(https?|android-app):$/.test(url.protocol)) {
      return "";
    }
    const host = url.hostname.replace(/^www\./, "");
    return host === ownHost.replace(/^www\./, "") ? "" : host.slice(0, 100);
  } catch {
    return "";
  }
}

let lastPrune = 0;
function pruneOldRows(db, now) {
  if (now - lastPrune < DAY) {
    return;
  }
  lastPrune = now;
  const cutoff = now - RETENTION_DAYS * DAY;
  db.prepare("DELETE FROM analytics_pageviews WHERE ts < ?").run(cutoff);
  db.prepare("DELETE FROM analytics_events WHERE ts < ?").run(cutoff);
}

// Handles one beacon from the site's tracker: a page view, a time-on-page update, or a click.
export function collect(db, body, { ip, userAgent, ownHost, now = Date.now() }) {
  const type = body?.type;
  const session = clean(body?.session, 64);
  if (!ID.test(session)) {
    throw badRequest("Invalid session.");
  }

  if (type === "engage") {
    const id = clean(body.id, 64);
    const ms = Math.min(Math.max(Math.round(Number(body.ms) || 0), 0), MAX_ENGAGED_MS);
    db.prepare(
      "UPDATE analytics_pageviews SET engaged_ms = MAX(engaged_ms, ?), last_seen = ? WHERE id = ? AND session = ?"
    ).run(ms, now, id, session);
    return;
  }

  const path = clean(body?.path, 200);
  if (!path.startsWith("/")) {
    throw badRequest("Invalid path.");
  }
  const day = new Date(now).toISOString().slice(0, 10);
  const visitor = crypto.createHash("sha256").update(`${viewSalt(db)}|analytics|${day}|${ip}|${userAgent}`).digest("hex").slice(0, 32);
  pruneOldRows(db, now);

  if (type === "pageview") {
    const id = clean(body.id, 64);
    if (!ID.test(id)) {
      throw badRequest("Invalid id.");
    }
    db.prepare(
      `INSERT OR IGNORE INTO analytics_pageviews
         (id, ts, last_seen, visitor, session, entry, path, referrer, source, device, browser, os)
       VALUES (@id, @now, @now, @visitor, @session, @entry, @path, @referrer, @source, @device, @browser, @os)`
    ).run({
      id,
      now,
      visitor,
      session,
      entry: body.entry ? 1 : 0,
      path,
      referrer: referrerHost(body.referrer, ownHost),
      source: clean(body.source, 60).replace(/[^\w.\- ]/g, "").toLowerCase(),
      device: deviceType(Number(body.width), userAgent),
      browser: browserName(userAgent),
      os: osName(userAgent)
    });
    return;
  }

  if (type === "click") {
    const kind = CLICK_KINDS.has(body.kind) ? body.kind : "button";
    db.prepare(
      "INSERT INTO analytics_events (ts, visitor, session, path, kind, label, target) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).run(now, visitor, session, path, kind, clean(body.label, 80) || "(no label)", clean(body.target, 300));
    return;
  }

  throw badRequest("Unknown event type.");
}

// ---------- Reports ----------

// Range boundaries in the viewer's time zone: "7 days" is today plus the 6 days before it.
// The comparison period is the same window one period earlier ("today so far" compares
// with yesterday up to the same time).
function rangeBounds(days, tzOffsetMinutes, now) {
  const offset = tzOffsetMinutes * 60 * 1000;
  const startOfToday = Math.floor((now - offset) / DAY) * DAY + offset;
  const start = startOfToday - (days - 1) * DAY;
  return { start, end: now, previousStart: start - days * DAY, previousEnd: now - days * DAY };
}

function totals(db, from, to) {
  const views = db
    .prepare("SELECT COUNT(*) AS pageviews, COUNT(DISTINCT visitor) AS visitors FROM analytics_pageviews WHERE ts >= ? AND ts < ?")
    .get(from, to);
  const visits = db
    .prepare(
      `WITH s AS (
         SELECT session, COUNT(*) AS views, SUM(engaged_ms) AS ms FROM analytics_pageviews
         WHERE ts >= ? AND ts < ? GROUP BY session
       )
       SELECT COUNT(*) AS visits, COALESCE(SUM(views = 1), 0) AS bounces, COALESCE(AVG(ms), 0) AS avgVisitMs FROM s`
    )
    .get(from, to);
  const { clicks } = db.prepare("SELECT COUNT(*) AS clicks FROM analytics_events WHERE ts >= ? AND ts < ?").get(from, to);
  return {
    visitors: views.visitors,
    visits: visits.visits,
    pageviews: views.pageviews,
    pagesPerVisit: visits.visits ? views.pageviews / visits.visits : 0,
    bounceRate: visits.visits ? visits.bounces / visits.visits : 0,
    avgVisitMs: Math.round(visits.avgVisitMs),
    clicks
  };
}

function breakdown(db, column, from, to) {
  return db
    .prepare(
      `SELECT ${column} AS name, COUNT(*) AS visits FROM analytics_pageviews
       WHERE entry = 1 AND ts >= ? AND ts < ? GROUP BY name ORDER BY visits DESC, name LIMIT 10`
    )
    .all(from, to);
}

export function analyticsReport(db, { days, tzOffset, now = Date.now() }) {
  if (!RANGES.includes(days)) {
    throw badRequest(`Range must be one of ${RANGES.join(", ")} days.`);
  }
  if (!Number.isInteger(tzOffset) || Math.abs(tzOffset) > 14 * 60) {
    throw badRequest("Invalid time zone offset.");
  }
  const { start, end, previousStart, previousEnd } = rangeBounds(days, tzOffset, now);
  // "Today" is shown by hour, longer ranges by day. Hours still to come today are left out,
  // so the chart ends at the current hour instead of dropping to zero.
  const bucketMs = days === 1 ? HOUR : DAY;
  const bucketCount = days === 1 ? Math.floor((end - start) / HOUR) + 1 : days;

  const series = Array.from({ length: bucketCount }, (_, index) => ({
    start: start + index * bucketMs,
    visitors: 0,
    visits: 0,
    pageviews: 0,
    clicks: 0,
    avgVisitMs: 0
  }));
  db.prepare(
    `SELECT CAST((ts - @start) / @bucketMs AS INTEGER) AS bucket, COUNT(DISTINCT visitor) AS visitors,
            COUNT(DISTINCT session) AS visits, COUNT(*) AS pageviews, SUM(engaged_ms) AS ms
     FROM analytics_pageviews WHERE ts >= @start AND ts < @end GROUP BY bucket`
  )
    .all({ start, end, bucketMs })
    .forEach((row) => {
      const point = series[row.bucket];
      if (point) {
        Object.assign(point, {
          visitors: row.visitors,
          visits: row.visits,
          pageviews: row.pageviews,
          avgVisitMs: row.visits ? Math.round(row.ms / row.visits) : 0
        });
      }
    });
  db.prepare(
    `SELECT CAST((ts - @start) / @bucketMs AS INTEGER) AS bucket, COUNT(*) AS clicks
     FROM analytics_events WHERE ts >= @start AND ts < @end GROUP BY bucket`
  )
    .all({ start, end, bucketMs })
    .forEach((row) => {
      if (series[row.bucket]) {
        series[row.bucket].clicks = row.clicks;
      }
    });

  return {
    range: { days, start, end, bucket: days === 1 ? "hour" : "day" },
    live: db
      .prepare("SELECT COUNT(DISTINCT session) AS live FROM analytics_pageviews WHERE last_seen >= ?")
      .get(now - LIVE_WINDOW_MS).live,
    totals: totals(db, start, end),
    previous: totals(db, previousStart, previousEnd),
    series,
    pages: db
      .prepare(
        `SELECT path, COUNT(*) AS pageviews, COUNT(DISTINCT visitor) AS visitors, CAST(AVG(engaged_ms) AS INTEGER) AS avgMs
         FROM analytics_pageviews WHERE ts >= ? AND ts < ? GROUP BY path ORDER BY pageviews DESC, path LIMIT 10`
      )
      .all(start, end),
    // Campaign tag (?utm_source=) first, then the referring site; "" means direct / unknown.
    sources: breakdown(db, "COALESCE(NULLIF(source, ''), referrer)", start, end),
    devices: breakdown(db, "device", start, end),
    browsers: breakdown(db, "browser", start, end),
    os: breakdown(db, "os", start, end),
    clicks: db
      .prepare(
        `SELECT kind, label, target, COUNT(*) AS clicks, COUNT(DISTINCT session) AS visits FROM analytics_events
         WHERE ts >= ? AND ts < ? GROUP BY kind, label, target ORDER BY clicks DESC, label LIMIT 15`
      )
      .all(start, end)
  };
}
