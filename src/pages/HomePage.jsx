import NavBar from "../components/NavBar";
import Seo from "../components/Seo";
import { profileData, siteConfig } from "../data/profileData";
import { Link } from "react-router-dom";

const homeSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      name: profileData.fullName,
      url: siteConfig.siteUrl,
      jobTitle: profileData.role,
      sameAs: [profileData.linkedin, profileData.github],
      email: `mailto:${profileData.email}`
    },
    {
      "@type": "WebSite",
      name: siteConfig.siteName,
      url: siteConfig.siteUrl
    }
  ]
};

export default function HomePage() {
  return (
    <>
      <Seo
        title="Home"
        description={profileData.summary}
        path="/"
        schema={homeSchema}
      />
      <NavBar />
      <main>
        <section className="hero reveal" id="about">
          <p className="eyebrow">{profileData.role}</p>
          <h2>{profileData.fullName}</h2>
          <p className="lead">{profileData.summary}</p>
          <p className="meta-line">{profileData.location} · {profileData.availability}</p>
          <div className="cta-row">
            <a className="btn" href={profileData.resumeFile} target="_blank" rel="noreferrer">
              Download Resume
            </a>
            <a className="btn secondary" href="#contact">
              Contact
            </a>
          </div>
        </section>

        <section className="panel reveal" id="projects">
          <h3>Projects</h3>
          <div className="projects-grid">
            {profileData.projects.map((project) => (
              <article key={project.title} className="card">
                <h4>{project.title}</h4>
                <p>{project.summary}</p>
                <p className="meta-line">{project.stack.join(" · ")}</p>
                <Link to={`/projects/${project.id}`}>View Project</Link>
              </article>
            ))}
          </div>
        </section>

        <section className="panel reveal" id="research">
          <h3>Research</h3>
          <div className="projects-grid">
            {profileData.research.map((research) => (
              <article key={research.id} className="card">
                <h4>{research.title}</h4>
                <p>{research.summary}</p>
                <p className="meta-line">{research.stack.join(" · ")}</p>
                <Link to={`/research/${research.id}`}>View Research</Link>
              </article>
            ))}
          </div>
        </section>

        <section className="panel reveal" id="experience">
          <h3>Experience</h3>
          {profileData.experience.map((item) => (
            <article key={`${item.company}-${item.period}`} className="timeline-item">
              <h4>{item.role} · {item.company}</h4>
              <p className="meta-line">{item.period}</p>
              <ul>
                {item.highlights.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section className="panel reveal" id="education">
          <h3>Education</h3>
          {profileData.education.map((item) => (
            <article key={`${item.institution}-${item.period}`} className="timeline-item">
              <h4>{item.degree}</h4>
              <p>{item.institution}</p>
              <p className="meta-line">{item.period}</p>
            </article>
          ))}
        </section>

        <section className="panel reveal" id="certifications">
          <h3>Certifications</h3>
          <ul>
            {profileData.certifications.map((certification) => (
              <li key={certification}>{certification}</li>
            ))}
          </ul>
        </section>

        <section className="panel reveal" id="skills">
          <h3>Skills</h3>
          <ul className="chip-grid">
            {profileData.skills.map((skill) => (
              <li key={skill}>{skill}</li>
            ))}
          </ul>
        </section>

        <section className="panel reveal" id="contact">
          <h3>Contact</h3>
          <p>
            Email: <a href={`mailto:${profileData.email}`}>{profileData.email}</a>
          </p>
          <p>
            LinkedIn: <a href={profileData.linkedin} target="_blank" rel="noreferrer">Profile</a>
          </p>
          <p>
            GitHub: <a href={profileData.github} target="_blank" rel="noreferrer">Repositories</a>
          </p>
        </section>
      </main>
    </>
  );
}
