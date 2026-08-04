import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { LangProvider } from "./lib/i18n";
import { StudentProvider } from "./state/StudentContext";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/*
      Language is outermost. The crash screen is the one screen guaranteed to
      be read by somebody having a bad time, so it has to be in their language
      too — which means the provider has to sit above the boundary, not inside
      it.
    */}
    <LangProvider>
      <ErrorBoundary>
        <BrowserRouter>
          <StudentProvider>
            <App />
          </StudentProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </LangProvider>
  </StrictMode>
);
