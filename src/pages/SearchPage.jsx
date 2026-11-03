import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Seo from "../components/Seo";
import { ArrowRightIcon, SearchIcon } from "../components/Icons";
import { useContent } from "../context/content";
import { getTags } from "../lib/blog";
import { buildSearchIndex, search, searchGroups, searchTerms } from "../lib/search";

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function Highlight({ text, terms }) {
  if (terms.length === 0) {
    return text;
  }
  const pattern = new RegExp(`(${terms.map(escapeRegExp).join("|")})`, "gi");
  return text.split(pattern).map((part, index) => (index % 2 === 1 ? <mark key={index}>{part}</mark> : part));
}

Highlight.propTypes = {
  text: PropTypes.string.isRequired,
  terms: PropTypes.arrayOf(PropTypes.string).isRequired
};

export default function SearchPage() {
  const { profile, posts } = useContent();
  const index = useMemo(() => buildSearchIndex(profile, posts), [profile, posts]);
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const query = params.get("q") || "";
  const [draft, setDraft] = useState(query);
  const [lastQuery, setLastQuery] = useState(query);

  // Keep the input in sync when the query changes from elsewhere (e.g. the header search).
  if (query !== lastQuery) {
    setLastQuery(query);
    setDraft(query);
  }

  const terms = searchTerms(query);
  const results = search(index, query);
  const grouped = searchGroups
    .map((group) => ({ group, items: results.filter((result) => result.group === group) }))
    .filter(({ items }) => items.length > 0);

  function submit(event) {
    event.preventDefault();
    const trimmed = draft.trim();
    navigate(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search");
  }

  return (
    <div className="container search-page">
      <Seo title={query ? `Search: ${query}` : "Search"} description="Search projects, posts, skills, and pages." path="/search" noindex />

      <header className="page-header">
        <h1>Search</h1>
        <p>Find projects, blog posts, experience, skills, and pages.</p>
      </header>

      <form className="search-page-form" role="search" onSubmit={submit}>
        <label className="search-field">
          <SearchIcon />
          <span className="sr-only">Search the site</span>
          <input
            type="search"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Search projects, posts, skills, pages..."
            autoFocus={!query}
          />
        </label>
        <button type="submit" className="btn btn-primary">
          Search
        </button>
      </form>

      {query ? (
        <p className="search-summary" role="status">
          {results.length} {results.length === 1 ? "result" : "results"} for <strong>&ldquo;{query}&rdquo;</strong>
        </p>
      ) : (
        <div className="search-suggestions">
          <p className="muted">Try a topic:</p>
          <div className="tag-row">
            {getTags(posts).map((tag) => (
              <Link key={tag} className="topic-tag" to={`/search?q=${encodeURIComponent(tag)}`}>
                #{tag}
              </Link>
            ))}
          </div>
        </div>
      )}

      {query && results.length === 0 && (
        <div className="empty-state">
          <p>Nothing matched. Try fewer or different words.</p>
        </div>
      )}

      {grouped.map(({ group, items }) => (
        <section key={group} className="search-group" aria-labelledby={`search-${group}`}>
          <h2 id={`search-${group}`} className="group-title">
            {group} <span className="muted">({items.length})</span>
          </h2>
          <ul className="search-results">
            {items.map((item) => (
              <li key={`${item.group}-${item.title}`}>
                <Link to={item.to} className="search-result">
                  <span className="search-result-title">
                    <Highlight text={item.title} terms={terms} />
                  </span>
                  {item.description && (
                    <span className="search-result-text clamp-2">
                      <Highlight text={item.description} terms={terms} />
                    </span>
                  )}
                  <ArrowRightIcon />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
