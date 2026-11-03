import { Link } from "react-router-dom";
import Reveal from "../components/Reveal";
import Seo from "../components/Seo";
import { ArrowRightIcon, GitHubIcon } from "../components/Icons";
import PostContent from "../components/PostContent";
import { useContent } from "../context/content";
import { siteConfig } from "../data/profileData";
import { markdownToBlocks } from "../lib/markdown";
import { homeSchema } from "../lib/schema";

const INTEREST_TONES = ["blue", "green", "purple", "orange", "pink"];

export default function HomePage() {
  const { profile: profileData } = useContent();
  const featuredProjects = profileData.projects.filter((project) => project.featured);

  return (
    <>
      <Seo
        fullTitle={siteConfig.homeTitle}
        description={siteConfig.defaultDescription}
        path="/"
        type="profile"
        schema={homeSchema(profileData, siteConfig)}
      />

      <Reveal as="section" className="page-section" aria-labelledby="summary-heading">
        <div className="section-head">
          <h2 id="summary-heading" className="section-title">
            About Me
          </h2>
        </div>
        <p className="lead">{profileData.summary}</p>
        <p className="muted">
          {profileData.location} · {profileData.availability}
        </p>
      </Reveal>

      <Reveal as="section" className="page-section" aria-labelledby="education-heading">
        <h2 id="education-heading" className="section-title">
          Education
        </h2>
        <div className="rule-list">
          {profileData.education.map((item) => (
            <div key={item.degree} className="rule-item rule-blue">
              <h3 className="item-title">
                {item.degree} {item.gpa && <span className="accent-text">({item.gpa})</span>}
              </h3>
              <p className="item-org">
                {item.url ? (
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    {item.institution}
                  </a>
                ) : (
                  item.institution
                )}
              </p>
              <p className="item-meta">{item.period}</p>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal as="section" className="page-section" aria-labelledby="experience-heading">
        <h2 id="experience-heading" className="section-title">
          Experience
        </h2>
        <div className="rule-list">
          {profileData.experience.map((job) => (
            <div key={`${job.role}-${job.period}`} className="rule-item rule-green">
              <h3 className="item-title">{job.role}</h3>
              <p className="item-org">
                {job.companyUrl ? (
                  <a href={job.companyUrl} target="_blank" rel="noopener noreferrer">
                    {job.company}
                  </a>
                ) : (
                  job.company
                )}
              </p>
              <p className="item-meta">{job.period}</p>
              <ul className="bullets">
                {job.highlights.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Reveal>

      {featuredProjects.length > 0 && (
        <Reveal as="section" className="page-section" aria-labelledby="projects-heading">
          <h2 id="projects-heading" className="section-title">
            Things I&apos;ve Built
          </h2>
          <div className="rule-list">
            {featuredProjects.map((project) => (
              <div key={project.id} className="rule-item rule-purple">
                <div className="item-title-row">
                  <h3 className="item-title">
                    <Link to={`/projects/${project.id}`}>{project.title}</Link>
                  </h3>
                  {project.github && (
                    <a
                      className="icon-link"
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="View on GitHub"
                      aria-label={`${project.title} on GitHub`}
                    >
                      <GitHubIcon />
                    </a>
                  )}
                </div>
                <p>{project.summary}</p>
                <span className="chip chip-purple">{project.stack.join(", ")}</span>
              </div>
            ))}
          </div>
          <div className="center-row">
            <Link className="btn btn-purple" to="/projects">
              See all projects
              <ArrowRightIcon />
            </Link>
          </div>
        </Reveal>
      )}

      <Reveal as="section" className="page-section" aria-labelledby="interests-heading">
        <h2 id="interests-heading" className="section-title">
          What I&apos;m Focused On
        </h2>
        <div className="callout">
          <div className="callout-body">
            <PostContent blocks={markdownToBlocks(profileData.interests)} />
          </div>
          <div className="callout-tags">
            {profileData.interestTags.map((tag, index) => (
              <span key={tag} className={`chip chip-lg chip-${INTEREST_TONES[index % INTEREST_TONES.length]}`}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </Reveal>
    </>
  );
}
