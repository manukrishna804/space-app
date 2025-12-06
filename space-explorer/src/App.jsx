import { Routes, Route } from "react-router-dom";
import Home from "./Home.jsx";
import Choose from "./Choose.jsx";
import Kids from "./kids.jsx";
import Rocket from "./kids_section/rocket.jsx";
import UpcomingEvents from "./UpcomingEvents.jsx";
import SpaceVideoSunny from "./kids_section/Sunny.jsx";
import SpaceHuman from "./kids_section/Human.jsx";
import OtherHome from "./others_homepage.jsx";
import FarmerAssist from "./FarmerAssist.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/choose" element={<Choose />} />
      <Route path="/kids" element={<Kids />} />
      <Route path="/rocket" element={<Rocket />} />
      <Route path="/events" element={<UpcomingEvents />} />
      <Route path="/sunny" element={<SpaceVideoSunny />} />
      <Route path="/human" element={<SpaceHuman />} />
      <Route path="/others" element={<OtherHome />} />
      <Route path="/farmer-assist" element={<FarmerAssist />} />

    </Routes>
  );
}
