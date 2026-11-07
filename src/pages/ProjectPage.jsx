import PropTypes from "prop-types";
import { Link, useParams } from "react-router-dom";
import LoopVideo from "../components/LoopVideo";
import Seo from "../components/Seo";
import { ArrowLeftIcon, BookOpenIcon, ExternalLinkIcon, GitHubIcon } from "../components/Icons";
import { useContent } from "../context/content";
import { siteConfig } from "../data/profileData";
import { publicUrl } from "../lib/paths";
import NotFoundPage from "./NotFoundPage";

// The optional animation or image at the top of a project page.
function ProjectMedia({ item }) {
  const label = item.mediaCaption || item.title;
  return (
    <figure className="detail-media">
      {/\.(mp4|webm)$/i.test(item.media) ? (
        <LoopVideo src={item.media} poster={item.mediaPoster} label={label} />
      ) : (
        <img className="detail-media-image" src={publicUrl(item.media)} alt={label} />
      )}
      {item.mediaCaption && <figcaption>{item.mediaCaption}</figcaption>}
    </figure>
  );
}

ProjectMedia.propTypes = {
  item: PropTypes.shape({
    title: PropTypes.string.isRequired,
    media: PropTypes.string.isRequired,
    mediaPoster: PropTypes.string,
    mediaCaption: PropTypes.string
  }).isRequired
};

const KINDS = {
  project: { label: "Project", basePath: "/projects", collection: "projects", schemaType: "CreativeWork" },
  research: { label: "Research", basePath: "/research", collection: "research", schemaType: "ScholarlyArticle" }
};

const breadcrumbLinks = [
  { label: "About", to: "/" },
  { label: "Experience", to: "/experience" },
  { label: "Projects", to: "/projects" },
  { label: "Skills", to: "/skills" },
  { label: "Beyond Work", to: "/extracurriculars" }
];

export default function ProjectPage({ kind = "project" }) {
  const { id } = useParams();
  const { profile: profileData } = useContent();
  const { label, basePath, collection, schemaType } = KINDS[kind];
  const item = profileData[collection].find((entry) => entry.id === id);

  if (!item) {
    return <NotFoundPage />;
  }

  const path = `${basePath}/${item.id}`;
  const schema = {
    "@context": "https://schema.org",
    "@type": schemaType,
    [schemaType === "ScholarlyArticle" ? "headline" : "name"]: item.title,
    description: item.summary,
    keywords: item.stack.join(", "),
    url: `${siteConfig.siteUrl}${path}`
  };

  return (
    <div className="container detail-page">
      <Seo title={item.title} description={item.summary} path={path} type="article" schema={schema} />

      <nav className="crumb-nav" aria-label="Portfolio">
        <Link to="/" className="crumb-home">
          {profileData.displayName}
        </Link>
        {breadcrumbLinks.map((link) => (
          <span key={link.to} className="crumb-item">
            <span className="crumb-sep" aria-hidden="true">
              |
            </span>
            <Link to={link.to}>{link.label}</Link>
          </span>
        ))}
      </nav>

      <article className="card detail-card">
        <header className="detail-header">
          <p className="eyebrow">{label}</p>
          <h1>{item.title}</h1>
          <div className="tag-row">
            {item.stack.map((tech) => (
              <span key={tech} className="tag">
                {tech}
              </span>
            ))}
          </div>
          {(item.github || item.demo || item.writeup) && (
            <div className="button-row">
              {item.writeup &&
                (item.writeup.startsWith("/") ? (
                  <Link className="btn btn-primary" to={item.writeup}>
                    <BookOpenIcon />
                    Read the write-up
                  </Link>
                ) : (
                  <a className="btn btn-primary" href={item.writeup} target="_blank" rel="noopener noreferrer">
                    <BookOpenIcon />
                    Read the write-up
                  </a>
                ))}
              {item.github && (
                <a className="btn btn-dark" href={item.github} target="_blank" rel="noopener noreferrer">
                  <GitHubIcon />
                  View Code
                </a>
              )}
              {item.demo && (
                <a className="btn btn-primary" href={item.demo} target="_blank" rel="noopener noreferrer">
                  <ExternalLinkIcon />
                  Live Demo
                </a>
              )}
            </div>
          )}
        </header>
        {item.media && <ProjectMedia item={item} />}
        <div className="detail-body prose">
          <p className="lead">{item.summary}</p>
          {item.content?.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </article>

      <div className="detail-footer">
        <Link className="text-link" to="/projects">
          <ArrowLeftIcon />
          All projects
        </Link>
      </div>
    </div>
  );
}

ProjectPage.propTypes = {
  kind: PropTypes.oneOf(Object.keys(KINDS))
};
