import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import BottomNav from "../components/BottomNav"; // 👈 Add kiya
import librarinRoutes from "../route/LibrarianRoutes";
import { useSelector, useDispatch } from "react-redux";
import { LogOut, User, Menu } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { logout } from "../redux/features/authSlice";

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const user = useSelector((state) => state.auth.user?.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Close profile menu jab bahar click kare
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuOpen && !event.target.closest(".profile-menu-container")) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileMenuOpen]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <div className="flex flex-col md:flex-row">
      {/* Sidebar (desktop only) */}
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        routes={librarinRoutes}
      />

      {/* Main content area */}
      <div className="flex-1 bg-slate-100 dark:bg-slate-900 min-h-screen pb-14 md:pb-0">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white dark:bg-slate-800 shadow-md py-2">
          <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 px-4 py-3">
            {/* Left side */}
            <div className="flex items-center gap-4">
              <button
                className="md:hidden text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={24} />
              </button>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
              {/* Profile Dropdown */}
              <div className="relative profile-menu-container">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none"
                  aria-label="Profile menu"
                >
                  <div className="relative">
                    <img
                      src={user?.profilePicture || "/img/bookmyspace.jpeg"}
                      className="h-10 w-10 rounded-full object-cover border-2 border-blue-500 dark:border-blue-400"
                      alt="Profile"
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-800"></span>
                  </div>
                </button>

                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-700 shadow-lg rounded-md z-50 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-600">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {user?.name || "User"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-300 truncate">
                        {user?.email || "user@example.com"}
                      </p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          navigate("/dashboard/manage-profile");
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-600 flex items-center gap-2"
                      >
                        <User size={16} />
                        <span>Profile Settings</span>
                      </button>
{/* 
                      <button
                        onClick={toggleTheme}
                        className="w-full text-left text-gray-500 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-slate-700 rounded px-3 py-2 transition-colors duration-300 flex items-center text-sm"
                        aria-label="Toggle dark mode"
                      >
                        {theme === "dark" ? (
                          <>
                            <i className="ri-sun-line mr-2"></i> Light Mode
                          </>
                        ) : (
                          <>
                            <i className="ri-moon-line mr-2"></i> Dark Mode
                          </>
                        )}
                      </button> */}

                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                      >
                        <LogOut size={16} />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main>{children}</main>

        {/* Bottom Navigation (sirf mobile view) */}
        <BottomNav routes={librarinRoutes} />
      </div>
    </div>
  );
}

export default Layout;
