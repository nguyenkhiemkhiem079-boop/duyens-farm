import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import FourFields from "./FourFields";
import "./four-fields.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <FourFields />
  </StrictMode>,
);
