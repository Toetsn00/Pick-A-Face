import "./css/App.css";
import "./css/HeaderFrame.css";
import "./css/BodyFrame.css";
import "./css/FooterFrame.css";
import { loadModels } from "./utils/faceModel";
import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import "./i18n";

function App() {
  useEffect(() => {
    loadModels();
  }, []);

  return (
    <Router basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<Home lang="en" />} />
        <Route path="/ko" element={<Home lang="ko" />} />
      </Routes>
    </Router>
  );
}

export default App;
