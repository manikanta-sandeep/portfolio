import { createContext, useContext } from "react";

// notify(message, type) where type is "success" | "error" | "info".
export const ToastContext = createContext(() => {});

export function useToast() {
  return useContext(ToastContext);
}
