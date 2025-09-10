import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { LogOut, Menu, ChevronLeft } from "lucide-react";
import { logout } from "../redux/features/authSlice";

// Import react-icons
import { MdDashboard, MdAccessTime } from "react-icons/md";
import { FaUniversity, FaRegCalendarCheck, FaMoneyBillWave } from "react-icons/fa";
import { BsGrid3X3, BsQrCode } from "react-icons/bs";
import { AiOutlineClockCircle } from "react-icons/ai";
import { RiLockPasswordLine } from "react-icons/ri";

const Sidebar = ({ isOpen, setIsOpen, routes }) => {
  const location = useLocation();
  const path = location.pathname;
  const user = useSelector((state) => state.auth.user?.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [expandedMenus, setExpandedMenus] = useState({});

  const toggleMenu = (index) => {
    setExpandedMenus({
      ...expandedMenus,
      [index]: !expandedMenus[index],
    });
  };

  const isActiveRoute = (routePath) => {
    return path === routePath || path.startsWith(routePath + "/");
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <>
      {/* Persistent Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed z-[80] top-4 left-4 p-2 bg-white dark:bg-slate-800 shadow-lg transition-all duration-300 lg:z-50 ${
          isOpen ? "ml-64" : ""
        }`}
        style={{
          transform: isOpen ? "translateX(-65px)" : "translateX(0)",
        }}
      >
        {isOpen ? (
          <ChevronLeft className="text-gray-600 dark:text-gray-300" size={24} />
        ) : (
          <Menu className="text-gray-600 dark:text-gray-300" size={24} />
        )}
      </button>

      {/* Sidebar */}
      <div
        className={`h-full w-64 fixed bg-white dark:bg-[#212529] z-[75] lg:z-45 font-inter overflow-hidden flex flex-col transition-all duration-300 ${
          isOpen ? "left-0" : "-left-64"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b dark:border-slate-700 p-4">
          <div className="flex items-center gap-2">
            <img src="/img/bookmyspace.jpeg" alt="Logo" className="h-10 rounded-full" />
            <h2 className="text-lg font-bold">Book My Space</h2>
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto py-4 px-3">
          {routes?.map((route, index) => {
            const Icon = route.icon; // React icon component

            return (
              <div key={index} className="relative group">
                {route.collapse ? (
                  <>
                    <div
                      onClick={() => toggleMenu(index)}
                      className={`flex items-center justify-between py-2.5 gap-3 px-3 cursor-pointer my-1 transition-all duration-300 ${
                        isActiveRoute(route.path)
                          ? "bg-orange-100 dark:bg-slate-700 text-orange-600 dark:text-white"
                          : "hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-lg">
                          <Icon size={20} />
                        </div>
                        <div className="whitespace-nowrap">{route.name}</div>
                      </div>
                      <div className={`transition-transform duration-300 ${expandedMenus[index] ? "rotate-90" : ""}`}>
                        <AiOutlineClockCircle size={16} />
                      </div>
                    </div>

                    <div className={`overflow-hidden transition-all duration-300 ${expandedMenus[index] ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
                      {route.collapse.map((subRoute, subIndex) => {
                        const SubIcon = subRoute.icon;
                        return (
                          <Link
                            key={subIndex}
                            to={subRoute.path}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center py-2 gap-3 px-3 cursor-pointer my-1 ml-6 transition-all duration-300 ${
                              path === subRoute.path
                                ? "bg-orange-100 dark:bg-slate-700 text-orange-600 dark:text-white"
                                : "hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white"
                            }`}
                          >
                            <div className="text-lg">
                              <SubIcon size={18} />
                            </div>
                            <div className="whitespace-nowrap">{subRoute.name}</div>
                          </Link>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <Link
                    to={route.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center font-inter py-2.5 gap-3 px-3 cursor-pointer my-1 transition-all duration-300 ${
                      path === route.path
                        ? "bg-orange-100 dark:bg-slate-700 text-orange-600 dark:text-white"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    <div className="text-lg">
                      <Icon size={20} />
                    </div>
                    <div className="whitespace-nowrap">{route.name}</div>
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-600/30 p-4 relative bg-gray-900">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={user?.profilePicture || "/img/bookmyspace.jpeg"}
                  className="w-10 h-10 rounded-full object-cover border-2 border-orange-500 shadow-lg"
                  alt="Profile"
                />
                <span className="w-3 h-3 bg-green-500 rounded-full absolute -bottom-1 -right-1 border-2 border-gray-900"></span>
              </div>
              <div className="overflow-hidden">
                <h4 className="font-medium text-white text-sm truncate">{user?.name || "User"}</h4>
                <p className="text-xs text-gray-400 truncate">{user?.email || "user@example.com"}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate("/dashboard/change-password")}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2.5 px-4 transition-all duration-300 text-sm mb-3 shadow-lg hover:shadow-xl"
          >
            <RiLockPasswordLine size={18} />
            <span>Change Password</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-2.5 px-4 transition-all duration-300 text-sm shadow-lg hover:shadow-xl"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
