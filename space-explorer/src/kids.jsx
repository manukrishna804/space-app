import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Kids() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const items = [
    { title: "Rocket", path: "/rocket", img: "https://cdn-icons-png.flaticon.com/512/616/616430.png" },
    { title: "Stars", path: "/stars", img: "https://cdn-icons-png.flaticon.com/512/1828/1828884.png" },
    { title: "Galaxies", path: "/galaxies", img: "https://cdn-icons-png.flaticon.com/512/414/414974.png" },
    { title: "Rockets", path: "/rockets", img: "https://cdn-icons-png.flaticon.com/512/321/321830.png" },
    { title: "Astronauts", path: "/astronauts", img: "https://cdn-icons-png.flaticon.com/512/869/869869.png" },
    { title: "Black Holes", path: "/blackholes", img: "https://cdn-icons-png.flaticon.com/512/581/581601.png" },
  ];

  // 🔍 FILTER ITEMS BASED ON SEARCH
  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-black text-white px-6 py-16">

      {/* Search bar */}
      <div className="flex justify-center mb-16">
        <input 
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}   // 👈 updates search text
          placeholder="Search topics..."
          className="w-full max-w-xl px-6 py-3 rounded-full text-lg bg-white/10 border border-white/20 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 place-items-center">

        {filteredItems.map(item => (
          <div
            key={item.title}
            onClick={() => navigate(item.path)}
            className="cursor-pointer group w-72 h-72 bg-white/10 border border-white/20 rounded-3xl shadow-lg hover:scale-105 transition-all p-6 backdrop-blur-xl flex flex-col items-center justify-center"
          >
            <img 
              src={item.img}
              alt={item.title}
              className="w-24 h-24 mb-4 group-hover:scale-110 transition"
            />
            <h2 className="text-2xl font-bold">{item.title}</h2>
          </div>
        ))}

      </div>
    </div>
  );
}
