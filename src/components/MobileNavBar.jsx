import { faClose, faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { Link } from "react-router-dom";


const MobileNavBar = ({ isVisible, activeLink, onClose, className }) => {
  
  const [activeTab, setActiveTab] = useState(activeLink);

  function action(){
    setActiveTab(activeLink)
  }

  const menuItems = [
      { name: "Home", link: ""},
      { name: "Our Story", link: "our-story"},
      { name: "Menu", link: "menu"},
      // { name: "Catering", link: "catering"},
      { name: "Cart", link: "cart", icon: <FontAwesomeIcon icon={faShoppingCart} className="inline-block ml-2 text-xs" />},
      { name: "Contact Us", link: "contact-us"},
      { name: "Login", link: "login"},
  ];

  return (
    <>
      <div onClick={onClose} className={`${isVisible ? "bg-black/40 backdrop-blur-sm z-50 fixed top-0 w-full h-screen" : ""}`}>

      </div>
      <div
        className={`sm:hidden landscape:hidden fixed right-0 top-0 w-64 h-screen px-5 bg-own-1 text-[#dfe3e7] transform ${
          isVisible ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-500 z-50 ${className}`}
      >
        <div className="flex justify-between items-center px-4 mb-8">
          <h2 className="text-xl font-bold">Menu</h2>
          <button className="sm:hidden landscape:hidden text-xl" onClick={onClose}>
            <FontAwesomeIcon icon={faClose} />
          </button>
        </div>
        <ul>
          {menuItems.map((item) => (
            <li key={item.name} className="mb-2"> 
              <Link to={`/${item.link}`}>
                <button
                  onClick={action}
                  className={`w-full text-left py-2 px-4 rounded ${
                    activeTab === item.name
                    ? "bg-own-2 text-black"
                    : ""
                  }`}
                  >
                    {item.name}
                    {item.icon && item.icon}
                </button>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default MobileNavBar;
