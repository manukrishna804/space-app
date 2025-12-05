import { Routes, Route } from "react-router-dom";
import Home from "./Home.jsx";
import Profile from "./profile.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  );
}
