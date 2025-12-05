import React from "react";

export default function Profile() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black text-white flex items-center justify-center px-6 py-10">
      
      <div className="max-w-xl w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-10 shadow-2xl">
        
        {/* Profile Image */}
        <div className="flex justify-center mb-6">
          <img 
            src="https://via.placeholder.com/150"
            alt="Profile"
            className="w-32 h-32 rounded-full border-4 border-purple-400 shadow-lg"
          />
        </div>

        {/* Name */}
        <h1 className="text-4xl font-extrabold text-center mb-2">
          Gauiri Shankar
        </h1>

        {/* Subtitle */}
        <p className="text-center text-lg text-gray-300 mb-6">
          Software Developer • Space Explorer • Tech Enthusiast
        </p>

        {/* Details Section */}
        <div className="space-y-4 text-lg">
          <p><span className="font-bold text-purple-300">Email:</span> gauiri@example.com</p>
          <p><span className="font-bold text-purple-300">Location:</span> India</p>
          <p><span className="font-bold text-purple-300">Skills:</span> React, Node.js, Python, Tailwind CSS</p>
        </div>

        {/* Button */}
        <div className="mt-8 flex justify-center">
          <button 
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-full text-lg font-semibold transition-all hover:scale-105"
          >
            Go Back
          </button>
        </div>

      </div>
    </div>
  );
}
