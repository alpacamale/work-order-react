import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Board from "./pages/Board";
import NewPost from "./pages/NewPost";
import EditPost from "./pages/EditPost";
import ChatPage from "./pages/ChatPage";
import CreateChatPage from "./pages/CreateChatPage";

function App() {
  const isLoggedIn = !!localStorage.getItem("token"); // ✅ 로그인 여부 확인 (token 존재 여부)
  return (
    <Router>
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
        <Route path="/login" element={<Login />} />
        <Route path="/board" element={<Board />} />
        <Route path="/posts/new" element={<NewPost />} />
        <Route path="/posts/:id/edit" element={<EditPost />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/chat/:id" element={<ChatPage />} />
        <Route path="/chat/new" element={<CreateChatPage />} />
      </Routes>
    </Router>
  );
}

export default App;
