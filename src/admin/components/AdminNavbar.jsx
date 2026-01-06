import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import {Element} from 'react-scroll';
import { faBars, faBell, faCog, faSearch } from "@fortawesome/free-solid-svg-icons";
import boy from "../../assets/girl.png";

const AdminNavBar = ({toggleSidebar, isSideBarOpen}) => {
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
                <header className={`select-none w-full flex justify-between items-center transition-all duration-100 ease-in z-40 lg:px-10 px-5 text-own-2 bg-white py-5 shadow-sm fixed ${isSideBarOpen ? "md:w-[70%] lg:w-[75%]" : "md:w-full"} transition-all duration-300 ease-in-out`}>
                    <div className="">
                        <button className="text-own-2 text-3xl" onClick={toggleSidebar}>
                            <FontAwesomeIcon icon={faBars}/>
                        </button>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search..."
                          className="pl-10 pr-4 py-2 border border-own-2 rounded-xl focus:ring-2 focus:ring-amber-600 focus:border-amber-600"
                          // value={searchTerm}
                          // onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3 text-own-2" />
                      </div>
                      <Link to="/admin/settings">
                        <button className="p-2 rounded-lg hover:bg-amber-060">
                          <FontAwesomeIcon icon={faCog} className="text-own-2" />
                        </button>
                      </Link>
                    </div>
                </header>
              </div>
            </Element>
        );
}

export default AdminNavBar;