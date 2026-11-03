import { postText } from "./blog";

const pages = [
  { title: "About", to: "/", description: "Introduction, education, experience, and focus areas." },
  { title: "Experience", to: "/experience", description: "Work history and education." },
  { title: "Skills", to: "/skills", description: "Technical skills grouped by domain." },
  { title: "Projects", to: "/projects", description: "Projects and research I have worked on." },
  {
    title: "Beyond Work",
    to: "/extracurriculars",
    description: "Teaching, activities, achievements, awards, and certifications."
  },
  { title: "Blog", to: "/blog", description: "Technical articles and engineering notes." },
  { title: "Contact", to: "/contact", description: "Send a message or find other ways to connect." }
];

export const searchGroups = ["Pages", "Projects", "Research", "Blog Posts", "Experience", "Skills", "Achievements"];

export function buildSearchIndex(profileData, posts) {
  return [
    ...pages.map((page) => ({ ...page, group: "Pages", body: "" })),
    ...profileData.projects.map((project) => ({
      group: "Projects",
      title: project.title,
      to: `/projects/${project.id}`,
      description: project.summary,
      body: [project.stack.join(" "), ...(project.content || [])].join(" ")
    })),
    ...profileData.research.map((item) => ({
      group: "Research",
      title: item.title,
      to: `/research/${item.id}`,
      description: item.summary,
      body: [item.stack.join(" "), ...(item.content || [])].join(" ")
    })),
    ...posts.map((post) => ({
      group: "Blog Posts",
      title: post.title,
      to: `/blog/${post.id}`,
      description: post.summary,
      body: [post.category, post.tags.join(" "), postText(post)].join(" ")
    })),
    ...profileData.experience.map((job) => ({
      group: "Experience",
      title: `${job.role} · ${job.company}`,
      to: "/experience",
      description: job.highlights[0],
      body: job.highlights.join(" ")
    })),
    ...profileData.skills.map((skill) => ({
      group: "Skills",
      title: skill.name,
      to: "/skills",
      description: skill.description || skill.category,
      body: skill.category
    })),
    ...[...profileData.achievements, ...profileData.certifications].map((item) => ({
      group: "Achievements",
      title: item.title,
      to: "/extracurriculars",
      description: item.description || item.organization || item.issuer || "",
      body: item.organization || item.issuer || ""
    }))
  ];
}

export function searchTerms(query) {
  return query.toLowerCase().split(/\s+/).filter(Boolean);
}

// Every term must appear somewhere in the entry; title hits rank above body hits.
export function search(index, query) {
  const terms = searchTerms(query);
  if (terms.length === 0) {
    return [];
  }

  return index
    .map((entry) => {
      const title = entry.title.toLowerCase();
      const haystack = `${title} ${entry.description} ${entry.body}`.toLowerCase();
      if (!terms.every((term) => haystack.includes(term))) {
        return null;
      }
      const score = terms.reduce((total, term) => total + (title.includes(term) ? 3 : 1), 0);
      return { ...entry, score };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);
}
