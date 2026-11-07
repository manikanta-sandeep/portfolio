import { useEffect, useState } from "react";
import { PROFILE_FIELDS } from "../../shared/contentSchema.js";
import { useContent } from "../context/content";
import { useToast } from "../context/toast";
import { api } from "../lib/api";
import { AdminSpinner } from "./AdminLayout";
import FieldInput from "./FieldInput";
import { fromForm, toForm, validateForm } from "./forms";
import useUnsavedChanges from "./useUnsavedChanges";

const GROUPS = [
  { title: "Identity", keys: ["displayName", "fullName", "initials", "pronouns", "photo"] },
  { title: "Headline", keys: ["role", "headline", "organizationName", "organizationUrl", "location", "availability"] },
  { title: "Bio page", keys: ["summary", "interests", "interestTags"] },
  { title: "Contact & links", keys: ["email", "github", "linkedin", "kaggle", "resumeFile", "responseTime", "tagline"] },
  { title: "Site settings", keys: ["showViews"] }
];

export default function AdminProfilePage() {
  const notify = useToast();
  const { reload } = useContent();
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  useUnsavedChanges(dirty);

  useEffect(() => {
    const controller = new AbortController();
    api("/admin/profile", { signal: controller.signal })
      .then((data) => setForm(toForm(PROFILE_FIELDS, data.profile)))
      .catch((error) => error.name !== "AbortError" && notify(error.message, "error"));
    return () => controller.abort();
  }, [notify]);

  if (!form) {
    return <AdminSpinner />;
  }

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setDirty(true);
  }

  async function save(event) {
    event.preventDefault();
    const { errors: found } = validateForm(PROFILE_FIELDS, form);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      notify("Please fix the highlighted fields.", "error");
      return;
    }
    setSaving(true);
    try {
      const data = await api("/admin/profile", { method: "PUT", body: fromForm(PROFILE_FIELDS, form) });
      setForm(toForm(PROFILE_FIELDS, data.profile));
      setDirty(false);
      await reload();
      notify("Profile saved.", "success");
    } catch (error) {
      setErrors(error.fields || {});
      notify(error.message, "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} noValidate>
      <header className="admin-header">
        <h1>Profile</h1>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
      </header>
      {GROUPS.map((group) => (
        <section key={group.title} className="card card-pad admin-form-section">
          <h2 className="card-title">{group.title}</h2>
          <div className="form-grid">
            {group.keys.map((key) => {
              const field = PROFILE_FIELDS.find((entry) => entry.key === key);
              return (
                <FieldInput
                  key={key}
                  field={field}
                  value={form[key]}
                  error={errors[key]}
                  onChange={(value) => update(key, value)}
                  idPrefix="profile"
                />
              );
            })}
          </div>
        </section>
      ))}
    </form>
  );
}
