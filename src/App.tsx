import { BrowserRouter } from "react-router-dom";
import Workspace from "./redesign/Workspace";
import "./redesign/workspace.css";
import "./redesign/vivid.css";
import "./redesign/human.css";

export default function App() {
  return (
    <BrowserRouter>
      <Workspace />
    </BrowserRouter>
  );
}
