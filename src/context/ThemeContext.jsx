import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

const customColors = {
primaryRed: "#e1321b",   // red
accentYellow: "#ffd700", // golden
softCream: "#000000",    // black
peachPink: "#e1321b",    // red
lightWhite: "#ffd700",   // golden
darkText: "#000000"      // black
};

const themeColors = {
  light: {
    background: customColors.lightWhite,
    text: customColors.darkText,
    primary: customColors.primaryRed,
    accent: customColors.accentYellow,
    hover: {
      background: "#f8eabc", // softCream
      text: customColors.darkText,
    },
    active: {
      background: "#f5baad", // peachPink
      text: customColors.primaryRed,
    },
  },
  dark: {
    background: "#212529",
    text: "#ffffff",
    primary: customColors.primaryRed,
    accent: customColors.accentYellow,
    hover: {
      background: "#2c3034",
      text: "#ffffff",
    },
    active: {
      background: "#3a3f44",
      text: "#ffffff",
    },
  },
};

export const ThemeProvider = ({ children }) => {
  const getInitialTheme = () => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  };

  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const html = document.documentElement;

    if (theme === "dark") {
      html.classList.add("dark");
      html.setAttribute("data-theme", "dark");
    } else {
      html.classList.remove("dark");
      html.setAttribute("data-theme", "light");
    }

    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === "light" ? "dark" : "light"));

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        themeColors: themeColors[theme],
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
