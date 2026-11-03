import { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Link, useParams } from "react-router-dom";
import Avatar from "../components/Avatar";
import PostContent from "../components/PostContent";
import PostCover from "../components/PostCover";
import ReadingProgress from "../components/ReadingProgress";
import Seo from "../components/Seo";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  ChevronRightIcon,
  ExternalLinkIcon,
  EyeIcon,
  GitHubIcon,
  LinkIcon,
  LinkedInIcon,
  StarIcon,
  XBrandIcon
} from "../components/Icons";
import { useContent } from "../context/content";
import { useToast } from "../context/toast";
import { siteConfig } from "../data/profileData";
import { api } from "../lib/api";
import { getAdjacentPosts, getHeadings, getRelatedPosts, readingTime } from "../lib/blog";
import { copyToClipboard } from "../lib/clipboard";
import { formatDate, slugify } from "../lib/format";
import { markdownToBlocks } from "../lib/markdown";
import { authorRef } from "../lib/schema";
import NotFoundPage from "./NotFoundPage";

// Counts the visit once per page load; the API ignores repeat visits the same day.
function useRecordView(slug, onViews) {
  useEffect(() => {
    if (!slug) {
      return undefined;
    }
    const controller = new AbortController();
    api(`/posts/${encodeURIComponent(slug)}/view`, { method: "POST", signal: controller.signal })
      .then((data) => onViews(slug, data.views))
      .catch(() => {});
    return () => controller.abort();
  }, [slug, onViews]);
}

