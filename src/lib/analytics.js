// First-party analytics tracker. Sends page views, time on page (only while the tab is
// visible), and link/button clicks to /api/collect. No cookies: a visit is identified by a
// random id kept in sessionStorage for the tab, renewed after 30 idle minutes.
import { basename } from "./paths";

const ENDPOINT = `${basename === "/" ? "" : basename}/api/collect`;
const SESSION_KEY = "sp-visit";
const SESSION_IDLE_MS = 30 * 60 * 1000;
const HEARTBEAT_MS = 30 * 1000;

let enabled = false;
let listening = false;
let memorySession = null;
// The page view being timed: { id, session, path, startedAt, visibleMs, visibleSince, sentMs }.
let current = null;

function randomId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID().replace(/-/g, "");
  }
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
}

// Browsers set these when the person has asked not to be tracked.
function optedOut() {
  return navigator.doNotTrack === "1" || window.doNotTrack === "1" || navigator.globalPrivacyControl === true;
}

function send(payload) {
  fetch(ENDPOINT, {
    method: "POST",
    keepalive: true,
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", "X-Requested-With": "portfolio" },
    body: JSON.stringify(payload)
  }).catch(() => {});
}

function saveSession(id) {
  memorySession = { id, lastSeen: Date.now() };
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(memorySession));
  } catch {
    // Storage blocked: memorySession keeps the visit going for this page load.
  }
}

// Returns the visit id for a new page view, starting a new visit after 30 idle minutes.
function startOrContinueSession() {
  let saved = memorySession;
  try {
    saved = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null") || saved;
  } catch {
    // Fall back to memorySession.
  }
  const isNew = !saved?.id || Date.now() - saved.lastSeen > SESSION_IDLE_MS;
  const id = isNew ? randomId() : saved.id;
  saveSession(id);
  return { id, isNew };
}

function visibleTime(view) {
  return view.visibleMs + (view.visibleSince === null ? 0 : performance.now() - view.visibleSince);
}

function flush() {
  if (!current) {
    return;
  }
  const ms = Math.round(visibleTime(current));
  if (ms - current.sentMs < 1000) {
    return;
  }
  current.sentMs = ms;
  // Time spent reading keeps the visit alive, the same as opening another page.
  saveSession(current.session);
  send({ type: "engage", id: current.id, session: current.session, ms });
}

function onVisibilityChange() {
  if (!current) {
    return;
  }
  if (document.visibilityState === "hidden") {
    current.visibleMs = visibleTime(current);
    current.visibleSince = null;
    flush();
  } else if (current.visibleSince === null) {
    current.visibleSince = performance.now();
  }
}

// What a click was on: an internal page, another site, a download, an email link, or a button.
function describeClick(element) {
  const label = (element.dataset.track || element.getAttribute("aria-label") || element.title || element.textContent || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
  if (element.tagName !== "A") {
    return { kind: "button", label, target: "" };
  }
  const url = new URL(element.href, window.location.href);
  if (url.protocol === "mailto:") {
    return { kind: "email", label, target: `mailto:${url.pathname}` };
  }
  if (url.protocol === "data:" || url.protocol === "blob:") {
    return { kind: "download", label, target: element.getAttribute("download") || "generated file" };
  }
  if (element.hasAttribute("download") || /\.(pdf|zip|png|jpe?g|webp|docx?)$/i.test(url.pathname)) {
    return { kind: "download", label, target: url.origin === window.location.origin ? url.pathname : `${url.origin}${url.pathname}` };
  }
  if (url.origin !== window.location.origin) {
    return { kind: "outbound", label, target: `${url.origin}${url.pathname}` };
  }
  return { kind: "internal", label, target: url.pathname };
}

function onClick(event) {
  if (!enabled || !current) {
    return;
  }
  const element = event.target.closest?.("a[href], button, [data-track]");
  if (!element) {
    return;
  }
  try {
    send({ type: "click", session: current.session, path: current.path, ...describeClick(element) });
  } catch {
    // An unparsable href is not worth breaking the click for.
  }
}

function listen() {
  if (listening) {
    return;
  }
  listening = true;
  document.addEventListener("visibilitychange", onVisibilityChange);
  window.addEventListener("pagehide", flush);
  document.addEventListener("click", onClick, true);
  window.setInterval(() => {
    if (enabled && document.visibilityState === "visible") {
      flush();
    }
  }, HEARTBEAT_MS);
}

export function setTracking(on) {
  enabled = Boolean(on) && !optedOut();
  if (!enabled) {
    flush();
    current = null;
  }
}

// Records a page view for `path` and starts timing it; the previous page's time is sent first.
export function trackPageview(path) {
  if (!enabled) {
    return;
  }
  // React's development double-render calls this twice for one navigation.
  if (current && current.path === path && performance.now() - current.startedAt < 2000) {
    return;
  }
  listen();
  flush();

  const session = startOrContinueSession();
  const params = new URLSearchParams(window.location.search);
  const visible = document.visibilityState === "visible";
  current = {
    id: randomId(),
    session: session.id,
    path,
    startedAt: performance.now(),
    visibleMs: 0,
    visibleSince: visible ? performance.now() : null,
    sentMs: 0
  };
  send({
    type: "pageview",
    id: current.id,
    session: session.id,
    path,
    // Where the visit came from only matters for its first page.
    entry: session.isNew,
    referrer: session.isNew ? document.referrer : "",
    source: session.isNew ? params.get("utm_source") || params.get("ref") || "" : "",
    width: window.screen?.width || window.innerWidth
  });
}
