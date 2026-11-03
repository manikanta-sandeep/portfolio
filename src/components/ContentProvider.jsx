import { useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { ContentContext } from "../context/content";
import { blogPosts } from "../data/blogData";
import { profileData } from "../data/profileData";
import { api } from "../lib/api";
import { sortPosts } from "../lib/blog";

const LOAD_TIMEOUT_MS = 6000;

// Used when the API can't be reached (for example a static-only host): the site still
// renders from the bundled seed content, without view counts or the admin area.
const staticContent = {
  profile: profileData,
  posts: sortPosts(blogPosts),
  source: "static"
};

export default function ContentProvider({ children }) {
  const [content, setContent] = useState(null);

  const load = useCallback(async (signal) => {
    try {
      const data = await api("/content", { signal });
      setContent({ profile: data.profile, posts: sortPosts(data.posts), source: "api" });
    } catch (error) {
      if (error.name !== "AbortError" || signal?.reason === "timeout") {
        setContent((current) => current || staticContent);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort("timeout"), LOAD_TIMEOUT_MS);
    load(controller.signal).finally(() => clearTimeout(timer));
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [load]);

  const reload = useCallback(() => load(), [load]);

  const updatePostViews = useCallback((id, views) => {
    setContent((current) =>
      current && {
        ...current,
        posts: current.posts.map((post) => (post.id === id ? { ...post, views } : post))
      }
    );
  }, []);

  const value = useMemo(() => content && { ...content, reload, updatePostViews }, [content, reload, updatePostViews]);

  if (!value) {
    return (
      <div className="app-loading" role="status">
        <span className="spinner" aria-hidden="true" />
        <span className="sr-only">Loading</span>
      </div>
    );
  }

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

ContentProvider.propTypes = {
  children: PropTypes.node
};
