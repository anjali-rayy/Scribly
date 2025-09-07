import React from 'react';

const FlowerDecoration = () => {
  return (
    <div className="absolute top-1/2 right-[5%] md:right-[10%] -translate-y-1/2 w-[300px] h-[300px] md:w-[400px] md:h-[400px] z-10 hidden sm:block">
      {/* Main flower container with gentle rotation */}
      <div className="relative w-full h-full animate-spin-slow">
        <svg 
          width="200" 
          height="200" 
          viewBox="0 0 200 200" 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 drop-shadow-lg animate-pulse-gentle"
        >
          {/* Flower petals */}
          <g className="animate-pulse-gentle">
            {/* Top petal */}
            <ellipse 
              cx="100" 
              cy="60" 
              rx="25" 
              ry="40" 
              fill="#FFD700" 
              opacity="0.9" 
              transform="rotate(0 100 100)"
            />
            {/* Top-right petal */}
            <ellipse 
              cx="100" 
              cy="60" 
              rx="25" 
              ry="40" 
              fill="#FFA500" 
              opacity="0.8" 
              transform="rotate(72 100 100)"
            />
            {/* Bottom-right petal */}
            <ellipse 
              cx="100" 
              cy="60" 
              rx="25" 
              ry="40" 
              fill="#FF8C00" 
              opacity="0.9" 
              transform="rotate(144 100 100)"
            />
            {/* Bottom-left petal */}
            <ellipse 
              cx="100" 
              cy="60" 
              rx="25" 
              ry="40" 
              fill="#FFA500" 
              opacity="0.8" 
              transform="rotate(216 100 100)"
            />
            {/* Top-left petal */}
            <ellipse 
              cx="100" 
              cy="60" 
              rx="25" 
              ry="40" 
              fill="#FFD700" 
              opacity="0.9" 
              transform="rotate(288 100 100)"
            />
          </g>
          
          {/* Flower center */}
          <circle cx="100" cy="100" r="20" fill="#FF6B35" opacity="0.9"/>
          <circle cx="100" cy="100" r="12" fill="#FF4500" opacity="0.8"/>
          
          {/* Small decorative dots */}
          <circle cx="105" cy="95" r="3" fill="#FFFFFF" opacity="0.7"/>
          <circle cx="95" cy="105" r="2" fill="#FFFFFF" opacity="0.6"/>
        </svg>
      </div>

      {/* Geometric shapes around flower */}
      <div className="absolute inset-0">
        {/* Triangle */}
        <div className="absolute top-5 right-12 w-0 h-0 border-l-[30px] border-r-[30px] border-b-[50px] border-l-transparent border-r-transparent border-b-yellow-400 opacity-70 animate-float-up"></div>
        
        {/* Rectangle with rotation */}
        <div className="absolute bottom-16 left-8 w-20 h-10 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-lg rotate-12 opacity-80 animate-float-down"></div>
        
        {/* Small circles/dots */}
        <div className="absolute top-20 left-12 w-3 h-3 bg-orange-500 rounded-full opacity-60 animate-twinkle"></div>
        <div className="absolute top-32 right-20 w-2 h-2 bg-orange-500 rounded-full opacity-60 animate-twinkle-delayed-1"></div>
        <div className="absolute bottom-24 left-20 w-2.5 h-2.5 bg-orange-500 rounded-full opacity-60 animate-twinkle-delayed-2"></div>
        <div className="absolute bottom-20 right-16 w-1.5 h-1.5 bg-orange-500 rounded-full opacity-60 animate-twinkle-delayed-3"></div>
        <div className="absolute top-16 left-32 w-3.5 h-3.5 bg-orange-500 rounded-full opacity-60 animate-twinkle-delayed-4"></div>
        <div className="absolute top-48 left-5 w-2 h-2 bg-orange-500 rounded-full opacity-60 animate-twinkle-delayed-5"></div>
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          from { transform: translateY(-50%) rotate(0deg); }
          to { transform: translateY(-50%) rotate(360deg); }
        }

        @keyframes pulse-gentle {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @keyframes float-up {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes float-down {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(10px); }
        }

        @keyframes twinkle {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }

        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }

        .animate-pulse-gentle {
          animation: pulse-gentle 4s ease-in-out infinite;
        }

        .animate-float-up {
          animation: float-up 6s ease-in-out infinite;
        }

        .animate-float-down {
          animation: float-down 8s ease-in-out infinite;
        }

        .animate-twinkle {
          animation: twinkle 3s ease-in-out infinite;
        }

        .animate-twinkle-delayed-1 {
          animation: twinkle 4s ease-in-out infinite 0.5s;
        }

        .animate-twinkle-delayed-2 {
          animation: twinkle 5s ease-in-out infinite 1s;
        }

        .animate-twinkle-delayed-3 {
          animation: twinkle 3.5s ease-in-out infinite 1.5s;
        }

        .animate-twinkle-delayed-4 {
          animation: twinkle 4.5s ease-in-out infinite 2s;
        }

        .animate-twinkle-delayed-5 {
          animation: twinkle 6s ease-in-out infinite 2.5s;
        }
      `}</style>
    </div>
  );
};

export default FlowerDecoration;