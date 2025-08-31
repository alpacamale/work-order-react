import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Board from "./pages/Board";
import NewPost from "./pages/NewPost";
import EditPost from "./pages/EditPost";
import ChatPage from "./pages/ChatPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/board" element={<Board />} />
        <Route path="/posts/new" element={<NewPost />} />
        <Route path="/posts/:id/edit" element={<EditPost />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/chat/:id" element={<ChatPage />} />
      </Routes>
    </Router>
  );
}

export default App;
