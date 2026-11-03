import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { EyeIcon, InboxIcon, NewspaperIcon, PlusIcon } from "../components/Icons";
import { useToast } from "../context/toast";
import { api } from "../lib/api";
import { AdminSpinner } from "./AdminLayout";

export default function AdminDashboardPage() {
  const notify = useToast();
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    api("/admin/summary", { signal: controller.signal })
      .then(setSummary)
      .catch((error) => error.name !== "AbortError" && notify(error.message, "error"));
    return () => controller.abort();
  }, [notify]);

  if (!summary) {
    return <AdminSpinner />;
  }

  const stats = [
    { label: "Posts", value: summary.posts.total, detail: `${summary.posts.drafts} drafts`, Icon: NewspaperIcon, to: "/admin/posts" },
    { label: "Total views", value: summary.posts.views.toLocaleString(), detail: "All published posts", Icon: EyeIcon, to: "/admin/posts" },
    { label: "Messages", value: summary.messages.total, detail: `${summary.messages.unread} unread`, Icon: InboxIcon, to: "/admin/messages" }
  ];

  return (
    <>
      <header className="admin-header">
        <h1>Dashboard</h1>
        <Link className="btn btn-primary" to="/admin/posts/new">
          <PlusIcon />
          New post
        </Link>
      </header>

      <div className="admin-stats">
        {stats.map(({ label, value, detail, Icon, to }) => (
          <Link key={label} to={to} className="card admin-stat">
            <span className="admin-stat-icon">
              <Icon />
            </span>
            <span>
              <span className="admin-stat-value">{value}</span>
              <span className="admin-stat-label">{label}</span>
              <span className="muted small">{detail}</span>
            </span>
          </Link>
        ))}
      </div>

      <section className="card card-pad" aria-labelledby="top-posts-heading">
        <h2 id="top-posts-heading" className="card-title">
          Most viewed posts
        </h2>
        {summary.topPosts.length > 0 ? (
          <ol className="top-posts">
            {summary.topPosts.map((post) => (
              <li key={post.slug}>
                <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                <span className="views">
                  <EyeIcon />
                  {post.views.toLocaleString()}
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="muted">No published posts yet.</p>
        )}
      </section>
    </>
  );
}
