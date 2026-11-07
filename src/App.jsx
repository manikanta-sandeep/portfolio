import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import PortfolioLayout from "./components/PortfolioLayout";
import SiteLayout from "./components/SiteLayout";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";
import ContactPage from "./pages/ContactPage";
import ExperiencePage from "./pages/ExperiencePage";
import ExtracurricularsPage from "./pages/ExtracurricularsPage";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import ProjectPage from "./pages/ProjectPage";
import ProjectsPage from "./pages/ProjectsPage";
import SearchPage from "./pages/SearchPage";
import SkillsPage from "./pages/SkillsPage";
import "./App.css";

// The admin area is split into its own chunks so visitors never download it.
const AdminLayout = lazy(() => import("./admin/AdminLayout"));
const AdminLoginPage = lazy(() => import("./admin/AdminLoginPage"));
const AdminDashboardPage = lazy(() => import("./admin/AdminDashboardPage"));
const AdminPostsPage = lazy(() => import("./admin/AdminPostsPage"));
const AdminPostEditorPage = lazy(() => import("./admin/AdminPostEditorPage"));
const AdminProfilePage = lazy(() => import("./admin/AdminProfilePage"));
const AdminCollectionPage = lazy(() => import("./admin/AdminCollectionPage"));
const AdminMessagesPage = lazy(() => import("./admin/AdminMessagesPage"));
const AdminAccountPage = lazy(() => import("./admin/AdminAccountPage"));
const AdminAnalyticsPage = lazy(() => import("./admin/AdminAnalyticsPage"));
// Loaded on demand so the QR library is only downloaded on /qr.
const QrPage = lazy(() => import("./pages/QrPage"));

const pageLoading = (
  <div className="app-loading" role="status">
    <span className="spinner" aria-hidden="true" />
  </div>
);

function App() {
  return (
    <Suspense fallback={pageLoading}>
      <Routes>
        <Route path="admin/login" element={<AdminLoginPage />} />
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="analytics" element={<AdminAnalyticsPage />} />
          <Route path="posts" element={<AdminPostsPage />} />
          <Route path="posts/new" element={<AdminPostEditorPage />} />
          <Route path="posts/:id" element={<AdminPostEditorPage />} />
          <Route path="profile" element={<AdminProfilePage />} />
          <Route path="sections/:name" element={<AdminCollectionPage />} />
          <Route path="messages" element={<AdminMessagesPage />} />
          <Route path="account" element={<AdminAccountPage />} />
        </Route>
        <Route element={<SiteLayout />}>
          <Route element={<PortfolioLayout />}>
            <Route index element={<HomePage />} />
            <Route path="experience" element={<ExperiencePage />} />
            <Route path="skills" element={<SkillsPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="extracurriculars" element={<ExtracurricularsPage />} />
          </Route>
          <Route path="projects/:id" element={<ProjectPage kind="project" />} />
          <Route path="research/:id" element={<ProjectPage kind="research" />} />
          <Route path="blog" element={<BlogPage />} />
          <Route path="blog/:id" element={<BlogPostPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route
            path="qr"
            element={
              <Suspense fallback={pageLoading}>
                <QrPage />
              </Suspense>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
