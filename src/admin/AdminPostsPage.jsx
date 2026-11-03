import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { EyeIcon, PencilIcon, PlusIcon, TrashIcon } from "../components/Icons";
import { useContent } from "../context/content";
import { useToast } from "../context/toast";
import { api } from "../lib/api";
import { formatDate } from "../lib/format";
import { AdminSpinner } from "./AdminLayout";

export default function AdminPostsPage() {
  const notify = useToast();
  const { reload } = useContent();
  const [posts, setPosts] = useState(null);

  const load = useCallback(async () => {
    try {
      setPosts((await api("/admin/posts")).posts);
    } catch (error) {
      notify(error.message, "error");
    }
  }, [notify]);

  useEffect(() => {
    load();
  }, [load]);

  async function remove(post) {
    if (!window.confirm(`Delete "${post.title}"? This cannot be undone.`)) {
      return;
    }
    try {
      await api(`/admin/posts/${post.dbId}`, { method: "DELETE" });
      notify("Post deleted.", "success");
      await Promise.all([load(), reload()]);
    } catch (error) {
      notify(error.message, "error");
    }
  }

  if (!posts) {
    return <AdminSpinner />;
  }

  return (
    <>
      <header className="admin-header">
        <h1>Blog posts</h1>
        <Link className="btn btn-primary" to="/admin/posts/new">
          <PlusIcon />
          New post
        </Link>
      </header>

      {posts.length === 0 ? (
        <div className="empty-state">
          <p>No posts yet.</p>
          <Link className="btn btn-primary" to="/admin/posts/new">
            Write your first post
          </Link>
        </div>
      ) : (
        <div className="card admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">Title</th>
                <th scope="col">Status</th>
                <th scope="col">Date</th>
                <th scope="col" className="num">
                  Views
                </th>
                <th scope="col">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.dbId}>
                  <td>
                    <Link to={`/admin/posts/${post.dbId}`} className="admin-row-title">
                      {post.title}
                    </Link>
                    <span className="muted small">{post.category}</span>
                  </td>
                  <td>
                    <span className={`badge ${post.published ? "badge-green" : "badge-amber"}`}>
                      {post.published ? "Published" : "Draft"}
                    </span>
                    {post.featured && <span className="badge">Featured</span>}
                  </td>
                  <td className="nowrap">{formatDate(post.date)}</td>
                  <td className="num">
                    <span className="views">
                      <EyeIcon />
                      {post.views.toLocaleString()}
                    </span>
                  </td>
                  <td>
                    <div className="row-actions">
                      {post.published && (
                        <Link className="icon-btn" to={`/blog/${post.id}`} title="View on site" aria-label={`View "${post.title}"`}>
                          <EyeIcon />
                        </Link>
                      )}
                      <Link className="icon-btn" to={`/admin/posts/${post.dbId}`} title="Edit" aria-label={`Edit "${post.title}"`}>
                        <PencilIcon />
                      </Link>
                      <button
                        type="button"
                        className="icon-btn icon-btn-danger"
                        onClick={() => remove(post)}
                        title="Delete"
                        aria-label={`Delete "${post.title}"`}
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
