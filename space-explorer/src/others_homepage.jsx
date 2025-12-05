import { useEffect, useState } from "react";

export default function APOD() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const API_KEY = "DEMO_KEY"; // ✅ Replace with your real key

    async function fetchApod() {
      try {
        const res = await fetch(
          `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`
        );

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("APOD fetch failed:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchApod();
  }, []);

  // ✅ Loading state (UNCHANGED BEHAVIOR)
  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-700/70 bg-slate-900/80 p-6 text-slate-200 text-center">
        Loading Astronomy Picture of the Day…
      </div>
    );
  }

  // ✅ Fallback state (UNCHANGED BEHAVIOR)
  if (error || !data) {
    return (
      <section className="rounded-2xl border border-slate-700/70 bg-slate-900/80 p-6 text-center">
        <div className="text-6xl mb-4">🛰️</div>
        <h2 className="text-xl font-semibold text-slate-50 mb-2">
          Couldn&apos;t load today&apos;s APOD
        </h2>
        <p className="text-sm text-slate-300">
          NASA servers may be unreachable right now.
        </p>
        <p className="text-xs text-slate-500 mt-2">
          Error: {error || "Unknown error"}
        </p>
      </section>
    );
  }

  // ✅ FINAL LAYOUT (IMAGE AS FRAMED BACKGROUND + CONTENT KEPT)
  return (
    <section className="relative rounded-2xl border border-slate-700/70 bg-slate-900/80 overflow-hidden shadow-xl shadow-black/40">

      {/* ✅ BACKGROUND FRAME (BLURRED IMAGE FILL) */}
      {data.media_type === "image" && (
        <div
          className="absolute inset-0 bg-cover bg-center blur-2xl scale-110 opacity-30"
          style={{ backgroundImage: `url(${data.url})` }}
        />
      )}

      {/* ✅ FOREGROUND CONTENT */}
      <div className="relative z-10 flex flex-col items-center text-center">

        {/* ✅ IMAGE / VIDEO MAIN */}
        <div className="w-full flex justify-center bg-black/40">
          {data.media_type === "image" ? (
            <img
              src={data.url}
              alt={data.title}
              className="max-h-[420px] w-auto object-contain rounded-lg"
            />
          ) : (
            <iframe
              title="APOD Video"
              src={data.url}
              className="w-full max-w-4xl h-[320px] rounded-lg"
              allowFullScreen
            />
          )}
        </div>

        {/* ✅ TITLE + DATE (UNCHANGED CONTENT) */}
        <div className="px-6 pt-4">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
            NASA • Astronomy Picture of the Day
          </p>

          <h2 className="text-lg md:text-2xl font-semibold text-slate-50 mt-2">
            {data.title}
          </h2>

          <p className="text-xs text-slate-400 mt-1">
            {data.date}
          </p>
        </div>

        {/* ✅ DESCRIPTION AT THE BOTTOM (UNCHANGED CONTENT) */}
        <div className="px-6 pb-6 pt-4 max-w-4xl">
          <p className="text-sm text-slate-300 leading-relaxed">
            {data.explanation}
          </p>
        </div>

      </div>
    </section>
  );
}
