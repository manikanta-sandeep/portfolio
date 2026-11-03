import { useEffect } from "react";

// Asks for confirmation before closing or reloading the tab while there are unsaved edits.
export default function useUnsavedChanges(dirty) {
  useEffect(() => {
    if (!dirty) {
      return undefined;
    }
    const warn = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
}
