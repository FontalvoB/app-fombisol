import { BrowserRouter } from "react-router-dom";
import Workspace from "./redesign/Workspace";
import PwaUpdatePrompt from "./components/PwaUpdatePrompt";
import "./redesign/workspace.css";
import "./redesign/vivid.css";
import "./redesign/human.css";

export default function App() {
  return (
    <BrowserRouter>
      <Workspace />
      <PwaUpdatePrompt />
    </BrowserRouter>
  );
}
