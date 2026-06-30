import { Link } from "react-router-dom";
import Seo from "../components/Seo";
import { blogPosts } from "../data/blogData";
import { siteConfig } from "../data/profileData";

export default function BlogPage() {
  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `${siteConfig.siteName} Blog`,
    url: `${siteConfig.siteUrl}/blog`,
    blogPost: blogPosts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      datePublished: post.date,
      url: `${siteConfig.siteUrl}/blog/${post.id}`,
      keywords: post.tags.join(", "),
      description: post.summary
    }))
  };

  return (
    <>
      <Seo
        title="Blog"
        description="Technical notes on software engineering, architecture, and delivery practices."
        path="/blog"
        schema={blogSchema}
      />
      <header className="site-header" role="banner">
        <div className="brand-block">
          <p className="eyebrow">Writing</p>
          <h1>Blog</h1>
        </div>
        <nav aria-label="Blog Navigation">
          <ul className="nav-list">
            <li>
              <Link to="/">Back to Portfolio</Link>
            </li>
          </ul>
        </nav>
      </header>

      <main>
        <section className="panel reveal">
          <h2>Latest Posts</h2>
          <div className="blog-list">
            {blogPosts.map((post) => (
              <article key={post.slug} className="card">
                <p className="meta-line">{post.date}</p>
                <h3>{post.title}</h3>
                <p>{post.summary}</p>
                <p className="meta-line">{post.tags.join(" · ")}</p>
                <Link to={`/blog/${post.id}`}>Read article</Link>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
