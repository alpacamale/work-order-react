import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const BottomNav = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false); // ✅ 로그아웃 즉시 상태 업데이트
    navigate("/login");
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        height: "60px",
        background: "#fff",
        borderTop: "1px solid #ddd",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        zIndex: 100,
      }}
    >
      <button
        onClick={() => navigate("/board")}
        style={{
          background: "none",
          border: "none",
          fontSize: "16px",
          fontWeight: location.pathname.startsWith("/board")
            ? "bold"
            : "normal",
          cursor: "pointer",
        }}
      >
        📋 보드
      </button>

      <button
        onClick={() => navigate("/chat")}
        style={{
          background: "none",
          border: "none",
          fontSize: "16px",
          fontWeight: location.pathname.startsWith("/chat") ? "bold" : "normal",
          cursor: "pointer",
        }}
      >
        💬 채팅
      </button>

      <button
        onClick={handleLogout}
        style={{
          background: "none",
          border: "none",
          fontSize: "16px",
          cursor: "pointer",
          color: "red",
        }}
      >
        🚪 로그아웃
      </button>
    </div>
  );
};

export default BottomNav;
