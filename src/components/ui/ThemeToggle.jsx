"use client";

export default function ThemeToggle({ isDarkMode, setIsDarkMode }) {
  return (
    <button 
      onClick={() => setIsDarkMode(!isDarkMode)}
      style={{
        background: "rgba(255, 255, 255, 0.2)",
        border: "none",
        borderRadius: "50%",
        width: "50px",
        height: "50px",
        fontSize: "20px",
        cursor: "pointer",
        transition: "all 0.3s ease",
        backdropFilter: "blur(10px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
      title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {isDarkMode ? '☀️' : '🌙'}
    </button>
  );
}