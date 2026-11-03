import { useState } from "react";
import { Link } from "react-router-dom";
import Seo from "../components/Seo";
import { ClockIcon, CollectionIcon, CopyIcon, MailIcon, NewspaperIcon } from "../components/Icons";
import { useContent } from "../context/content";
import { useToast } from "../context/toast";
import { api } from "../lib/api";
import { copyToClipboard } from "../lib/clipboard";

const EMPTY_FORM = { name: "", email: "", subject: "", message: "", website: "" };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(form) {
  const errors = {};
  if (!form.name.trim()) {
    errors.name = "Please enter your name.";
  }
  if (!EMAIL_PATTERN.test(form.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }
  if (form.message.trim().length < 10) {
    errors.message = "Please write a message of at least 10 characters.";
  }
  return errors;
}

function mailtoHref(email, form) {
  const subject = form.subject.trim() || `Portfolio contact from ${form.name.trim()}`;
  const body = `${form.message.trim()}\n\n${form.name.trim()} (${form.email.trim()})`;
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function ContactPage() {
  const { profile: profileData, source } = useContent();
  const notify = useToast();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);

  function update(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    if (errors[name]) {
      setErrors((current) => ({ ...current, [name]: undefined }));
    }
  }

  async function submit(event) {
    event.preventDefault();
    // Hidden "website" field: people never see it, simple spam bots fill it in.
    if (form.website) {
      return;
    }
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      notify("Please fix the highlighted fields.", "error");
      return;
    }

    // Without the API (static hosting), hand the message to the visitor's email app.
    if (source !== "api") {
      window.location.href = mailtoHref(profileData.email, form);
      notify("Opening your email app with the message filled in.", "info");
      return;
    }

    setSending(true);
    try {
      await api("/contact", {
        method: "POST",
        body: { name: form.name, email: form.email, subject: form.subject, message: form.message }
      });
      setForm(EMPTY_FORM);
      notify("Thanks! Your message has been sent.", "success");
    } catch (error) {
      notify(
        error.status === 400 || error.status === 429
          ? error.message
          : `Your message couldn't be sent. Please email ${profileData.email} directly.`,
        "error"
      );
    } finally {
      setSending(false);
    }
  }

  async function copyEmail() {
    try {
      await copyToClipboard(profileData.email);
      notify("Email address copied.", "success");
    } catch {
      notify("Couldn't copy the email address.", "error");
    }
  }

  function fieldProps(name) {
    return {
      id: `contact-${name}`,
      name,
      value: form[name],
      onChange: update,
      className: `input${errors[name] ? " input-error" : ""}`,
      "aria-invalid": Boolean(errors[name]),
      "aria-describedby": errors[name] ? `contact-${name}-error` : undefined
    };
  }

  function fieldError(name) {
    return (
      errors[name] && (
        <p id={`contact-${name}-error`} className="field-error">
          {errors[name]}
        </p>
      )
    );
  }

  return (
    <div className="container contact-page">
      <Seo
        title="Contact"
        description={`Get in touch with ${profileData.displayName} about opportunities or collaboration.`}
        path="/contact"
      />

      <header className="contact-header">
        <h1 className="gradient-text">Let&apos;s Talk</h1>
        <p>A role, a project, or a question about something I wrote: my inbox is open.</p>
      </header>

      <div className="contact-grid">
        <section className="card contact-form-card" aria-labelledby="contact-form-heading">
          <h2 id="contact-form-heading">Write to Me</h2>
          <form className="contact-form" onSubmit={submit} noValidate>
            <div className="form-field">
              <label htmlFor="contact-name">Name</label>
              <input type="text" placeholder="Your name" maxLength={100} autoComplete="name" required {...fieldProps("name")} />
              {fieldError("name")}
            </div>
            <div className="form-field">
              <label htmlFor="contact-email">Email</label>
              <input
                type="email"
                placeholder="your.email@example.com"
                autoComplete="email"
                required
                {...fieldProps("email")}
              />
              {fieldError("email")}
            </div>
            <div className="form-field">
              <label htmlFor="contact-subject">Subject (optional)</label>
              <input type="text" placeholder="What is this about?" maxLength={150} {...fieldProps("subject")} />
            </div>
            <div className="form-field">
              <label htmlFor="contact-message">Message</label>
              <textarea rows={6} placeholder="Your message..." required {...fieldProps("message")} />
              {fieldError("message")}
            </div>
            <div className="honeypot" aria-hidden="true">
              <label htmlFor="contact-website">Website</label>
              <input
                id="contact-website"
                type="text"
                name="website"
                value={form.website}
                onChange={update}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>
            <button type="submit" className="btn btn-gradient btn-block btn-lg" disabled={sending}>
              {sending ? "Sending..." : "Send"}
            </button>
          </form>
        </section>

        <div className="contact-aside">
          <section className="callout" aria-labelledby="quick-response-heading">
            <h3 id="quick-response-heading">Reply Time</h3>
            <p>I usually reply within {profileData.responseTime}. If it&apos;s time-sensitive, say so in the subject line.</p>
            <p className="muted small with-icon">
              <ClockIcon />
              Response time: {profileData.responseTime}
            </p>
          </section>

          <section className="card card-pad" aria-labelledby="connect-heading">
            <h3 id="connect-heading" className="card-title">
              Elsewhere
            </h3>
            <div className="connect-list">
              <div className="connect-item">
                <span className="connect-icon tone-green">
                  <MailIcon />
                </span>
                <span className="connect-text">
                  <a href={`mailto:${profileData.email}`}>{profileData.email}</a>
                  <small>Write to me directly</small>
                </span>
                <button type="button" className="icon-btn" onClick={copyEmail} aria-label="Copy email address" title="Copy email">
                  <CopyIcon />
                </button>
              </div>
              <Link to="/blog" className="connect-item">
                <span className="connect-icon tone-blue">
                  <NewspaperIcon />
                </span>
                <span className="connect-text">
                  <strong>Read the Blog</strong>
                  <small>Notes on what I build and learn</small>
                </span>
              </Link>
              <Link to="/projects" className="connect-item">
                <span className="connect-icon tone-purple">
                  <CollectionIcon />
                </span>
                <span className="connect-text">
                  <strong>See My Work</strong>
                  <small>Projects, research, and experience</small>
                </span>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
