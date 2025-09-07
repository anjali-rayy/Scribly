import React, { useState } from "react";
import Auth from "./Auth/Auth";
import FlowerDecoration from "./FlowerDecoration"; // Adjust path as needed

const Banner = () => {
  const [modal, setModal] = useState(false);

  const handleStartReading = () => {
    setModal(true);
  };

  return (
    <>
      <div className="bg-amber-400 border-b border-black relative overflow-hidden">
        <div className="size py-[5rem] flex flex-col items-start gap-[1rem] relative z-20">
          <h1 className="font-serif text-[3rem] sm:text-[4rem] md:text-[6rem] font-black leading-tight">
            Stay curious.
          </h1>
          <p className="w-full md:w-[31rem] text-[1.3rem] md:text-[1.5rem] font-normal leading-7">
            Discover stories, thinking, and expertise from writers on any topic.
          </p>
          <button 
            onClick={handleStartReading}
            className="bg-black/80 hover:bg-black/90 text-white text-[1rem] px-6 py-3 mt-[2.5rem] rounded-full transition-all font-normal"
          >
            Start reading
          </button>
        </div>
        
        {/* Add the flower decoration */}
        <FlowerDecoration />
      </div>

      {/* Auth Modal */}
      <Auth modal={modal} setModal={setModal} />
    </>
  );
};

export default Banner;