import Reveal from "../components/Reveal";
import Seo from "../components/Seo";
import { BadgeCheckIcon } from "../components/Icons";
import { useContent } from "../context/content";

export default function ExtracurricularsPage() {
  const { profile: profileData } = useContent();
  const { teaching, activities, achievements, certifications } = profileData;

  return (
    <>
      <Seo
        title="Beyond Work"
        description={`Awards, competitions, leadership programs, and certifications of ${profileData.displayName}.`}
        path="/extracurriculars"
      />

      <header className="page-header">
        <h1>Beyond Work</h1>
        <p>Awards, competitions, and leadership programs.</p>
      </header>

      {teaching.length > 0 && (
        <section className="page-section" aria-labelledby="teaching-heading">
          <h2 id="teaching-heading" className="section-title">
            Teaching
          </h2>
          <div className="card-stack">
            {teaching.map((item) => (
              <Reveal as="article" key={`${item.subject}-${item.period}`} className="card card-pad">
                <h3 className="card-title">{item.subject}</h3>
                <p className="muted small">{item.institution}</p>
                <p className="muted small">{item.period}</p>
                {item.description && <p>{item.description}</p>}
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {activities.length > 0 && (
        <section className="page-section" aria-labelledby="activities-heading">
          <h2 id="activities-heading" className="section-title">
            Leadership &amp; Activities
          </h2>
          <div className="card-stack">
            {activities.map((item) => (
              <Reveal as="article" key={`${item.role}-${item.organization}`} className="card card-pad">
                <div className="card-head">
                  <div>
                    <h3 className="card-title">{item.role}</h3>
                    <p className="muted small">
                      {item.url ? (
                        <a href={item.url} target="_blank" rel="noopener noreferrer">
                          {item.organization}
                        </a>
                      ) : (
                        item.organization
                      )}
                      {item.location && ` • ${item.location}`}
                    </p>
                    <p className="muted small">
                      {item.period}
                      {item.current && <span className="badge badge-green">Current</span>}
                    </p>
                  </div>
                  {item.type && <span className="badge">{item.type}</span>}
                </div>
                {item.description && <p>{item.description}</p>}
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {achievements.length > 0 && (
        <section className="page-section" aria-labelledby="achievements-heading">
          <h2 id="achievements-heading" className="section-title">
            Recognition
          </h2>
          <div className="grid-2">
            {achievements.map((item) => (
              <Reveal as="article" key={item.title} className="card card-pad">
                <h3 className="card-title">{item.title}</h3>
                <p className="muted small">
                  {item.organization}
                  {item.date && ` · ${item.date}`}
                </p>
                {item.description && <p className="small">{item.description}</p>}
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {certifications.length > 0 && (
        <section className="page-section" aria-labelledby="certifications-heading">
          <h2 id="certifications-heading" className="section-title">
            Certifications &amp; Programs
          </h2>
          <div className="grid-2">
            {certifications.map((item) => (
              <Reveal as="article" key={item.title} className="card card-pad cert-card">
                <span className="cert-icon">
                  <BadgeCheckIcon />
                </span>
                <div>
                  <h3 className="card-title">{item.title}</h3>
                  {item.issuer && <p className="muted small">{item.issuer}</p>}
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
