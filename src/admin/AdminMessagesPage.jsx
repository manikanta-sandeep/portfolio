import { useCallback, useEffect, useState } from "react";
import { MailIcon, TrashIcon } from "../components/Icons";
import { useToast } from "../context/toast";
import { api } from "../lib/api";
import { AdminSpinner } from "./AdminLayout";

function formatTimestamp(value) {
  // SQLite CURRENT_TIMESTAMP is UTC without a zone marker.
  return new Date(`${value.replace(" ", "T")}Z`).toLocaleString();
}

export default function AdminMessagesPage() {
  const notify = useToast();
  const [messages, setMessages] = useState(null);

  const load = useCallback(async () => {
    try {
      setMessages((await api("/admin/messages")).messages);
    } catch (error) {
      notify(error.message, "error");
    }
  }, [notify]);

  useEffect(() => {
    load();
  }, [load]);

  async function setRead(message, read) {
    try {
      await api(`/admin/messages/${message.id}`, { method: "PATCH", body: { read } });
      setMessages((current) => current.map((item) => (item.id === message.id ? { ...item, is_read: read } : item)));
    } catch (error) {
      notify(error.message, "error");
    }
  }

  async function remove(message) {
    if (!window.confirm(`Delete the message from ${message.name}?`)) {
      return;
    }
    try {
      await api(`/admin/messages/${message.id}`, { method: "DELETE" });
      setMessages((current) => current.filter((item) => item.id !== message.id));
    } catch (error) {
      notify(error.message, "error");
    }
  }

  if (!messages) {
    return <AdminSpinner />;
  }

  return (
    <>
      <header className="admin-header">
        <h1>Messages</h1>
      </header>
      {messages.length === 0 ? (
        <div className="empty-state">
          <p>No messages yet. Messages sent from the contact form appear here.</p>
        </div>
      ) : (
        <ul className="message-list">
          {messages.map((message) => (
            <li key={message.id} className={`card card-pad message${message.is_read ? "" : " message-unread"}`}>
              <div className="message-head">
                <div>
                  <strong>{message.name}</strong> <span className="muted small">&lt;{message.email}&gt;</span>
                  <p className="muted small">{formatTimestamp(message.created_at)}</p>
                </div>
                <div className="row-actions">
                  <a
                    className="icon-btn"
                    href={`mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject || "your message"}`)}`}
                    title="Reply by email"
                    aria-label={`Reply to ${message.name}`}
                    onClick={() => !message.is_read && setRead(message, true)}
                  >
                    <MailIcon />
                  </a>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setRead(message, !message.is_read)}>
                    Mark {message.is_read ? "unread" : "read"}
                  </button>
                  <button type="button" className="icon-btn icon-btn-danger" onClick={() => remove(message)} title="Delete" aria-label={`Delete message from ${message.name}`}>
                    <TrashIcon />
                  </button>
                </div>
              </div>
              {message.subject && <p className="message-subject">{message.subject}</p>}
              <p className="message-body">{message.message}</p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
