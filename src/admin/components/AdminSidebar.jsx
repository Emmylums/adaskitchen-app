import {
  faClose,
  faHome,
  faUtensils,
  faPlusCircle,
  faInfoCircle,
  faThLarge,
  faShoppingCart,
  faFileInvoiceDollar,
  faUsers,
  faTags,
  faChartBar,
  faCog,
  faChevronRight,
  faChevronDown,
  faUserTie,
  faUserPlus,
  faListAlt,
  faClipboardList,
  faFileCirclePlus,
  faFileInvoice,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const AdminSideBar = ({ isOpen, activeLink, closeSidebar, className }) => {
  const location = useLocation();
  const [expanded, setExpanded] = useState(null);

  const handleExpand = (itemName) => {
    setExpanded(expanded === itemName ? null : itemName);
  };

  const menuItems = [
    { name: "Dashboard", icon: faHome, path: "/admin/Dashboard" },
    {
      name: "Menu",
      icon: faUtensils,
      path: "/admin/Menu",
      children: [
        { name: "Add to Menu", path: "/admin/menu/add", icon: faPlusCircle },
        { name: "All Menu", path: "/admin/menu/all", icon: faThLarge },
      ],
    },
    {
      name: "Categories",
      icon: faUtensils,
      path: "/admin/Categories",
      children: [
        { name: "Add Category", path: "/admin/categories/add", icon: faPlusCircle },
        { name: "All Categories", path: "/admin/categories/all", icon: faThLarge },
      ],
    },
    {
      name: "Employees",
      icon: faUserTie,
      path: "/admin/Employees",
      children: [
        { name: "All Employees", path: "/admin/employees/all", icon: faUsers },
        { name: "Add Employee", path: "/admin/employees/add", icon: faUserPlus },
      ],
    },
    { name: "Orders", icon: faShoppingCart, path: "/admin/orders" },
    {
      name: "Invoice",
      icon: faFileInvoiceDollar,
      children: [
        { name: "All Invoices", path: "/admin/employees/all", icon: faFileInvoice },
        { name: "New Invoice", path: "/admin/employees/add", icon: faFileCirclePlus },
      ],
    },
    { name: "Reports", icon: faChartBar, path: "/admin/reports" },
    { name: "Settings", icon: faCog, path: "/admin/settings" },
  ];

  // Auto-expand menu if child path matches
  useEffect(() => {
    const match = menuItems.find((item) =>
      item.children?.some((child) => child.path === location.pathname)
    );
    if (match) {
      setExpanded(match.name);
    }

    // Optional: log active menu item and path
    const findActiveMenuItem = (items) => {
      for (let item of items) {
        if (item.children) {
          const foundChild = item.children.find((child) => child.path === location.pathname);
          if (foundChild) {
            return { name: foundChild.name, path: foundChild.path };
          }
        } else if (item.path === location.pathname) {
          return { name: item.name, path: item.path };
        }
      }
      return null;
    };

    const active = findActiveMenuItem(menuItems);
  }, [location.pathname]);

  return (
    <>
      {/* Overlay */}
      <div
        onClick={closeSidebar}
        className={`${
          isOpen ? "bg-black/50 backdrop-blur-sm md:hidden z-50 fixed top-0 w-full h-screen" : ""
        }`}
      ></div>

      {/* Sidebar */}
      <div
        className={`fixed top-0 w-64  md:w-[25%] lg:w-[20%] h-screen bg-own-1 md:bg-black text-[#dfe3e7] transform ${
          isOpen ? "translate-x-0" : "translate-x-[-320px]"
        } transition-transform duration-500 z-50 ${className}`}
      >
        <div className="flex justify-between md:justify-center pt-10 pb-5 px-5 items-center bg-own-1">
          <h2 className="text-xl font-bold">Ada's Kitchen</h2>
          <button className="text-xl md:hidden" onClick={closeSidebar}>
            <FontAwesomeIcon icon={faClose} />
          </button>
        </div>

        <ul className="md:pt-7 px-5">
          {menuItems.map((item) => {
            const isChildActive = item.children?.some(
              (child) => child.path === location.pathname
            );
            const isActive = item.path === location.pathname || isChildActive;

            return (
              <li key={item.name} className="mb-2">
                {item.children ? (
                  <>
                    <button
                      onClick={() => handleExpand(item.name)}
                      className={`w-full flex justify-between items-center py-2 px-4 rounded ${
                        isActive ? "bg-own-2 text-black" : ""
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <FontAwesomeIcon icon={item.icon} />
                        {item.name}
                      </span>
                      <FontAwesomeIcon
                        icon={expanded === item.name ? faChevronDown : faChevronRight}
                        className="text-sm"
                      />
                    </button>

                    <div
                      className={`transition-all duration-400 ease-in-out overflow-hidden ${
                        expanded === item.name ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                      }`}
                    >
                      <ul className="ml-6 mt-1 space-y-1">
                        {item.children.map((child) => (
                          <li key={child.name}>
                            <Link to={child.path}>
                              <div className="py-2 px-4 rounded text-sm flex items-center gap-3 hover:bg-own-2 hover:text-black">
                                <FontAwesomeIcon icon={child.icon} />
                                {child.name}
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                ) : (
                  <Link to={item.path}>
                    <button
                      className={`w-full flex items-center gap-3 py-2 px-4 rounded hover:cursor-pointer ${
                        isActive ? "bg-own-2 text-black" : ""
                      }`}
                    >
                      <FontAwesomeIcon icon={item.icon} />
                      {item.name}
                    </button>
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
};

export default AdminSideBar;
