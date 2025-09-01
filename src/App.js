import React from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Board from "./pages/Board";
import NewPost from "./pages/NewPost";
import EditPost from "./pages/EditPost";
import ChatPage from "./pages/ChatPage";
import CreateChatPage from "./pages/CreateChatPage";
import BottomNav from "./components/BottomNav";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  useEffect(() => {
    const checkLogin = () => {
      setIsLoggedIn(!!localStorage.getItem("token"));
    };
    window.addEventListener("storage", checkLogin);
    return () => window.removeEventListener("storage", checkLogin);
  }, []);
  return (
    <Router>
      <div style={{ paddingBottom: isLoggedIn ? "60px" : "0" }}>
        <Routes>
          <Route
            path="/"
            element={
              isLoggedIn ? (
                <Navigate to="/board" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/login"
            element={<Login setIsLoggedIn={setIsLoggedIn} />}
          />
          <Route path="/board" element={<Board />} />
          <Route path="/posts/new" element={<NewPost />} />
          <Route path="/posts/:id/edit" element={<EditPost />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/chat/:id" element={<ChatPage />} />
          <Route path="/chat/new" element={<CreateChatPage />} />
        </Routes>
      </div>
      {isLoggedIn && <BottomNav setIsLoggedIn={setIsLoggedIn} />}
    </Router>
  );
}

export default App;
