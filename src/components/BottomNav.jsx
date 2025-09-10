import React from "react";
import { Link, useLocation } from "react-router-dom";

const BottomNav = ({ routes }) => {
  const location = useLocation();
  const path = location.pathname;

  return (
    <>
      {/* Bottom Navigation - always above content */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800/95 backdrop-blur-lg shadow-2xl border-t border-slate-200/50 dark:border-slate-700/50 z-[60] lg:hidden">
        <div className="flex justify-around items-center py-2 px-2">
          {routes
            ?.filter((route) => !route.collapse)
            .slice(0, 4)
            .map((route, index) => {
              const isActive = path === route.path;
              const Icon = route.icon; // directly use the icon component from route

              return (
                <Link
                  key={index}
                  to={route.path}
                  className={`flex flex-col items-center px-2 py-1 rounded-lg transition-all duration-300 flex-1 ${
                    isActive
                      ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 scale-105 shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/10"
                  }`}
                >
                  {Icon && <Icon size={24} className="mb-1" />}
                  <span
                    className={`text-xs font-medium text-center ${
                      isActive
                        ? "text-orange-600 dark:text-orange-400"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {route.name}
                  </span>
                </Link>
              );
            })}
        </div>
      </div>

      {/* Bottom padding for content */}
      <div className="h-8 md:h-[3.75rem] lg:hidden"></div>
    </>
  );
};

export default BottomNav;
