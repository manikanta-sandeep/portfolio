// Field definitions for everything editable in /admin. The admin UI builds its forms from
// these, and the API validates saves with cleanRecord(), so the two can never disagree.
//
// Field types: text, textarea, markdown, url, email, slug, date, number, checkbox,
// select (with options), list (string array; separator "comma" or one per line),
// paragraphs (string array separated by blank lines).

export const SKILL_LEVELS = ["Expert", "Advanced", "Intermediate", "Beginner"];
export const POST_STATUSES = ["Completed", "In Progress"];

export const PROFILE_FIELDS = [
  { key: "displayName", label: "Display name", type: "text", required: true, max: 80 },
  { key: "fullName", label: "Full legal name", type: "text", max: 120 },
  { key: "initials", label: "Initials", type: "text", required: true, max: 3, help: "Shown in the logo and when there is no photo." },
  { key: "pronouns", label: "Pronouns", type: "text", max: 30, help: "Optional, shown next to your name, e.g. (they/them)." },
  { key: "role", label: "Role", type: "text", max: 80 },
  { key: "headline", label: "Headline", type: "text", max: 120 },
  { key: "organizationName", label: "Organization", type: "text", max: 120 },
  { key: "organizationUrl", label: "Organization URL", type: "url" },
  { key: "photo", label: "Photo URL", type: "url", upload: "image", help: "Upload a headshot or paste a URL. Initials are shown when empty." },
  { key: "location", label: "Location", type: "text", max: 120 },
  { key: "summary", label: "Professional summary", type: "textarea", required: true, max: 2000 },
  { key: "availability", label: "Availability", type: "text", max: 300 },
  { key: "email", label: "Email", type: "email", required: true },
  { key: "github", label: "GitHub URL", type: "url" },
  { key: "linkedin", label: "LinkedIn URL", type: "url" },
  { key: "resumeFile", label: "Resume URL", type: "url", upload: "pdf", help: "Upload a PDF or paste a URL." },
  { key: "tagline", label: "Footer tagline", type: "text", max: 200 },
  { key: "responseTime", label: "Reply time", type: "text", max: 40, help: 'Shown on the contact page, e.g. "24-48 hours".' },
  { key: "interests", label: "Interests & focus areas", type: "markdown", max: 5000 },
  { key: "interestTags", label: "Interest tags", type: "list", separator: "comma" }
];

const workFields = [
  { key: "id", label: "URL slug", type: "slug", required: true, help: "Used in the page address, e.g. my-project." },
  { key: "title", label: "Title", type: "text", required: true, max: 200 },
  { key: "summary", label: "Summary", type: "textarea", required: true, max: 1000 },
  { key: "stack", label: "Tech stack", type: "list", separator: "comma" },
  { key: "github", label: "GitHub URL", type: "url" },
  { key: "demo", label: "Demo URL", type: "url" },
  { key: "content", label: "Details", type: "paragraphs", help: "Separate paragraphs with a blank line." }
];

export const COLLECTION_SCHEMAS = {
  experience: {
    label: "Experience",
    titleKey: "role",
    subtitleKey: "company",
    fields: [
      { key: "role", label: "Role", type: "text", required: true, max: 120 },
      { key: "company", label: "Company", type: "text", required: true, max: 120 },
      { key: "companyUrl", label: "Company URL", type: "url" },
      { key: "location", label: "Location", type: "text", max: 120 },
      { key: "period", label: "Period", type: "text", required: true, max: 60, help: "e.g. Apr 2025 – Present" },
      { key: "highlights", label: "Highlights", type: "list", help: "One per line." }
    ]
  },
  education: {
    label: "Education",
    titleKey: "degree",
    subtitleKey: "institution",
    fields: [
      { key: "degree", label: "Degree", type: "text", required: true, max: 160 },
      { key: "institution", label: "Institution", type: "text", required: true, max: 200 },
      { key: "url", label: "Institution URL", type: "url" },
      { key: "gpa", label: "GPA", type: "text", max: 30 },
      { key: "period", label: "Period", type: "text", required: true, max: 60 }
    ]
  },
  skills: {
    label: "Skills",
    titleKey: "name",
    subtitleKey: "category",
    fields: [
      { key: "name", label: "Skill", type: "text", required: true, max: 80 },
      { key: "category", label: "Category", type: "text", required: true, max: 60 },
      { key: "level", label: "Level", type: "select", options: SKILL_LEVELS, help: "Shows a proficiency bar." },
      { key: "years", label: "Years of experience", type: "number" },
      { key: "featured", label: "Featured", type: "checkbox" },
      { key: "description", label: "Description", type: "textarea", max: 500 }
    ]
  },
  projects: {
    label: "Projects",
    titleKey: "title",
    fields: [...workFields.slice(0, 4), { key: "featured", label: "Featured on Bio page", type: "checkbox" }, ...workFields.slice(4)]
  },
  research: { label: "Research", titleKey: "title", fields: workFields },
  teaching: {
    label: "Teaching",
    titleKey: "subject",
    subtitleKey: "institution",
    fields: [
      { key: "subject", label: "Subject", type: "text", required: true, max: 120 },
      { key: "institution", label: "Institution", type: "text", max: 200 },
      { key: "period", label: "Period", type: "text", max: 60 },
      { key: "description", label: "Description", type: "textarea", max: 1000 }
    ]
  },
  activities: {
    label: "Activities",
    titleKey: "role",
    subtitleKey: "organization",
    fields: [
      { key: "role", label: "Role", type: "text", required: true, max: 120 },
      { key: "organization", label: "Organization", type: "text", required: true, max: 160 },
      { key: "url", label: "Organization URL", type: "url" },
      { key: "location", label: "Location", type: "text", max: 120 },
      { key: "period", label: "Period", type: "text", max: 60 },
      { key: "current", label: "Current", type: "checkbox" },
      { key: "type", label: "Type", type: "text", max: 40, help: "e.g. Competition, Volunteering" },
      { key: "description", label: "Description", type: "textarea", max: 1000 }
    ]
  },
  achievements: {
    label: "Achievements",
    titleKey: "title",
    subtitleKey: "organization",
    fields: [
      { key: "title", label: "Title", type: "text", required: true, max: 200 },
      { key: "organization", label: "Organization", type: "text", max: 160 },
      { key: "date", label: "Date", type: "text", max: 40 },
      { key: "description", label: "Description", type: "textarea", max: 1000 },
      { key: "featured", label: "Featured", type: "checkbox" }
    ]
  },
  certifications: {
    label: "Certifications",
    titleKey: "title",
    subtitleKey: "issuer",
    fields: [
      { key: "title", label: "Title", type: "text", required: true, max: 200 },
      { key: "issuer", label: "Issuer", type: "text", max: 160 }
    ]
  }
};

