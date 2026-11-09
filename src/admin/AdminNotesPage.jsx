import { useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { CopyIcon, DocumentIcon, DownloadIcon, PencilIcon, TrashIcon, UploadIcon } from "../components/Icons";
import { useToast } from "../context/toast";
import { API_ROOT, ApiError, api } from "../lib/api";
import { copyToClipboard } from "../lib/clipboard";
import { AdminSpinner } from "./AdminLayout";

function formatTime(value) {
  // SQLite CURRENT_TIMESTAMP is UTC without a zone marker.
  return new Date(`${value.replace(" ", "T")}Z`).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function formatBytes(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value < 10 ? value.toFixed(1) : Math.round(value)} ${units[unit]}`;
}

// fetch() can't report upload progress, so files go up with XMLHttpRequest, one per
// request so each stays within the server's per-request size limit.
function uploadFile(file, onProgress) {
  return new Promise((resolve, reject) => {
    const body = new FormData();
    body.append("files", file, file.name);
    const request = new XMLHttpRequest();
    request.open("POST", `${API_ROOT}/admin/files`);
    request.setRequestHeader("X-Requested-With", "portfolio");
    request.upload.onprogress = (event) => event.lengthComputable && onProgress(event.loaded / event.total);
    request.onload = () => {
      let data = null;
      try {
        data = JSON.parse(request.responseText);
      } catch {
        // nginx answers some errors (like a too-large upload) with HTML.
      }
      if (request.status >= 200 && request.status < 300) {
        resolve(data);
      } else {
        reject(new ApiError(request.status, data || (request.status === 413 ? { error: `${file.name} is too large.` } : null)));
      }
    };
    request.onerror = () => reject(new ApiError(0, { error: "Can't reach the server. Check your connection and try again." }));
    request.send(body);
  });
}

const noteShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  body: PropTypes.string.isRequired,
  created_at: PropTypes.string.isRequired,
  updated_at: PropTypes.string.isRequired
});

function Note({ note, onCopy, onSave, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(note.body);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    if (await onSave(note, draft)) {
      setEditing(false);
    }
    setSaving(false);
  }

  return (
    <li className="card card-pad note">
      {editing ? (
        <>
          <label className="sr-only" htmlFor={`note-${note.id}`}>
            Edit note
          </label>
          <textarea
            id={`note-${note.id}`}
            className="input input-mono note-input"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => (event.ctrlKey || event.metaKey) && event.key === "Enter" && save()}
            autoFocus
          />
          <div className="button-row note-edit-actions">
            <button type="button" className="btn btn-primary btn-sm" onClick={save} disabled={saving || !draft.trim()}>
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setDraft(note.body);
                setEditing(false);
              }}
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <pre className="note-body">{note.body}</pre>
          <div className="note-foot">
            <span className="muted small">
              {note.updated_at === note.created_at ? "" : "Edited "}
              {formatTime(note.updated_at)}
            </span>
            <div className="row-actions">
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => onCopy(note)}>
                <CopyIcon />
                Copy
              </button>
              <button
                type="button"
                className="icon-btn"
                title="Edit"
                aria-label="Edit note"
                onClick={() => {
                  setDraft(note.body);
                  setEditing(true);
                }}
              >
                <PencilIcon />
              </button>
              <button
                type="button"
                className="icon-btn icon-btn-danger"
                title="Delete"
                aria-label="Delete note"
                onClick={() => onDelete(note)}
              >
                <TrashIcon />
              </button>
            </div>
          </div>
        </>
      )}
    </li>
  );
}

Note.propTypes = {
  note: noteShape.isRequired,
  onCopy: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
};

export default function AdminNotesPage() {
  const notify = useToast();
  const [notes, setNotes] = useState(null);
  const [drive, setDrive] = useState(null);
  const [draft, setDraft] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [progress, setProgress] = useState(null);
  const [dragging, setDragging] = useState(false);
  const composer = useRef(null);
  const fileInput = useRef(null);

  const load = useCallback(async () => {
    try {
      const [noteData, fileData] = await Promise.all([api("/admin/notes"), api("/admin/files")]);
      setNotes(noteData.notes);
      setDrive(fileData);
    } catch (error) {
      notify(error.message, "error");
    }
  }, [notify]);

  // Coming back to this tab (say, after adding something on your phone) shows the latest.
  useEffect(() => {
    load();
    const refresh = () => document.visibilityState === "visible" && load();
    document.addEventListener("visibilitychange", refresh);
    return () => document.removeEventListener("visibilitychange", refresh);
  }, [load]);

  async function addNote() {
    if (!draft.trim()) {
      return;
    }
    setSavingNote(true);
    try {
      const { note } = await api("/admin/notes", { method: "POST", body: { body: draft } });
      setNotes((current) => [note, ...current]);
      setDraft("");
    } catch (error) {
      notify(error.message, "error");
    } finally {
      setSavingNote(false);
    }
  }

  async function saveNote(note, body) {
    try {
      const { note: saved } = await api(`/admin/notes/${note.id}`, { method: "PUT", body: { body } });
      setNotes((current) => [saved, ...current.filter((item) => item.id !== note.id)]);
      return true;
    } catch (error) {
      notify(error.message, "error");
      return false;
    }
  }

  async function deleteNote(note) {
    if (!window.confirm("Delete this note?")) {
      return;
    }
    try {
      await api(`/admin/notes/${note.id}`, { method: "DELETE" });
      setNotes((current) => current.filter((item) => item.id !== note.id));
    } catch (error) {
      notify(error.message, "error");
    }
  }

  async function copyNote(note) {
    try {
      await copyToClipboard(note.body);
      notify("Copied.", "success");
    } catch {
      notify("Couldn't copy. Select the text and copy it instead.", "error");
    }
  }

  const upload = useCallback(
    async (fileList) => {
      const files = [...fileList];
      if (files.length === 0 || progress !== null || !drive) {
        return;
      }
      const tooBig = files.filter((file) => file.size > drive.maxFileSize);
      if (tooBig.length > 0) {
        notify(`${tooBig.map((file) => file.name).join(", ")}: each file can be at most ${formatBytes(drive.maxFileSize)}.`, "error");
        return;
      }
      const total = files.reduce((sum, file) => sum + file.size, 0) || 1;
      let done = 0;
      let uploaded = 0;
      setProgress(0);
      try {
        for (const file of files) {
          setDrive(await uploadFile(file, (fraction) => setProgress((done + fraction * file.size) / total)));
          done += file.size;
          uploaded += 1;
        }
        notify(files.length === 1 ? `Uploaded ${files[0].name}.` : `Uploaded ${files.length} files.`, "success");
      } catch (error) {
        notify(uploaded > 0 ? `Uploaded ${uploaded} of ${files.length}. ${error.message}` : error.message, "error");
      } finally {
        setProgress(null);
      }
    },
    [drive, notify, progress]
  );

  async function deleteFile(file) {
    if (!window.confirm(`Delete ${file.name}?`)) {
      return;
    }
    try {
      await api(`/admin/files/${file.id}`, { method: "DELETE" });
      setDrive((current) => ({
        ...current,
        files: current.files.filter((item) => item.id !== file.id),
        used: current.used - file.size
      }));
    } catch (error) {
      notify(error.message, "error");
    }
  }

  // Pasting outside a text box: files are uploaded, text goes into the new-note box.
  useEffect(() => {
    function onPaste(event) {
      const target = event.target;
      if (target instanceof HTMLElement && (target.closest("input, textarea") || target.isContentEditable)) {
        return;
      }
      const files = event.clipboardData?.files;
      if (files?.length) {
        event.preventDefault();
        upload(files);
        return;
      }
      const text = event.clipboardData?.getData("text");
      if (text) {
        event.preventDefault();
        setDraft((current) => current + text);
        composer.current?.focus();
      }
    }
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, [upload]);

  if (!notes || !drive) {
    return <AdminSpinner />;
  }

  return (
    <>
      <header className="admin-header">
        <div>
          <h1>Notes &amp; Files</h1>
          <p className="muted">
            Private to you. Save text or files here, then copy or download them on any device you&apos;re signed in on.
          </p>
        </div>
      </header>

      <section className="drive-section" aria-labelledby="notes-heading">
        <h2 id="notes-heading" className="drive-heading">
          Notes
        </h2>
        <div className="card card-pad note-composer">
          <label className="sr-only" htmlFor="new-note">
            New note
          </label>
          <textarea
            id="new-note"
            ref={composer}
            className="input input-mono note-input"
            placeholder="Paste or type something to save..."
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => (event.ctrlKey || event.metaKey) && event.key === "Enter" && addNote()}
          />
          <div className="note-composer-foot">
            <span className="muted small note-hint">Ctrl + Enter to save</span>
            <button type="button" className="btn btn-primary btn-sm" onClick={addNote} disabled={savingNote || !draft.trim()}>
              {savingNote ? "Saving..." : "Save note"}
            </button>
          </div>
        </div>
        {notes.length > 0 && (
          <ul className="note-list">
            {notes.map((note) => (
              <Note key={note.id} note={note} onCopy={copyNote} onSave={saveNote} onDelete={deleteNote} />
            ))}
          </ul>
        )}
      </section>

      <section className="drive-section" aria-labelledby="files-heading">
        <div className="drive-heading-row">
          <h2 id="files-heading" className="drive-heading">
            Files
          </h2>
          <span className="muted small">
            {formatBytes(drive.used)} of {formatBytes(drive.limit)} used
          </span>
        </div>
        <div
          className={`drop-zone${dragging ? " drop-zone-active" : ""}`}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            upload(event.dataTransfer.files);
          }}
        >
          <input
            ref={fileInput}
            type="file"
            multiple
            hidden
            onChange={(event) => {
              upload(event.target.files);
              event.target.value = "";
            }}
          />
          {progress === null ? (
            <>
              <button type="button" className="btn btn-primary" onClick={() => fileInput.current?.click()}>
                <UploadIcon />
                Upload files
              </button>
              <p className="muted small">
                Or drop them here, or paste a copied file or screenshot. Up to {formatBytes(drive.maxFileSize)} each.
              </p>
            </>
          ) : (
            <div className="upload-progress" role="status">
              <p className="small">Uploading... {Math.round(progress * 100)}%</p>
              <div className="bar" aria-hidden="true">
                <div className="bar-fill" style={{ "--pct": `${progress * 100}%` }} />
              </div>
            </div>
          )}
        </div>
        {drive.files.length > 0 && (
          <ul className="file-list">
            {drive.files.map((file) => (
              <li key={file.id} className="card file-row">
                <DocumentIcon />
                <div className="file-info">
                  <span className="file-name">{file.name}</span>
                  <span className="muted small">
                    {formatBytes(file.size)} · {formatTime(file.created_at)}
                  </span>
                </div>
                <div className="row-actions">
                  <a
                    className="btn btn-secondary btn-sm"
                    href={`${API_ROOT}/admin/files/${file.id}/download`}
                    download={file.name}
                  >
                    <DownloadIcon />
                    Download
                  </a>
                  <button
                    type="button"
                    className="icon-btn icon-btn-danger"
                    title="Delete"
                    aria-label={`Delete ${file.name}`}
                    onClick={() => deleteFile(file)}
                  >
                    <TrashIcon />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
