import PropTypes from "prop-types";
import Reveal from "../components/Reveal";
import Seo from "../components/Seo";
import { useContent } from "../context/content";

const LEVEL_PERCENT = { Expert: 100, Advanced: 80, Intermediate: 60, Beginner: 40 };

const skillShape = PropTypes.shape({
  name: PropTypes.string.isRequired,
  category: PropTypes.string.isRequired,
  // "" means no level was chosen in the admin.
  level: PropTypes.oneOf(["", ...Object.keys(LEVEL_PERCENT)]),
  years: PropTypes.number,
  featured: PropTypes.bool,
  description: PropTypes.string
});

function ProficiencyBar({ level, thin = false }) {
  const percent = LEVEL_PERCENT[level];
  return (
    <div
      className={`bar${thin ? " bar-thin" : ""}`}
      role="meter"
      aria-label={`${level} proficiency`}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
    >
      <div className="bar-fill" style={{ "--pct": `${percent}%` }} />
    </div>
  );
}

ProficiencyBar.propTypes = {
  level: PropTypes.oneOf(Object.keys(LEVEL_PERCENT)).isRequired,
  thin: PropTypes.bool
};

function FeaturedSkillCard({ skill }) {
  return (
    <Reveal className="card card-pad skill-card">
      <h3 className="card-title">{skill.name}</h3>
      <p className="skill-category">{skill.category}</p>
      {skill.level && (
        <div className="skill-level">
          <div className="skill-level-row">
            <span>{skill.level}</span>
            <span>{LEVEL_PERCENT[skill.level]}%</span>
          </div>
          <ProficiencyBar level={skill.level} />
        </div>
      )}
      {skill.years && <p className="muted small">{skill.years.toFixed(1)} years experience</p>}
      {skill.description && <p className="small">{skill.description}</p>}
    </Reveal>
  );
}

FeaturedSkillCard.propTypes = { skill: skillShape.isRequired };

function SkillTile({ skill }) {
  return (
    <div className="card skill-tile">
      <div className="skill-tile-head">
        <h4>{skill.name}</h4>
        {(skill.level || skill.years) && (
          <span className="muted small">
            {skill.level}
            {skill.years && ` (${skill.years.toFixed(1)}y)`}
          </span>
        )}
      </div>
      {skill.level && <ProficiencyBar level={skill.level} thin />}
      {/* Featured skills already show their description in Core Strengths. */}
      {skill.description && !skill.featured && <p className="muted small">{skill.description}</p>}
    </div>
  );
}

SkillTile.propTypes = { skill: skillShape.isRequired };

export default function SkillsPage() {
  const { profile: profileData } = useContent();
  const { skills } = profileData;
  const featured = skills.filter((skill) => skill.featured);
  const categories = [...new Set(skills.map((skill) => skill.category))];

  return (
    <>
      <Seo
        title="Skills"
        description={`Technical skills of ${profileData.displayName}: ${skills.map((skill) => skill.name).join(", ")}.`}
        path="/skills"
      />

      <header className="page-header">
        <h1>Skills</h1>
        <p>The languages, frameworks, and tools I reach for most.</p>
      </header>

      {featured.length > 0 && (
        <section className="page-section" aria-labelledby="featured-skills-heading">
          <h2 id="featured-skills-heading" className="section-title">
            Core Strengths
          </h2>
          <div className="grid-3">
            {featured.map((skill) => (
              <FeaturedSkillCard key={skill.name} skill={skill} />
            ))}
          </div>
        </section>
      )}

      <section className="page-section" aria-labelledby="all-skills-heading">
        <h2 id="all-skills-heading" className="section-title">
          Full Toolkit
        </h2>
        {categories.map((category) => {
          const inCategory = skills.filter((skill) => skill.category === category);
          // Skills with a level, years or their own description get a tile; plain names are tags.
          const detailed = inCategory.filter((skill) => skill.level || skill.years || (skill.description && !skill.featured));
          const plain = inCategory.filter((skill) => !detailed.includes(skill));
          return (
            <Reveal key={category} className="skill-group">
              <h3 className="group-title">{category}</h3>
              {detailed.length > 0 && (
                <div className="grid-2">
                  {detailed.map((skill) => (
                    <SkillTile key={skill.name} skill={skill} />
                  ))}
                </div>
              )}
              {plain.length > 0 && (
                <ul className="skill-tags">
                  {plain.map((skill) => (
                    <li key={skill.name}>{skill.name}</li>
                  ))}
                </ul>
              )}
            </Reveal>
          );
        })}
      </section>
    </>
  );
}
