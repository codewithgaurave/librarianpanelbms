import React from "react";
import Header from "./Header";

export default function HeroHead({ text }) {
  const IMG_URI = import.meta.env.VITE_BG_URI;
  
  return (
    <div>
      <header
        className="relative overflow-hidden p-8 sm:p-16 md:p-12 lg:p-12 xl:p-12"
        style={{
          backgroundImage: `linear-gradient(to right, #9d1df8bb, #4026e8be), url(${IMG_URI}/img/books1.jpg)`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Dark mode overlay for better contrast */}
        <div className="absolute inset-0 bg-black/20 dark:bg-black/40 transition-colors duration-300"></div>

        {/* Navigation */}
        <Header calr="text-white dark:text-gray-100" />

        {/* Hero Section */}
        <div className="relative z-10 text-center py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 md:px-8 text-white dark:text-gray-100">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-4 sm:mb-6 md:mb-8 leading-tight">
            {text}
          </h1>
          
          {/* Breadcrumb */}
          <div className="flex items-center justify-center space-x-2 sm:space-x-4 mt-6 sm:mt-8 md:mt-10 text-sm sm:text-base md:text-lg">
            <span className="hover:text-purple-200 dark:hover:text-purple-300 transition-colors cursor-pointer">
              Home
            </span>
            <span className="text-purple-200 dark:text-purple-300">/</span>
            <span className="text-purple-200 dark:text-purple-300 font-medium">
              {text}
            </span>
          </div>
        </div>

        {/* Background Decorative Elements - Responsive */}
        <div className="absolute inset-0 opacity-10 dark:opacity-20 transition-opacity duration-300">
          {/* Top left circle */}
          <div className="absolute top-4 sm:top-6 md:top-10 left-4 sm:left-6 md:left-10 w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 border-2 border-white dark:border-gray-200 rounded-full animate-pulse"></div>
          
          {/* Top right square */}
          <div className="absolute top-8 sm:top-12 md:top-20 right-8 sm:right-12 md:right-20 w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24 border border-white dark:border-gray-200 rounded-lg rotate-45 animate-bounce"></div>
          
          {/* Bottom left circle */}
          <div className="absolute bottom-4 sm:bottom-6 md:bottom-10 left-1/4 w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-white dark:bg-gray-200 rounded-full animate-pulse"></div>
          
          {/* Bottom right square */}
          <div className="absolute bottom-8 sm:bottom-12 md:bottom-20 right-4 sm:right-6 md:right-10 w-10 h-10 sm:w-16 sm:h-16 md:w-20 md:h-20 border border-white dark:border-gray-200 animate-bounce"></div>
          
          {/* Additional decorative elements for larger screens */}
          <div className="hidden lg:block absolute top-1/2 left-8 w-6 h-6 bg-white dark:bg-gray-200 rounded-full opacity-60"></div>
          <div className="hidden lg:block absolute top-1/3 right-1/3 w-8 h-8 border border-white dark:border-gray-200 rotate-12"></div>
        </div>

        {/* Gradient overlay for better text readability in dark mode */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10 dark:to-black/30 pointer-events-none"></div>
      </header>
    </div>
  );
}