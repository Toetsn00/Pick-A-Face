import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import "./i18n";
import { HelmetProvider } from "react-helmet-async";

hydrateRoot(
  document.getElementById("root")!,
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
);