export const POST_FIELDS = [
  { key: "title", label: "Title", type: "text", required: true, max: 200 },
  { key: "slug", label: "URL slug", type: "slug", help: "Leave empty to generate it from the title." },
  { key: "subtitle", label: "Subtitle", type: "text", max: 300 },
  { key: "summary", label: "Summary", type: "textarea", required: true, max: 600 },
  { key: "category", label: "Category", type: "text", required: true, max: 60 },
  { key: "tags", label: "Tags", type: "list", separator: "comma" },
  { key: "date", label: "Publish date", type: "date", required: true },
  { key: "published", label: "Published (unchecked = draft)", type: "checkbox" },
  { key: "featured", label: "Featured", type: "checkbox" },
  { key: "status", label: "Project status badge", type: "select", options: POST_STATUSES },
  { key: "cover", label: "Cover image URL", type: "url", upload: "image" },
  { key: "stack", label: "Built with", type: "list", separator: "comma" },
  { key: "sourceUrl", label: "Source code URL", type: "url" },
  { key: "demoUrl", label: "Live demo URL", type: "url" },
  { key: "content", label: "Content (Markdown)", type: "markdown", max: 200000 }
];

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const DEFAULT_MAX = 2000;
const LIST_ITEM_MAX = 2000;

export function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Links must be absolute http(s)/mailto URLs or site paths; this keeps javascript: URLs out.
export function isSafeUrl(value) {
  return /^(https?:\/\/[^\s]+|mailto:[^\s]+|\/[^\s]*)$/i.test(value);
}

// Normalizes form input against a field list. Returns the cleaned record and a map of
// field key -> error message (empty when valid).
export function cleanRecord(fields, input = {}) {
  const value = {};
  const errors = {};

  fields.forEach((field) => {
    const raw = input[field.key];

    if (field.type === "checkbox") {
      value[field.key] = raw === true || raw === "true" || raw === 1;
      return;
    }

    if (field.type === "number") {
      if (raw === "" || raw === null || raw === undefined) {
        return;
      }
      const number = Number(raw);
      if (!Number.isFinite(number) || number < 0 || number > 100) {
        errors[field.key] = `${field.label} must be a number between 0 and 100.`;
      } else {
        value[field.key] = number;
      }
      return;
    }

    if (field.type === "list" || field.type === "paragraphs") {
      const items = (Array.isArray(raw) ? raw : []).map((item) => String(item).trim()).filter(Boolean);
      if (items.some((item) => item.length > LIST_ITEM_MAX)) {
        errors[field.key] = `Each ${field.label.toLowerCase()} entry must be under ${LIST_ITEM_MAX} characters.`;
      } else if (field.required && items.length === 0) {
        errors[field.key] = `${field.label} is required.`;
      }
      value[field.key] = items;
      return;
    }

    const text = raw === null || raw === undefined ? "" : String(raw).trim();
    const max = field.max || DEFAULT_MAX;
    if (field.required && !text) {
      errors[field.key] = `${field.label} is required.`;
    } else if (text.length > max) {
      errors[field.key] = `${field.label} must be at most ${max} characters.`;
    } else if (text && field.type === "url" && !isSafeUrl(text)) {
      errors[field.key] = `${field.label} must start with https://, http://, mailto:, or /.`;
    } else if (text && field.type === "email" && !EMAIL.test(text)) {
      errors[field.key] = `${field.label} must be a valid email address.`;
    } else if (text && field.type === "slug" && !SLUG.test(text)) {
      errors[field.key] = `${field.label} may only use lowercase letters, numbers, and single hyphens.`;
    } else if (text && field.type === "date" && (!DATE.test(text) || Number.isNaN(Date.parse(text)))) {
      errors[field.key] = `${field.label} must be a date (YYYY-MM-DD).`;
    } else if (text && field.type === "select" && !field.options.includes(text)) {
      errors[field.key] = `${field.label} must be one of: ${field.options.join(", ")}.`;
    }
    value[field.key] = text;
  });

  return { value, errors };
}
