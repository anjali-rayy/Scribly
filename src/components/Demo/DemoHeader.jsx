import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { nav } from "../../data";
import Auth from "./Auth/Auth";
import { Blog } from "../../Context/Context";

const DemoHeader = () => {
  const [isActive, setIsActive] = useState(false);
  const { authModel, setAuthModel } = Blog();

  useEffect(() => {
    const scrollMe = () => {
      window.scrollY > 50 ? setIsActive(true) : setIsActive(false);
    };
    window.addEventListener("scroll", scrollMe);
  }, []);
  return (
    <header
      className={`border-b border-black sticky top-0 z-50 
    ${isActive ? "bg-white" : "bg-amber-400"}
    transition-all duration-500`}>
      <div className="size h-[70px] flex items-center justify-between">
        <Link to={"/"}>
          <img
            className="h-[6rem]"
            src="https://res.cloudinary.com/dhgob6vzf/image/upload/v1757008257/Creative_Wordmark_Logo_for_Scribly-removebg-preview_lbxe1h.png"
            alt="logo"
          />
        </Link>
        <div className="flex items-center gap-5">
          <div className="hidden text-sm sm:flex items-center gap-5">
            {nav.map((link, i) => (
              <Link key={i} to={link.path}>
                {link.title}
              </Link>
            ))}
          </div>
          <div className="relative">
            <button
              onClick={() => setAuthModel(true)}
              className="hidden text-sm sm:flex items-center gap-5">
              Sign In
            </button>
            <Auth modal={authModel} setModal={setAuthModel} />
          </div>
          <button
            onClick={() => setAuthModel(true)}
            className={`text-white rounded-full px-3 p-2 text-sm font-medium
            ${isActive ? "bg-green-700" : "bg-black"}
            `}>
            Get Started
          </button>
        </div>
      </div>
    </header>
  );
};

export default DemoHeader;