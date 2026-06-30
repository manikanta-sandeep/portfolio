import { Link, Navigate, useParams } from "react-router-dom";
import Seo from "../components/Seo";
import { profileData, siteConfig } from "../data/profileData";

export default function ResearchPage() {
  const { id } = useParams();
  const research = profileData.research.find((entry) => entry.id === id);

  if (!research) {
    return <Navigate to="/" replace />;
  }

  const researchSchema = {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    headline: research.title,
    description: research.summary,
    keywords: research.stack.join(", "),
    url: `${siteConfig.siteUrl}/research/${research.id}`
  };

  return (
    <>
      <Seo
        title={research.title}
        description={research.summary}
        path={`/research/${research.id}`}
        type="article"
        schema={researchSchema}
      />

      <header className="site-header" role="banner">
        <div className="brand-block">
          <p className="eyebrow">Research</p>
          <h1>{research.title}</h1>
        </div>
        <nav aria-label="Research Navigation">
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
          <p className="meta-line">{research.stack.join(" · ")}</p>
          {research.content?.map((paragraph, index) => (
            <p key={`${research.id}-${index}`}>{paragraph}</p>
          ))}
        </article>
      </main>
    </>
  );
}
