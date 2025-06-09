"use client";

import { createContext, useState, useContext, useEffect } from "react";

// Create a context for theme management
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Initialize theme from localStorage or default to 'light'
  const [currentTheme, setCurrentTheme] = useState(() => {
    // Check localStorage first (run only on client side)
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("userTheme");
      return savedTheme || "light";
    }
    return "light";
  });

  // Apply theme whenever it changes
  useEffect(() => {
    applyTheme(currentTheme);
    // Save to localStorage for persistence
    localStorage.setItem("userTheme", currentTheme);
  }, [currentTheme]);

  // Function to apply theme to document
  const applyTheme = (theme) => {
    if (typeof document === "undefined") return; // Skip on server-side

    const root = document.documentElement;

    if (theme === "dark") {
      root.setAttribute("data-bs-theme", "dark");
      document.body.classList.add("dark-theme");
      document.body.classList.remove("light-theme");
    } else {
      root.setAttribute("data-bs-theme", "light");
      document.body.classList.add("light-theme");
      document.body.classList.remove("dark-theme");
    }

    // Apply custom colors from settings if available
    try {
      const settings = JSON.parse(localStorage.getItem("appSettings"));
      if (settings) {
        root.style.setProperty(
          "--primary-color",
          settings.primaryColor || "#2563eb"
        );
        root.style.setProperty(
          "--secondary-color",
          settings.secondaryColor || "#1e40af"
        );
        root.style.setProperty(
          "--accent-color",
          settings.accentColor || "#10b981"
        );
      }
    } catch (error) {
      console.error("Error applying theme colors:", error);
    }
  };

  // Toggle theme function
  const toggleTheme = () => {
    setCurrentTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  // Set theme function
  const setTheme = (theme) => {
    setCurrentTheme(theme);
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
