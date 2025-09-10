import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import DashboardStats from "../library/DashboardStats";
import dashboardAPI from "../apis/dashboardAPI";
import { useTheme } from "../context/ThemeContext";

// ------------------- Circular Loader Component -------------------
const InteractiveLoader = ({ progress }) => {
  const { themeColors } = useTheme();

  return (
    <div 
      className="flex flex-col items-center justify-center h-screen"
      style={{ backgroundColor: themeColors.background }}
    >
      {/* Circular loader */}
      <motion.div
        className="w-16 h-16 border-4 border-t-4 border-t-transparent rounded-full"
        style={{
          borderColor: `${themeColors.primary} transparent ${themeColors.primary} transparent`
        }}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      />
    </div>
  );
};

// ------------------- Dashboard Component -------------------
function Dashboard() {
  const { token } = useSelector((state) => state.auth.user);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const { themeColors } = useTheme();

  const fetchLibrarianStats = async () => {
    try {
      setProgress(10);
      const response = await dashboardAPI.getLibrarianStats(token);
      
      setProgress(30);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setProgress(60);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setStats(response.data.data);
      setProgress(100);
      
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard data");
      console.error("Dashboard error:", err);
      setProgress(0);
    }
  };

  useEffect(() => {
    fetchLibrarianStats();
  }, [token]);

  if (error) {
    return (
      <div 
        className="p-4 text-center min-h-screen"
        style={{ backgroundColor: themeColors.background }}
      >
        <p style={{ color: themeColors.primary }}>{error}</p>
        <button 
          onClick={() => {
            setError(null);
            fetchLibrarianStats();
          }}
          className="mt-4 px-6 py-2 rounded-lg font-medium transition-all"
          style={{
            backgroundColor: themeColors.primary,
            color: themeColors.lightText || '#ffffff',
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (progress < 100 || !stats) {
    return <InteractiveLoader progress={progress} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ backgroundColor: themeColors.background }}
    >
      <DashboardStats statsData={stats} />
    </motion.div>
  );
}

export default Dashboard;
