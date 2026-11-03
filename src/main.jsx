import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import AuthProvider from "./components/AuthProvider";
import ContentProvider from "./components/ContentProvider";
import ThemeProvider from "./components/ThemeProvider";
import ToastProvider from "./components/ToastProvider";
import { basename, restoreRedirectedPath } from "./lib/paths";
import "./index.css";

restoreRedirectedPath();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <ThemeProvider>
        <ToastProvider>
          <ContentProvider>
            <AuthProvider>
              <App />
            </AuthProvider>
          </ContentProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
