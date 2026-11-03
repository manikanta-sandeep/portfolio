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
      {skill.description && <p className="muted small">{skill.description}</p>}
    </div>
  );
}

SkillTile.propTypes = { skill: skillShape.isRequired };

export default function SkillsPage() {
  const { profile: profileData } = useContent();
  const { skills } = profileData;
  const featured = skills.filter((skill) => skill.featured);
  const categories = [...new Set(skills.map((skill) => skill.category))];
  const withYears = skills.filter((skill) => typeof skill.years === "number");
  const averageYears = withYears.length
    ? (withYears.reduce((total, skill) => total + skill.years, 0) / withYears.length).toFixed(1)
    : null;

  const stats = [
    { label: "Total Skills", value: skills.length, tone: "blue" },
    { label: "Categories", value: categories.length, tone: "purple" },
    { label: "Featured", value: featured.length, tone: "green" },
    ...(averageYears ? [{ label: "Avg. Years", value: averageYears, tone: "orange" }] : [])
  ];

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
        {categories.map((category) => (
          <Reveal key={category} className="skill-group">
            <h3 className="group-title">{category}</h3>
            <div className="grid-2">
              {skills
                .filter((skill) => skill.category === category)
                .map((skill) => (
                  <SkillTile key={skill.name} skill={skill} />
                ))}
            </div>
          </Reveal>
        ))}
      </section>

      <Reveal as="section" className="card card-pad stats-card" aria-labelledby="skills-overview-heading">
        <h3 id="skills-overview-heading" className="card-title">
          At a Glance
        </h3>
        <div className="stats-grid">
          {stats.map((stat) => (
            <div key={stat.label} className="stat">
              <div className={`stat-value tone-text-${stat.tone}`}>{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </Reveal>
    </>
  );
}
