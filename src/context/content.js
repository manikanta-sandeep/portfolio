import { createContext, useContext } from "react";

// { profile, posts, source: "api" | "static", reload(), updatePostViews(id, views) }
export const ContentContext = createContext(null);

export function useContent() {
  return useContext(ContentContext);
}
