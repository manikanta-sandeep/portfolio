import { useRef, useState } from "react";
import PropTypes from "prop-types";
import PostContent from "../components/PostContent";
import { UploadIcon } from "../components/Icons";
import { useToast } from "../context/toast";
import { api } from "../lib/api";
import { markdownToBlocks } from "../lib/markdown";
import { publicUrl } from "../lib/paths";

const fieldShape = PropTypes.shape({
  key: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  required: PropTypes.bool,
  help: PropTypes.string,
  options: PropTypes.arrayOf(PropTypes.string),
  separator: PropTypes.string,
  upload: PropTypes.oneOf(["image", "pdf"]),
  max: PropTypes.number
});

function UploadButton({ kind, onUploaded }) {
  const notify = useToast();
  const input = useRef(null);
  const [busy, setBusy] = useState(false);

  async function upload(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }
    const body = new FormData();
    body.append("file", file);
    setBusy(true);
    try {
      const { url } = await api("/admin/uploads", { method: "POST", body });
      onUploaded(url);
      notify("File uploaded. Remember to save.", "success");
    } catch (error) {
      notify(error.message, "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <input
        ref={input}
        type="file"
        hidden
        accept={kind === "pdf" ? "application/pdf" : "image/jpeg,image/png,image/gif,image/webp"}
        onChange={upload}
      />
      <button type="button" className="btn btn-secondary" onClick={() => input.current?.click()} disabled={busy}>
        <UploadIcon />
        {busy ? "Uploading..." : "Upload"}
      </button>
    </>
  );
}

UploadButton.propTypes = {
  kind: PropTypes.oneOf(["image", "pdf"]).isRequired,
  onUploaded: PropTypes.func.isRequired
};

function MarkdownField({ id, value, onChange, describedBy }) {
  const [preview, setPreview] = useState(false);
  return (
    <div className="md-field">
      <div className="md-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={!preview} className={!preview ? "active" : ""} onClick={() => setPreview(false)}>
          Write
        </button>
        <button type="button" role="tab" aria-selected={preview} className={preview ? "active" : ""} onClick={() => setPreview(true)}>
          Preview
        </button>
      </div>
      {preview ? (
        <div className="md-preview prose">
          {value.trim() ? <PostContent blocks={markdownToBlocks(value)} /> : <p className="muted">Nothing to preview yet.</p>}
        </div>
      ) : (
        <textarea
          id={id}
          className="input input-mono"
          rows={18}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-describedby={describedBy}
        />
      )}
    </div>
  );
}

MarkdownField.propTypes = {
  id: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  describedBy: PropTypes.string
};

export default function FieldInput({ field, value, error, onChange, idPrefix = "field" }) {
  const id = `${idPrefix}-${field.key}`;
  const helpId = field.help ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [helpId, errorId].filter(Boolean).join(" ") || undefined;
  const common = {
    id,
    "aria-invalid": Boolean(error),
    "aria-describedby": describedBy,
    className: `input${error ? " input-error" : ""}`
  };

  if (field.type === "checkbox") {
    return (
      <div className="form-field form-check">
        <label htmlFor={id}>
          <input id={id} type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} />
          {field.label}
        </label>
        {field.help && <p id={helpId} className="field-help">{field.help}</p>}
      </div>
    );
  }

  let control;
  if (field.type === "markdown") {
    control = <MarkdownField id={id} value={value} onChange={onChange} describedBy={describedBy} />;
  } else if (field.type === "textarea" || field.type === "paragraphs" || (field.type === "list" && field.separator !== "comma")) {
    control = (
      <textarea {...common} rows={field.type === "textarea" ? 3 : 5} value={value} onChange={(event) => onChange(event.target.value)} />
    );
  } else if (field.type === "select") {
    control = (
      <select {...common} value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">None</option>
        {field.options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  } else {
    const type = { email: "email", date: "date", number: "number" }[field.type] || "text";
    control = (
      <input
        {...common}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        {...(type === "number" ? { min: 0, max: 100, step: 0.5 } : {})}
      />
    );
  }

  return (
    <div className="form-field">
      <label htmlFor={id}>
        {field.label}
        {field.required && <span className="required" aria-hidden="true"> *</span>}
      </label>
      {field.upload ? (
        <div className="input-row">
          {control}
          <UploadButton kind={field.upload} onUploaded={onChange} />
        </div>
      ) : (
        control
      )}
      {field.upload === "image" && value && /^(https?:|\/)/.test(value) && (
        <img className="upload-preview" src={publicUrl(value)} alt="" />
      )}
      {field.help && <p id={helpId} className="field-help">{field.help}</p>}
      {error && <p id={errorId} className="field-error">{error}</p>}
    </div>
  );
}

FieldInput.propTypes = {
  field: fieldShape.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]).isRequired,
  error: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  idPrefix: PropTypes.string
};
