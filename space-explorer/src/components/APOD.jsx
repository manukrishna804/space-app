import { useEffect, useState } from "react";

export default function APOD() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const API_KEY = "DEMO_KEY"; 

    fetch(`https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch APOD");
        }
        return res.json();
      })
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // ✅ Loading state
  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-700/70 bg-slate-900/80 p-6 text-slate-200">
        Loading Astronomy Picture of the Day...
      </div>
    );
  }

  // ✅ Error state
  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/40 bg-red-900/30 p-6 text-red-200">
        Failed to load APOD: {error}
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-700/70 bg-slate-900/80 overflow-hidden shadow-lg shadow-black/40">
      <div className="grid md:grid-cols-3">
        {/* Image / Video */}
        <div className="md:col-span-1">
          {data.media_type === "image" ? (
            <img
              src={data.url}
              alt={data.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <iframe
              title="APOD Video"
              src={data.url}
              className="h-full w-full min-h-[300px]"
              allowFullScreen
            />
          )}
        </div>

        {/* Text */}
        <div className="md:col-span-2 p-4 md:p-6 flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            NASA • Astronomy Picture of the Day
          </p>
          <h2 className="text-lg md:text-xl font-semibold text-slate-50">
            {data.title}
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed line-clamp-4">
            {data.explanation}
          </p>
          <p className="text-xs text-slate-400">
            Date: {data.date}
          </p>
        </div>
      </div>
    </section>
  );
}