// Highlights the section heading currently near the top of the viewport.
function useActiveHeading(headings) {
  const [activeId, setActiveId] = useState(headings[0]?.id);

  useEffect(() => {
    const elements = headings.map((heading) => document.getElementById(heading.id)).filter(Boolean);
    if (elements.length === 0 || !("IntersectionObserver" in window)) {
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-80px 0px -70% 0px" }
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [headings]);

  return activeId;
}

function TableOfContents({ headings }) {
  const activeId = useActiveHeading(headings);

  function jumpTo(event, id) {
    event.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(window.history.state, "", `#${id}`);
  }

  return (
    <nav className="toc" aria-label="Table of contents">
      <h2 className="toc-title">On this page</h2>
      <ul>
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className={activeId === heading.id ? "active" : undefined}
              aria-current={activeId === heading.id ? "location" : undefined}
              onClick={(event) => jumpTo(event, heading.id)}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

TableOfContents.propTypes = {
  headings: PropTypes.arrayOf(
    PropTypes.shape({ id: PropTypes.string.isRequired, text: PropTypes.string.isRequired })
  ).isRequired
};

function ShareBar({ title, sourceUrl }) {
  const notify = useToast();
  const [copied, setCopied] = useState(false);
  const url = window.location.href.split("#")[0];
  const encodedUrl = encodeURIComponent(url);

  async function copyLink() {
    try {
      await copyToClipboard(url);
      setCopied(true);
      notify("Link copied to clipboard.", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      notify("Couldn't copy the link. Copy it from the address bar instead.", "error");
    }
  }

  return (
    <div className="share-bar">
      <div className="share-actions">
        <span className="muted small">Share:</span>
        <a
          className="icon-btn"
          href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodeURIComponent(title)}`}
          target="_blank"
          rel="noopener noreferrer"
          title="Share on X"
          aria-label="Share on X"
        >
          <XBrandIcon />
        </a>
        <a
          className="icon-btn"
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          title="Share on LinkedIn"
          aria-label="Share on LinkedIn"
        >
          <LinkedInIcon />
        </a>
        <button type="button" className="icon-btn" onClick={copyLink} title="Copy link" aria-label="Copy link">
          {copied ? <CheckIcon /> : <LinkIcon />}
        </button>
      </div>
      {sourceUrl && (
        <a className="text-link" href={sourceUrl} target="_blank" rel="noopener noreferrer">
          <StarIcon />
          View the source
        </a>
      )}
    </div>
  );
}

ShareBar.propTypes = {
  title: PropTypes.string.isRequired,
  sourceUrl: PropTypes.string
};

export default function BlogPostPage() {
  const { id } = useParams();
  const { profile: profileData, posts, source, updatePostViews } = useContent();
  const post = posts.find((entry) => entry.id === id);
  const articleRef = useRef(null);
  const blocks = useMemo(() => markdownToBlocks(post?.content ?? ""), [post?.content]);
  const headings = useMemo(() => getHeadings(blocks), [blocks]);
  useRecordView(post && source === "api" ? post.id : null, updatePostViews);

  if (!post) {
    return <NotFoundPage />;
  }

  const minutes = readingTime(post);
  const { previous, next } = getAdjacentPosts(posts, post.id);
  const related = getRelatedPosts(posts, post);
  const hasToc = headings.length >= 2;

  const postSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    datePublished: post.date,
    description: post.summary,
    keywords: post.tags.join(", "),
    author: authorRef(profileData, siteConfig),
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
      <ReadingProgress targetRef={articleRef} />

      <article>
        <header className="post-header">
          <div className="container post-header-inner">
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <Link to="/blog">Blog</Link>
              <ChevronRightIcon />
              <Link to={`/blog?category=${slugify(post.category)}#all-posts`} className="breadcrumb-current">
                {post.category}
              </Link>
              {post.status && (
                <span className={`status-badge${post.status === "Completed" ? " status-done" : ""}`}>
                  <span aria-hidden="true" />
                  {post.status}
                </span>
              )}
            </nav>
            <h1 className="post-title">{post.title}</h1>
            {post.subtitle && <p className="post-subtitle">{post.subtitle}</p>}

            <div className="post-meta-row">
              <div className="post-meta">
                <span className="post-author">
                  <Avatar size="sm" />
                  <strong>{profileData.displayName}</strong>
                </span>
                <span>
                  <time dateTime={post.date}>{formatDate(post.date)}</time>
                  <span aria-hidden="true"> · </span>
                  {minutes} min read
                </span>
                {typeof post.views === "number" && (
                  <span className="views">
                    <EyeIcon />
                    {post.views.toLocaleString()} {post.views === 1 ? "view" : "views"}
                  </span>
                )}
              </div>
              {(post.links?.source || post.links?.demo) && (
                <div className="button-row">
                  {post.links.source && (
                    <a className="btn btn-dark btn-sm" href={post.links.source} target="_blank" rel="noopener noreferrer">
                      <GitHubIcon />
                      Source code
                    </a>
                  )}
                  {post.links.demo && (
                    <a className="btn btn-indigo btn-sm" href={post.links.demo} target="_blank" rel="noopener noreferrer">
                      <ExternalLinkIcon />
                      Live demo
                    </a>
                  )}
                </div>
              )}
            </div>

            {post.stack?.length > 0 && (
              <div className="stack-row">
                <span className="stack-label">Built with</span>
                {post.stack.map((tech) => (
                  <span key={tech} className="stack-chip">
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </div>
        </header>

        <div className={`container post-layout${hasToc ? " has-toc" : ""}`}>
          {hasToc && (
            <aside className="post-toc">
              <TableOfContents key={post.id} headings={headings} />
            </aside>
          )}

          <div className="post-main">
            <div className="prose post-prose" ref={articleRef}>
              <PostContent blocks={blocks} />
            </div>

            <div className="post-tags">
              <span className="muted small">Topics</span>
              {post.tags.map((tag) => (
                <Link key={tag} className="topic-tag" to={`/blog?tag=${encodeURIComponent(tag)}#all-posts`}>
                  #{tag}
                </Link>
              ))}
            </div>

            <ShareBar key={post.id} title={post.title} sourceUrl={post.links?.source} />

            {(previous || next) && (
              <nav className="post-nav" aria-label="More articles">
                {previous && (
                  <Link className="post-nav-link" to={`/blog/${previous.id}`}>
                    <span className="post-nav-label">
                      <ArrowLeftIcon />
                      Older post
                    </span>
                    <span className="post-nav-title">{previous.title}</span>
                  </Link>
                )}
                {next && (
                  <Link className="post-nav-link post-nav-next" to={`/blog/${next.id}`}>
                    <span className="post-nav-label">
                      Newer post
                      <ArrowRightIcon />
                    </span>
                    <span className="post-nav-title">{next.title}</span>
                  </Link>
                )}
              </nav>
            )}
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="container related" aria-labelledby="related-heading">
          <h2 id="related-heading">Keep Reading</h2>
          <div className="grid-3">
            {related.map((item) => (
              <Link key={item.id} to={`/blog/${item.id}`} className="post-card post-card-link">
                <PostCover post={item} size="sm" />
                <div className="post-card-body">
                  <h3 className="post-card-title">{item.title}</h3>
                  <div className="post-card-foot">
                    <span>{readingTime(item)} min read</span>
                    <span>{formatDate(item.date)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
