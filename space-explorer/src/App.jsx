import { Routes, Route } from "react-router-dom";
import Home from "./Home.jsx";
import Choose from "./Choose.jsx";
import Kids from "./kids.jsx";
import Rocket from "./kids_section/rocket.jsx";
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/choose" element={<Choose />} />
      <Route path="/kids" element={<Kids />} />
      <Route path="/rocket" element={<Rocket />} />
    </Routes>
  );
}
