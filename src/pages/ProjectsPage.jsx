import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import Reveal from "../components/Reveal";
import Seo from "../components/Seo";
import { ArrowRightIcon, ExternalLinkIcon, GitHubIcon } from "../components/Icons";
import { useContent } from "../context/content";

function WorkCard({ item, basePath }) {
  const detailPath = `${basePath}/${item.id}`;

  return (
    <Reveal as="article" className="card card-pad card-hover">
      <div className="work-card-head">
        <h2 className="card-title-lg">
          <Link to={detailPath}>{item.title}</Link>
        </h2>
        {(item.github || item.demo) && (
          <div className="button-row">
            {item.github && (
              <a
                className="btn btn-dark btn-sm"
                href={item.github}
                target="_blank"
                rel="noopener noreferrer"
                title="View on GitHub"
                aria-label={`${item.title} on GitHub`}
              >
                <GitHubIcon />
              </a>
            )}
            {item.demo && (
              <a className="btn btn-primary btn-sm" href={item.demo} target="_blank" rel="noopener noreferrer">
                <ExternalLinkIcon />
                Demo
              </a>
            )}
          </div>
        )}
      </div>
      <div className="tag-row">
        {item.stack.map((tech) => (
          <span key={tech} className="tag">
            {tech}
          </span>
        ))}
      </div>
      <p>{item.summary}</p>
      <Link className="text-link" to={detailPath}>
        View Details
        <ArrowRightIcon />
      </Link>
    </Reveal>
  );
}

WorkCard.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    summary: PropTypes.string.isRequired,
    stack: PropTypes.arrayOf(PropTypes.string).isRequired,
    github: PropTypes.string,
    demo: PropTypes.string
  }).isRequired,
  basePath: PropTypes.string.isRequired
};

export default function ProjectsPage() {
  const { profile: profileData } = useContent();
  return (
    <>
      <Seo
        title="Projects"
        description={`Projects and research by ${profileData.displayName}.`}
        path="/projects"
      />

      <header className="page-header">
        <h1>Projects</h1>
        <p>Computer vision work from my M.S. at NYU, plus earlier projects and research.</p>
      </header>

      <section className="page-section card-stack" aria-label="Projects">
        {profileData.projects.map((project) => (
          <WorkCard key={project.id} item={project} basePath="/projects" />
        ))}
      </section>

      {profileData.research.length > 0 && (
        <section className="page-section" aria-labelledby="research-heading">
          <h2 id="research-heading" className="section-title">
            Research
          </h2>
          <div className="card-stack">
            {profileData.research.map((item) => (
              <WorkCard key={item.id} item={item} basePath="/research" />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
