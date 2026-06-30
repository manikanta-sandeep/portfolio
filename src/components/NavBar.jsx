import { NavLink } from "react-router-dom";

export default function NavBar() {
  return (
    <header className="site-header" role="banner">
      <div className="brand-block">
        <p className="eyebrow">Portfolio</p>
        <h1>Manikanta Sandeep</h1>
      </div>

      <nav aria-label="Primary">
        <ul className="nav-list">
          <li>
            <a href="#about">About</a>
          </li>
          <li>
            <a href="#projects">Projects</a>
          </li>
          <li>
            <a href="#research">Research</a>
          </li>
          <li>
            <a href="#experience">Experience</a>
          </li>
          <li>
            <a href="#contact">Contact</a>
          </li>
          <li>
            <NavLink to="/blog">Blog</NavLink>
          </li>
        </ul>
      </nav>
    </header>
  );
}
