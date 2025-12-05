export default function Choose() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 via-purple-900 to-black text-white px-6">

      <h1 className="text-5xl font-extrabold mb-12 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-pulse">
        Choose Your Experience
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

        {/* Kids Card */}
        <div
          className="cursor-pointer group relative w-72 h-72 rounded-3xl bg-gradient-to-br from-blue-500/30 to-purple-600/30 backdrop-blur-xl border border-white/20 shadow-xl hover:scale-110 transition-all p-6 flex flex-col items-center justify-center"
        >
          <div className="absolute inset-0 rounded-3xl bg-blue-500/20 blur-2xl opacity-0 group-hover:opacity-100 transition"></div>

          <img
            src="https://cdn-icons-png.flaticon.com/512/201/201818.png"
            alt="Kids"
            className="w-24 h-24 mb-4 group-hover:scale-110 transition"
          />

          <h2 className="text-3xl font-bold">Kids</h2>
          <p className="text-gray-300 mt-2 text-center">
            Fun stories & animations
          </p>
        </div>

        {/* Others Card */}
        <div
          className="cursor-pointer group relative w-72 h-72 rounded-3xl bg-gradient-to-br from-pink-500/30 to-orange-500/30 backdrop-blur-xl border border-white/20 shadow-xl hover:scale-110 transition-all p-6 flex flex-col items-center justify-center"
        >
          <div className="absolute inset-0 rounded-3xl bg-pink-500/20 blur-2xl opacity-0 group-hover:opacity-100 transition"></div>

          <img
            src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            alt="Others"
            className="w-24 h-24 mb-4 group-hover:scale-110 transition"
          />

          <h2 className="text-3xl font-bold">Others</h2>
          <p className="text-gray-300 mt-2 text-center">
            General space exploration
          </p>
        </div>

      </div>
    </div>
  );
}
