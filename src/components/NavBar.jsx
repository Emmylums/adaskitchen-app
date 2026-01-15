import { useState, useEffect, useRef } from "react";
import logo from '../assets/logo.png';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import {Element} from 'react-scroll';
import { faBars } from "@fortawesome/free-solid-svg-icons";

const NavBar = ({onToggleMobileNavBar, activeLink}) => {

    const [activeTab, setActiveTab] = useState(activeLink);
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
    
    const menuItems = [
        { name: "Home"},
        { name: "Menu"},
        { name: "Our Story"},
        // { name: "Catering"},
        { name: "Cart"},
        { name: "Login"},
    ];


    return(
            <Element name="top">
                <header className={`select-none w-full flex justify-between items-center transition-all duration-100 ease-in z-40 lg:px-16 px-5 text-white ${isSticky ? `bg-black py-4 shadow-lg ${showBackground ? "fixed" : "absolute"}` : "bg-transparent py-7 landscape:py-4 landscape:lg:py-7 absolute"}`}>
                    <Link to="/" smooth="true" duration={700} className="flex sm:w-auto landscape:w-1/3 w-3/6 text-lg space-x-4 leading-tight text-left font-black items-center cursor-pointer">
                        <img src={logo} alt="Original Logo" className="w-24 landscape:w-18 landscape:lg:w-30 "/>
                    </Link>
                    <div className="sm:hidden landscape:hidden">
                        <button className="text-white text-3xl" onClick={onToggleMobileNavBar}>
                            <FontAwesomeIcon icon={faBars}/>
                        </button>
                    </div>
                    <nav className="sm:flex landscape:flex lg:space-x-6 sm:space-x-1 landscape:space-x-1 landscape:text-sm md:text-xl landscape:lg:text-xl font-bold hidden tracking-wide">
                        {menuItems.map((item) => (
                            <Link to={`/${item.name}`} key={item.name} smooth="true" duration={700} onClick={action}><p className={`hover:text-own-2  pt-2 px-2 pb-1.5 transition duration-500 ease-in-out cursor-pointer text-nowrap ${
                                activeTab === item.name
                                ? " border-b-2 text-own-2"
                                : ""
                            }`}>{item.name}</p></Link>
                        ))}
                    </nav>
                </header>
            </Element>
        );
}

export default NavBar;

// 6B6054