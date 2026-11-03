import { useState } from "react";
import { useAuth } from "../context/auth";
import { useToast } from "../context/toast";

const MIN_PASSWORD_LENGTH = 10;

export default function AdminAccountPage() {
  const { user, changePassword } = useAuth();
  const notify = useToast();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (next.length < MIN_PASSWORD_LENGTH) {
      setError(`Use at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (next !== confirm) {
      setError("The new passwords don't match.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      await changePassword(current, next);
      setCurrent("");
      setNext("");
      setConfirm("");
      notify("Password changed. Other devices have been signed out.", "success");
    } catch (changeError) {
      setError(changeError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <header className="admin-header">
        <h1>Password</h1>
      </header>
      <form className="card card-pad admin-narrow" onSubmit={submit}>
        <p className="muted small">Signed in as {user.username}.</p>
        <input type="text" autoComplete="username" value={user.username} readOnly hidden />
        <div className="form-field">
          <label htmlFor="current-password">Current password</label>
          <input id="current-password" className="input" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} required />
        </div>
        <div className="form-field">
          <label htmlFor="new-password">New password</label>
          <input id="new-password" className="input" type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} required />
          <p className="field-help">At least {MIN_PASSWORD_LENGTH} characters.</p>
        </div>
        <div className="form-field">
          <label htmlFor="confirm-password">Repeat new password</label>
          <input id="confirm-password" className="input" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
        </div>
        {error && (
          <p className="field-error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? "Saving..." : "Change password"}
        </button>
      </form>
    </>
  );
}
