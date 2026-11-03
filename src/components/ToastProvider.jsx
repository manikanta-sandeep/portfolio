import { useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { ToastContext } from "../context/toast";
import { CloseIcon } from "./Icons";

const TOAST_DURATION_MS = 5000;

export default function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const timer = useRef();

  const dismiss = useCallback(() => {
    clearTimeout(timer.current);
    setToast(null);
  }, []);

  const notify = useCallback((message, type = "success") => {
    clearTimeout(timer.current);
    setToast({ id: Date.now(), message, type });
    timer.current = setTimeout(() => setToast(null), TOAST_DURATION_MS);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <ToastContext.Provider value={notify}>
      {children}
      <div className="toast-region" aria-live="polite">
        {toast && (
          <div key={toast.id} className={`toast toast-${toast.type}`} role="status">
            <p>{toast.message}</p>
            <button type="button" className="toast-close" onClick={dismiss} aria-label="Dismiss notification">
              <CloseIcon />
            </button>
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}

ToastProvider.propTypes = {
  children: PropTypes.node
};
