import PropTypes from "prop-types";
import { Link, useSearchParams } from "react-router-dom";
import PostCover from "../components/PostCover";
import Reveal from "../components/Reveal";
import Seo from "../components/Seo";
import { ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon, EyeIcon, GitHubIcon, SparklesIcon } from "../components/Icons";
import { useContent } from "../context/content";
import { siteConfig } from "../data/profileData";
import { POSTS_PER_PAGE, getCategories, readingTime, totalViews } from "../lib/blog";
import { formatDate, slugify } from "../lib/format";

function blogSchema(posts) {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `${siteConfig.siteName} Blog`,
    url: `${siteConfig.siteUrl}/blog`,
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      datePublished: post.date,
      url: `${siteConfig.siteUrl}/blog/${post.id}`,
      keywords: post.tags.join(", "),
      description: post.summary
    }))
  };
}

const postShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  category: PropTypes.string.isRequired,
  summary: PropTypes.string.isRequired,
  views: PropTypes.number
});

function PostCard({ post }) {
  return (
    <Reveal as="article" className="post-card">
      <Link to={`/blog/${post.id}`} className="post-card-link">
        <PostCover post={post} />
        <div className="post-card-body">
          <div className="post-card-meta">
            <span className="chip chip-indigo">{post.category}</span>
            <span>{readingTime(post)} min</span>
          </div>
          <h2 className="post-card-title">{post.title}</h2>
          <p className="clamp-3">{post.summary}</p>
          <div className="post-card-foot">
            {typeof post.views === "number" ? (
              <span className="views" title={`${post.views} views`}>
                <EyeIcon />
                {post.views.toLocaleString()}
              </span>
            ) : (
              <span className="post-card-read">
                Read
                <ArrowRightIcon />
              </span>
            )}
            <span>{formatDate(post.date)}</span>
          </div>
        </div>
      </Link>
    </Reveal>
  );
}

PostCard.propTypes = { post: postShape.isRequired };

function FeaturedCard({ post }) {
  return (
    <Link to={`/blog/${post.id}`} className="post-card post-card-link featured-card">
      <PostCover post={post} />
      <div className="post-card-body">
        <span className="chip chip-indigo">{post.category}</span>
        <h3 className="post-card-title">{post.title}</h3>
        <p className="clamp-2">{post.summary}</p>
        <div className="post-card-foot">
          <span>{readingTime(post)} min read</span>
          <span>{formatDate(post.date)}</span>
        </div>
      </div>
    </Link>
  );
}

FeaturedCard.propTypes = { post: postShape.isRequired };

export default function BlogPage() {
  const { posts: sortedPosts, source } = useContent();
  const [params] = useSearchParams();
  const categorySlug = params.get("category") || "";
  const tag = params.get("tag") || "";
  const requestedPage = Number.parseInt(params.get("page") || "1", 10);

  const categories = getCategories(sortedPosts);
  const filtered = sortedPosts.filter(
    (post) => (!categorySlug || slugify(post.category) === categorySlug) && (!tag || post.tags.includes(tag))
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / POSTS_PER_PAGE));
  const page = Number.isFinite(requestedPage) ? Math.min(Math.max(requestedPage, 1), pageCount) : 1;
  const visiblePosts = filtered.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);
  const isFiltered = Boolean(categorySlug || tag);

  const latest = sortedPosts[0];
  const featured = sortedPosts.filter((post) => post.featured).slice(0, 3);
  const stats = [
    { label: "Posts", value: sortedPosts.length },
    { label: "Topics", value: categories.length },
    // Posts carry view counts only when "Show view counts" is on in the admin profile.
    ...(source === "api" && sortedPosts.some((post) => typeof post.views === "number")
      ? [{ label: "Reads", value: totalViews(sortedPosts).toLocaleString() }]
      : [{ label: "Minutes to Read", value: sortedPosts.reduce((total, post) => total + readingTime(post), 0) }])
  ];

  function pageHref(target) {
    const next = new URLSearchParams(params);
    if (target === 1) {
      next.delete("page");
    } else {
      next.set("page", String(target));
    }
    const query = next.toString();
    return `/blog${query ? `?${query}` : ""}#all-posts`;
  }

  return (
    <>
      <Seo
        title="Blog"
        description="Notes on my computer vision and machine learning projects: what I built, what worked, and what didn't."
        path="/blog"
        schema={blogSchema(sortedPosts)}
      />

      {latest && (
        <section className="blog-hero">
          <div className="container blog-hero-inner">
            <div className="blog-hero-meta">
              <span className="hero-chip">{latest.category}</span>
              <span>{readingTime(latest)} min read</span>
            </div>
            <h1>
              <Link to={`/blog/${latest.id}`}>{latest.title}</Link>
            </h1>
            {latest.subtitle && <p className="blog-hero-subtitle">{latest.subtitle}</p>}
            <p className="blog-hero-summary clamp-2">{latest.summary}</p>
            <div className="button-row">
              <Link className="btn btn-indigo btn-lg" to={`/blog/${latest.id}`}>
                Read the post
                <ArrowRightIcon />
              </Link>
              {latest.links?.source && (
                <a className="btn btn-glass btn-lg" href={latest.links.source} target="_blank" rel="noopener noreferrer">
                  <GitHubIcon />
                  GitHub
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      <div className="container blog-body">
        <div className="stats-bar">
          {stats.map((stat) => (
            <div key={stat.label} className="stat">
              <div className="stat-value tone-text-indigo">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        {!isFiltered && page === 1 && featured.length > 0 && (
          <section className="featured-posts" aria-labelledby="featured-heading">
            <h2 id="featured-heading" className="section-title with-icon">
              <SparklesIcon />
              Worth Reading
            </h2>
            <div className="grid-3">
              {featured.map((post) => (
                <FeaturedCard key={post.id} post={post} />
              ))}
            </div>
          </section>
        )}

        <section id="all-posts" className="all-posts" aria-label="All posts">
          <div className="filter-row" role="navigation" aria-label="Filter by category">
            <Link className={`filter-chip${!categorySlug ? " active" : ""}`} to="/blog#all-posts">
              Everything
            </Link>
            {categories.map((category) => (
              <Link
                key={category.slug}
                to={`/blog?category=${category.slug}#all-posts`}
                className={`filter-chip${categorySlug === category.slug ? " active" : ""}`}
              >
                {category.name} ({category.count})
              </Link>
            ))}
          </div>

          {tag && (
            <p className="filter-status">
              Showing posts tagged <strong>#{tag}</strong>
              <Link to="/blog#all-posts">Clear</Link>
            </p>
          )}

          {visiblePosts.length > 0 ? (
            <div className="grid-3">
              {visiblePosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No posts match this filter yet.</p>
              <Link className="btn btn-secondary" to="/blog">
                View all posts
              </Link>
            </div>
          )}

          {pageCount > 1 && (
            <nav className="pagination" aria-label="Pagination">
              {page > 1 && (
                <Link className="page-link" to={pageHref(page - 1)} aria-label="Previous page">
                  <ChevronLeftIcon />
                </Link>
              )}
              {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) =>
                number === page ? (
                  <span key={number} className="page-link active" aria-current="page">
                    {number}
                  </span>
                ) : (
                  <Link key={number} className="page-link" to={pageHref(number)}>
                    {number}
                  </Link>
                )
              )}
              {page < pageCount && (
                <Link className="page-link" to={pageHref(page + 1)} aria-label="Next page">
                  <ChevronRightIcon />
                </Link>
              )}
            </nav>
          )}
        </section>
      </div>
    </>
  );
}
