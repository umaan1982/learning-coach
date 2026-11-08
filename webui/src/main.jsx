import { createRoot } from "react-dom/client";
import { TooltipProvider } from "@/components/ui/tooltip";
import App from "./App.jsx";
import "./index.css";

// Follow the system light/dark setting (shadcn themes switch on the `dark` class).
const dark = window.matchMedia("(prefers-color-scheme: dark)");
const applyTheme = () => document.documentElement.classList.toggle("dark", dark.matches);
applyTheme();
dark.addEventListener("change", applyTheme);

createRoot(document.getElementById("root")).render(
  <TooltipProvider delayDuration={300}>
    <App />
  </TooltipProvider>,
);
