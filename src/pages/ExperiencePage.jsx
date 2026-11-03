import Reveal from "../components/Reveal";
import Seo from "../components/Seo";
import { useContent } from "../context/content";

export default function ExperiencePage() {
  const { profile: profileData } = useContent();
  return (
    <>
      <Seo
        title="Experience"
        description={`Work experience and education of ${profileData.displayName}.`}
        path="/experience"
      />

      <header className="page-header">
        <h1>Experience</h1>
        <p>Where I have worked, what I shipped, and where I studied.</p>
      </header>

      <section className="page-section card-stack" aria-label="Work experience">
        {profileData.experience.map((job) => (
          <Reveal as="article" key={`${job.role}-${job.period}`} className="card card-pad">
            <div className="card-head">
              <div>
                <h2 className="card-title-lg">{job.role}</h2>
                <h3 className="card-subtitle">
                  {job.companyUrl ? (
                    <a href={job.companyUrl} target="_blank" rel="noopener noreferrer">
                      {job.company}
                    </a>
                  ) : (
                    job.company
                  )}
                </h3>
                {job.location && <p className="muted">{job.location}</p>}
              </div>
              <p className="card-period">{job.period}</p>
            </div>
            <ul className="bullets">
              {job.highlights.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </Reveal>
        ))}
      </section>

      <section className="page-section" aria-labelledby="education-heading">
        <h2 id="education-heading" className="section-title">
          Education
        </h2>
        <div className="card-stack">
          {profileData.education.map((item) => (
            <Reveal as="article" key={item.degree} className="card card-pad">
              <div className="card-head">
                <div>
                  <h3 className="card-title">
                    {item.degree} {item.gpa && <span className="accent-text">({item.gpa})</span>}
                  </h3>
                  <p className="card-subtitle">
                    {item.url ? (
                      <a href={item.url} target="_blank" rel="noopener noreferrer">
                        {item.institution}
                      </a>
                    ) : (
                      item.institution
                    )}
                  </p>
                </div>
                <p className="card-period">{item.period}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
