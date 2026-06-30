import { Link, Navigate, useParams } from "react-router-dom";
import Seo from "../components/Seo";
import { blogPosts } from "../data/blogData";
import { siteConfig } from "../data/profileData";

export default function BlogPostPage() {
  const { id } = useParams();
  const post = blogPosts.find((entry) => entry.id === id);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const postSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    datePublished: post.date,
    description: post.summary,
    keywords: post.tags.join(", "),
    url: `${siteConfig.siteUrl}/blog/${post.id}`
  };

  return (
    <>
      <Seo
        title={post.title}
        description={post.summary}
        path={`/blog/${post.id}`}
        type="article"
        schema={postSchema}
      />

      <header className="site-header" role="banner">
        <div className="brand-block">
          <p className="eyebrow">Blog Article</p>
          <h1>{post.title}</h1>
        </div>
        <nav aria-label="Article Navigation">
          <ul className="nav-list">
            <li>
              <Link to="/blog">Back to Blog</Link>
            </li>
            <li>
              <Link to="/">Portfolio</Link>
            </li>
          </ul>
        </nav>
      </header>

      <main>
        <article className="panel reveal article-layout">
          <p className="meta-line">{post.date} · {post.tags.join(" · ")}</p>
          {post.content.map((paragraph, index) => (
            <p key={`${post.id}-${index}`}>{paragraph}</p>
          ))}
        </article>
      </main>
    </>
  );
}
