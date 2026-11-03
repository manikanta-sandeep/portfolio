import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { COLLECTION_SCHEMAS } from "../../shared/contentSchema.js";
import { ArrowDownIcon, ArrowUpIcon, PlusIcon, TrashIcon } from "../components/Icons";
import { useContent } from "../context/content";
import { useToast } from "../context/toast";
import { api } from "../lib/api";
import { AdminSpinner } from "./AdminLayout";
import FieldInput from "./FieldInput";
import { fromForm, toForm, validateForm } from "./forms";
import useUnsavedChanges from "./useUnsavedChanges";

let nextKey = 0;
const withKey = (form) => ({ ...form, _key: `entry-${(nextKey += 1)}` });

export default function AdminCollectionPage() {
  const { name } = useParams();
  const schema = COLLECTION_SCHEMAS[name];
  const notify = useToast();
  const { reload } = useContent();
  const [entries, setEntries] = useState(null);
  const [open, setOpen] = useState(null);
  const [errors, setErrors] = useState({});
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  useUnsavedChanges(dirty);

  useEffect(() => {
    if (!schema) {
      return undefined;
    }
    setEntries(null);
    setOpen(null);
    setErrors({});
    setDirty(false);
    const controller = new AbortController();
    api(`/admin/collections/${name}`, { signal: controller.signal })
      .then((data) => setEntries(data.items.map((item) => withKey(toForm(schema.fields, item)))))
      .catch((error) => error.name !== "AbortError" && notify(error.message, "error"));
    return () => controller.abort();
  }, [name, schema, notify]);

  if (!schema) {
    return <Navigate to="/admin" replace />;
  }
  if (!entries) {
    return <AdminSpinner />;
  }

  function change(updater) {
    setEntries(updater);
    setDirty(true);
  }

  function updateField(key, field, value) {
    change((current) => current.map((entry) => (entry._key === key ? { ...entry, [field]: value } : entry)));
    setErrors((current) => ({ ...current, [key]: { ...current[key], [field]: undefined } }));
  }

  function move(index, offset) {
    change((current) => {
      const next = [...current];
      const [entry] = next.splice(index, 1);
      next.splice(index + offset, 0, entry);
      return next;
    });
  }

  function add() {
    const entry = withKey(toForm(schema.fields, {}));
    change((current) => [...current, entry]);
    setOpen(entry._key);
  }

  function remove(entry) {
    if (window.confirm(`Remove "${entry[schema.titleKey] || "this entry"}"?`)) {
      change((current) => current.filter((item) => item._key !== entry._key));
    }
  }

  async function save() {
    const found = {};
    entries.forEach((entry) => {
      const { errors: entryErrors } = validateForm(schema.fields, entry);
      if (Object.keys(entryErrors).length > 0) {
        found[entry._key] = entryErrors;
      }
    });
    setErrors(found);
    const firstInvalid = entries.find((entry) => found[entry._key]);
    if (firstInvalid) {
      setOpen(firstInvalid._key);
      notify("Please fix the highlighted fields.", "error");
      return;
    }

    setSaving(true);
    try {
      const items = entries.map((entry) => fromForm(schema.fields, entry));
      const data = await api(`/admin/collections/${name}`, { method: "PUT", body: { items } });
      setEntries(data.items.map((item) => withKey(toForm(schema.fields, item))));
      setDirty(false);
      setOpen(null);
      await reload();
      notify(`${schema.label} saved.`, "success");
    } catch (error) {
      const failed = error.index !== undefined ? entries[error.index] : null;
      if (failed) {
        setErrors({ [failed._key]: error.fields || {} });
        setOpen(failed._key);
      }
      notify(error.message, "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <header className="admin-header">
        <div>
          <h1>{schema.label}</h1>
          <p className="muted small">Order here is the order on the site. Changes go live when you save.</p>
        </div>
        <div className="button-row">
          <button type="button" className="btn btn-secondary" onClick={add}>
            <PlusIcon />
            Add
          </button>
          <button type="button" className="btn btn-primary" onClick={save} disabled={saving || !dirty}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </header>

      {entries.length === 0 && (
        <div className="empty-state">
          <p>Nothing here yet. This section is hidden on the site until it has entries.</p>
        </div>
      )}

      <ol className="entry-list">
        {entries.map((entry, index) => {
          const isOpen = open === entry._key;
          const hasErrors = Boolean(errors[entry._key] && Object.values(errors[entry._key]).some(Boolean));
          return (
            <li key={entry._key} className={`card entry${hasErrors ? " entry-invalid" : ""}`}>
              <div className="entry-head">
                <button
                  type="button"
                  className="entry-toggle"
                  onClick={() => setOpen(isOpen ? null : entry._key)}
                  aria-expanded={isOpen}
                >
                  <strong>{entry[schema.titleKey] || "Untitled"}</strong>
                  {schema.subtitleKey && entry[schema.subtitleKey] && <span className="muted small">{entry[schema.subtitleKey]}</span>}
                </button>
                <div className="row-actions">
                  <button type="button" className="icon-btn" onClick={() => move(index, -1)} disabled={index === 0} aria-label="Move up" title="Move up">
                    <ArrowUpIcon />
                  </button>
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => move(index, 1)}
                    disabled={index === entries.length - 1}
                    aria-label="Move down"
                    title="Move down"
                  >
                    <ArrowDownIcon />
                  </button>
                  <button type="button" className="icon-btn icon-btn-danger" onClick={() => remove(entry)} aria-label="Remove" title="Remove">
                    <TrashIcon />
                  </button>
                </div>
              </div>
              {isOpen && (
                <div className="form-grid entry-body">
                  {schema.fields.map((field) => (
                    <FieldInput
                      key={field.key}
                      field={field}
                      value={entry[field.key]}
                      error={errors[entry._key]?.[field.key]}
                      onChange={(value) => updateField(entry._key, field.key, value)}
                      idPrefix={entry._key}
                    />
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </>
  );
}
