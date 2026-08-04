import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { StudentProvider } from "./state/StudentContext";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* Outside the router, so a crash in routing itself is still caught. */}
    <ErrorBoundary>
      <BrowserRouter>
        <StudentProvider>
          <App />
        </StudentProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
);
