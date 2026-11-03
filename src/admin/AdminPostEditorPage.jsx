import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { POST_FIELDS } from "../../shared/contentSchema.js";
import { ArrowLeftIcon, EyeIcon } from "../components/Icons";
import { useContent } from "../context/content";
import { useToast } from "../context/toast";
import { api } from "../lib/api";
import { AdminSpinner } from "./AdminLayout";
import FieldInput from "./FieldInput";
import { fromForm, toForm, validateForm } from "./forms";
import useUnsavedChanges from "./useUnsavedChanges";

const today = () => new Date().toISOString().slice(0, 10);

function postToRecord(post) {
  return { ...post, slug: post.id, sourceUrl: post.links?.source, demoUrl: post.links?.demo };
}

const SIDEBAR_KEYS = ["published", "featured", "date", "category", "tags", "status", "cover", "stack", "sourceUrl", "demoUrl", "slug"];
const mainFields = POST_FIELDS.filter((field) => !SIDEBAR_KEYS.includes(field.key));
const sideFields = SIDEBAR_KEYS.map((key) => POST_FIELDS.find((field) => field.key === key));

export default function AdminPostEditorPage() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const notify = useToast();
  const { reload } = useContent();
  const [form, setForm] = useState(isNew ? toForm(POST_FIELDS, { date: today(), published: true }) : null);
  const [post, setPost] = useState(null);
  const [errors, setErrors] = useState({});
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  useUnsavedChanges(dirty);

  useEffect(() => {
    if (isNew) {
      return undefined;
    }
    const controller = new AbortController();
    api(`/admin/posts/${id}`, { signal: controller.signal })
      .then((data) => {
        setPost(data.post);
        setForm(toForm(POST_FIELDS, postToRecord(data.post)));
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          notify(error.message, "error");
          navigate("/admin/posts", { replace: true });
        }
      });
    return () => controller.abort();
  }, [id, isNew, navigate, notify]);

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
    const { errors: found } = validateForm(POST_FIELDS, form);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      notify("Please fix the highlighted fields.", "error");
      return;
    }
    setSaving(true);
    try {
      const body = fromForm(POST_FIELDS, form);
      const data = isNew
        ? await api("/admin/posts", { method: "POST", body })
        : await api(`/admin/posts/${id}`, { method: "PUT", body });
      setDirty(false);
      setPost(data.post);
      setForm(toForm(POST_FIELDS, postToRecord(data.post)));
      await reload();
      notify(data.post.published ? "Post saved and published." : "Draft saved.", "success");
      if (isNew) {
        navigate(`/admin/posts/${data.post.dbId}`, { replace: true });
      }
    } catch (error) {
      setErrors(error.fields || {});
      notify(error.message, "error");
    } finally {
      setSaving(false);
    }
  }

  const renderField = (field) => (
    <FieldInput
      key={field.key}
      field={field}
      value={form[field.key]}
      error={errors[field.key]}
      onChange={(value) => update(field.key, value)}
      idPrefix="post"
    />
  );

  return (
    <form onSubmit={save} noValidate>
      <header className="admin-header">
        <div>
          <Link className="text-link" to="/admin/posts">
            <ArrowLeftIcon />
            All posts
          </Link>
          <h1>{isNew ? "New post" : "Edit post"}</h1>
        </div>
        <div className="button-row">
          {post?.published && (
            <Link className="btn btn-secondary" to={`/blog/${post.id}`}>
              <EyeIcon />
              View ({post.views.toLocaleString()} views)
            </Link>
          )}
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </header>

      <div className="editor-grid">
        <div className="card card-pad editor-main">{mainFields.map(renderField)}</div>
        <aside className="card card-pad editor-side">{sideFields.map(renderField)}</aside>
      </div>
    </form>
  );
}
