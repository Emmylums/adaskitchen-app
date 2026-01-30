import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import {Element} from 'react-scroll';
import { faBars, faBell, faUser } from "@fortawesome/free-solid-svg-icons";

const UserNavBar = ({toggleSidebar, isSideBarOpen, userData}) => {
    const [isSticky, setIsSticky] = useState(false);
    const [showBackground, setShowBackground] = useState(false);
    const hideTimerRef = useRef(null);
    
    function action(){
        setActiveTab(activeLink)
    }

    useEffect(() => {
    const handleScroll = () => {
      const shouldBeSticky = window.scrollY >= window.innerHeight;

      if (shouldBeSticky) {
        setIsSticky(true);
        setShowBackground(true);

        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        hideTimerRef.current = setTimeout(() => {
          setShowBackground(false);
        }, 5000);
      } else {
        setIsSticky(false);
        setShowBackground(false);
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);


    return(
            <Element name="top">
              <div className="md:flex md:justify-end">
                <header className={`select-none w-full flex justify-between items-center transition-all duration-100 ease-in z-40 lg:px-10 px-5 text-white bg-black py-5 shadow-lg fixed ${isSideBarOpen ? "md:w-[70%] lg:w-[75%]" : "md:w-full"} transition-all duration-300 ease-in-out`}>
                    <div className="">
                        <button className="text-white text-3xl" onClick={toggleSidebar}>
                            <FontAwesomeIcon icon={faBars}/>
                        </button>
                    </div>
                    <div>
                        <div className={`w-14 h-14 bg-own-2 rounded-full ${userData?.photoURL ? "" : "flex items-center justify-center p-2"}`}>
                          {userData?.photoURL ? (
                            <img src={userData.photoURL} alt={userData?.displayName || "User"} className="w-full h-full object-cover rounded-full"/>
                          ) : (
                            <FontAwesomeIcon icon={faUser} className="text-3xl text-white" />
                          )}
                        </div>
                    </div>
                </header>
              </div>
            </Element>
        );
}

export default UserNavBar;