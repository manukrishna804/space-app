import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";



export default function Home() {
  const [stars, setStars] = useState([]);
  const navigate = useNavigate();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Generate random stars
    const newStars = Array.from({ length: 150 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2
    }));
    setStars(newStars);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-gray-900 via-purple-900 to-black">
      {/* Animated stars */}
      {stars.map(star => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white animate-pulse"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDuration: `${star.duration}s`,
            animationDelay: `${star.delay}s`,
            opacity: 0.8
          }}
        />
      ))}

      {/* Animated planets/circles */}
      <div 
        className="absolute top-20 right-20 w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 opacity-30 blur-2xl animate-pulse"
        style={{
          transform: `translate(${mousePos.x}px, ${mousePos.y}px)`,
          transition: 'transform 0.3s ease-out'
        }}
      />
      <div 
        className="absolute bottom-32 left-32 w-48 h-48 rounded-full bg-gradient-to-br from-pink-400 to-orange-500 opacity-20 blur-3xl animate-pulse"
        style={{
          transform: `translate(${-mousePos.x}px, ${-mousePos.y}px)`,
          transition: 'transform 0.3s ease-out',
          animationDuration: '4s'
        }}
      />

      {/* Shooting stars */}
      <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full animate-shooting-star" 
           style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-white rounded-full animate-shooting-star" 
           style={{ animationDelay: '3s' }} />
      <div className="absolute bottom-1/3 left-2/3 w-1 h-1 bg-white rounded-full animate-shooting-star" 
           style={{ animationDelay: '5s' }} />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        <div className="text-center space-y-8 animate-fade-in">
          {/* Title */}
          <h1 className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-gradient">
            Space Explorer
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-300 font-light tracking-wide animate-slide-up">
            Discover the wonders of the universe
          </p>

          {/* Button */}
          <button 
            className="group relative w-58 h-15 px-12 py-5 text-xl font-semibold text-white transition-all duration-300 hover:scale-110 active:scale-95"
            onClick={() => navigate("/choose")}

          >
            {/* Button glow effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-75 blur-lg group-hover:opacity-100 transition-opacity" />
            
            {/* Button background */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" />
            
            {/* Button border animation */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 animate-spin-slow" 
                 style={{ padding: '2px' }} />
            
            {/* Button text */}
            <span className="relative z-10 flex items-center justify-center gap-2">
              Let's Explore
              <svg 
                className="w-6 h-6 transition-transform group-hover:translate-x-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>

        </div>
      </div>

      <style jsx>{`
        @keyframes shooting-star {
          0% {
            transform: translateX(0) translateY(0);
            opacity: 1;
          }
          100% {
            transform: translateX(-300px) translateY(300px);
            opacity: 0;
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .animate-shooting-star {
          animation: shooting-star 2s ease-in infinite;
        }
        
        .animate-fade-in {
          animation: fade-in 1.5s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 1s ease-out 0.5s both;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 3s ease infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
}