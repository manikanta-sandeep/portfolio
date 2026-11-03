import { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import Seo from "../components/Seo";
import { useAuth } from "../context/auth";
import { useContent } from "../context/content";
import { AdminSpinner } from "./AdminLayout";
import "./admin.css";

// Only same-site admin paths are allowed as the post-login destination.
function safeNext(value) {
  return value && value.startsWith("/admin") && !value.startsWith("//") ? value : "/admin";
}

export default function AdminLoginPage() {
  const { user, ready, login } = useAuth();
  const { profile } = useContent();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const next = safeNext(params.get("next"));

  if (!ready) {
    return <AdminSpinner />;
  }
  if (user) {
    return <Navigate to={next} replace />;
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(username.trim(), password);
      navigate(next, { replace: true });
    } catch (loginError) {
      setError(loginError.message);
      setBusy(false);
    }
  }

  return (
    <div className="admin-login">
      <Seo title="Sign in" path="/admin/login" noindex />
      <form className="card admin-login-card" onSubmit={submit}>
        <span className="brand-mark" aria-hidden="true">
          {profile.initials}
        </span>
        <h1>Sign in</h1>
        <p className="muted small">Manage your blog, profile, and messages.</p>
        <div className="form-field">
          <label htmlFor="login-username">Username</label>
          <input
            id="login-username"
            className="input"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
            autoFocus
          />
        </div>
        <div className="form-field">
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            className="input"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>
        {error && (
          <p className="field-error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={busy}>
          {busy ? "Signing in..." : "Sign in"}
        </button>
        <Link className="text-link" to="/">
          Back to the site
        </Link>
      </form>
    </div>
  );
}
