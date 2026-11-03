import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useContent } from "../context/content";
import { ChatIcon, ChevronRightIcon, CloseIcon, CollectionIcon, MailIcon, NewspaperIcon } from "./Icons";

const actions = [
  { to: "/contact", title: "Write a message", subtitle: "Goes straight to my inbox", Icon: MailIcon, tone: "blue" },
  { to: "/blog", title: "Read the blog", subtitle: "Notes on what I build", Icon: NewspaperIcon, tone: "purple" },
  { to: "/projects", title: "See my work", subtitle: "Projects and research", Icon: CollectionIcon, tone: "pink" }
];

export default function ContactWidget() {
  const { profile } = useContent();
  const [open, setOpen] = useState(false);
  const container = useRef(null);
  const { pathname } = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    function onPointerDown(event) {
      if (container.current && !container.current.contains(event.target)) {
        setOpen(false);
      }
    }
    function onKeyDown(event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="contact-widget" ref={container}>
      {open && (
        <div className="widget-panel" id="contact-widget-panel" role="dialog" aria-label="Get in touch">
          <div className="widget-header">
            <h2>Say Hello</h2>
            <p>I usually reply within {profile.responseTime}</p>
          </div>
          <div className="widget-actions">
            {actions.map(({ to, title, subtitle, Icon, tone }) => (
              <Link key={to} to={to} className={`widget-action tone-${tone}`}>
                <span className="widget-action-icon">
                  <Icon />
                </span>
                <span className="widget-action-text">
                  <strong>{title}</strong>
                  <small>{subtitle}</small>
                </span>
                <ChevronRightIcon />
              </Link>
            ))}
          </div>
        </div>
      )}
      <button
        type="button"
        className="widget-fab"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Close contact options" : "Open contact options"}
        aria-expanded={open}
        aria-controls="contact-widget-panel"
      >
        {open ? <CloseIcon /> : <ChatIcon />}
      </button>
    </div>
  );
}
