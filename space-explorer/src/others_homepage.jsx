import { useNavigate } from "react-router-dom";

export default function OtherHome() {
  const weatherNews = [
    {
      title: "Solar Storm Alert",
      desc: "A moderate solar storm is expected to hit Earth tomorrow, possibly causing auroras.",
      time: "Updated 2 hours ago",
    },
    {
      title: "Heavy Rainfall Expected",
      desc: "The eastern region may experience heavy rainfall over the next 24 hours.",
      time: "Updated 3 hours ago",
    },
    {
      title: "Temperature Rising",
      desc: "Heatwave conditions expected in northern areas this week.",
      time: "Updated 1 hour ago",
    },
  ];

  const upcomingEvents = [
    {
      title: "Meteor Shower Peak",
      date: "Jan 12, 2025",
      desc: "The Quadrantids meteor shower will peak with up to 40 meteors per hour.",
    },
    {
      title: "Moon Eclipse",
      date: "Feb 18, 2025",
      desc: "A partial lunar eclipse visible in most Asian regions.",
    },
    {
      title: "Jupiter at Opposition",
      date: "Mar 9, 2025",
      desc: "Jupiter will be closest to Earth, perfect for telescope viewing.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-black text-white p-10">

      <h1 className="text-4xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
        Weather News & Space Events
      </h1>

      {/* TWO COLUMNS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

        {/* LEFT COLUMN - WEATHER */}
        <div className="bg-white/10 p-6 rounded-3xl border border-white/20 backdrop-blur-lg shadow-xl">
          <h2 className="text-3xl font-bold mb-6 text-blue-300">Weather News</h2>

          <div className="space-y-6">
            {weatherNews.map((news, index) => (
              <div
                key={index}
                className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/20 transition"
              >
                <h3 className="text-xl font-semibold">{news.title}</h3>
                <p className="text-gray-300 mt-2">{news.desc}</p>
                <p className="text-gray-400 text-sm mt-2">{news.time}</p>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN - UPCOMING EVENTS */}
        <div className="bg-white/10 p-6 rounded-3xl border border-white/20 backdrop-blur-lg shadow-xl">
          <h2 className="text-3xl font-bold mb-6 text-pink-300">Upcoming Space Events</h2>

          <div className="space-y-6">
            {upcomingEvents.map((event, index) => (
              <div
                key={index}
                className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/20 transition"
              >
                <h3 className="text-xl font-semibold">{event.title}</h3>
                <p className="text-gray-400 text-sm mt-1">{event.date}</p>
                <p className="text-gray-300 mt-2">{event.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
