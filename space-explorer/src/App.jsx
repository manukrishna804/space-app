import { Routes, Route } from "react-router-dom";
import Home from "./Home.jsx";
import Choose from "./Choose.jsx";
import Kids from "./kids.jsx";
import Rocket from "./kids_section/rocket.jsx";
<<<<<<< HEAD
import UpcomingEvents from "./UpcomingEvents.jsx";
=======
import SpaceVideoSunny from "./kids_section/SpaceVideoQuizSunny.jsx";
import SpaceHuman from "./kids_section/SpaceLearningFlow.jsx";
import OtherHome from "./others_homepage.jsx";
>>>>>>> 3e75928d6f93df1a4620cab20b9623399cd57566
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/choose" element={<Choose />} />
      <Route path="/kids" element={<Kids />} />
      <Route path="/rocket" element={<Rocket />} />
<<<<<<< HEAD
      <Route path="/events" element={<UpcomingEvents />} />
=======
      <Route path="/sunny" element={<SpaceVideoSunny />} />
      <Route path="/human" element={<SpaceHuman />} />
      <Route path="/others" element={<OtherHome />} />
      
>>>>>>> 3e75928d6f93df1a4620cab20b9623399cd57566
    </Routes>
  );
}
