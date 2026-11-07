import { cleanRecord } from "../../shared/contentSchema.js";

// Form inputs are plain strings/booleans; lists are edited as text and split on save.
export function toForm(fields, record = {}) {
  return Object.fromEntries(
    fields.map((field) => {
      const value = record[field.key];
      switch (field.type) {
        case "checkbox":
          return [field.key, value === undefined ? Boolean(field.default) : Boolean(value)];
        case "list":
          return [field.key, (value || []).join(field.separator === "comma" ? ", " : "\n")];
        case "paragraphs":
          return [field.key, (value || []).join("\n\n")];
        case "number":
          return [field.key, value === undefined || value === null ? "" : String(value)];
        default:
          return [field.key, value || ""];
      }
    })
  );
}

export function fromForm(fields, form) {
  return Object.fromEntries(
    fields.map((field) => {
      const value = form[field.key];
      switch (field.type) {
        case "list":
          return [field.key, String(value || "").split(field.separator === "comma" ? "," : "\n")];
        case "paragraphs":
          return [field.key, String(value || "").split(/\n\s*\n/)];
        default:
          return [field.key, value];
      }
    })
  );
}

// Same rules the API applies, so most mistakes are caught before saving.
export function validateForm(fields, form) {
  return cleanRecord(fields, fromForm(fields, form));
}
