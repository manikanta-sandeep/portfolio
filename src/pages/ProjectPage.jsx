import { Link, Navigate, useParams } from "react-router-dom";
import Seo from "../components/Seo";
import { profileData, siteConfig } from "../data/profileData";

export default function ProjectPage() {
  const { id } = useParams();
  const project = profileData.projects.find((entry) => entry.id === id);

  if (!project) {
    return <Navigate to="/" replace />;
  }

  const projectSchema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.summary,
    keywords: project.stack.join(", "),
    url: `${siteConfig.siteUrl}/projects/${project.id}`
  };

  return (
    <>
      <Seo
        title={project.title}
        description={project.summary}
        path={`/projects/${project.id}`}
        type="article"
        schema={projectSchema}
      />

      <header className="site-header" role="banner">
        <div className="brand-block">
          <p className="eyebrow">Project</p>
          <h1>{project.title}</h1>
        </div>
        <nav aria-label="Project Navigation">
          <ul className="nav-list">
            <li>
              <Link to="/">Back to Portfolio</Link>
            </li>
            <li>
              <Link to="/blog">Blog</Link>
            </li>
          </ul>
        </nav>
      </header>

      <main>
        <article className="panel reveal article-layout">
          <p className="meta-line">{project.stack.join(" · ")}</p>
          {project.content?.map((paragraph, index) => (
            <p key={`${project.id}-${index}`}>{paragraph}</p>
          ))}
        </article>
      </main>
    </>
  );
}
