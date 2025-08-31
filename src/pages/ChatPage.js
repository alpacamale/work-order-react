import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

const ChatPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [chatRooms, setChatRooms] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [users, setUsers] = useState([]);
  const inputRef = useRef();

  const currentUser = JSON.parse(localStorage.getItem("user")); // ✅ 로그인 유저

  // 🔹 채팅방 목록 불러오기
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await fetch("https://api.work-order.org/v1/chat-rooms", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();
        setChatRooms(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("❌ 채팅방 목록 불러오기 실패:", err);
      }
    };
    fetchRooms();
  }, []);

  // 🔹 채팅방 메시지 불러오기
  useEffect(() => {
    if (!id) return;
    const fetchMessages = async () => {
      try {
        const res = await fetch(
          `https://api.work-order.org/v1/chat-rooms/${id}/messages`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const data = await res.json();
        setMessages(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("❌ 메시지 불러오기 실패:", err);
      }
    };
    fetchMessages();
  }, [id]);

  // 🔹 메시지 전송
  const handleSend = async () => {
    if (!input.trim()) return;
    try {
      const res = await fetch(
        `https://api.work-order.org/v1/chat-rooms/${id}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ text: input }),
        }
      );
      if (!res.ok) throw new Error("메시지 전송 실패");

      const newMsg = await res.json();
      setMessages((prev) => [...prev, newMsg]);
      setInput("");
    } catch (err) {
      alert(err.message);
    }
  };

  // 현재 선택된 방
  const currentRoom = chatRooms.find((r) => r._id === id);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* 왼쪽: 채팅방 목록 */}
      <div
        style={{
          width: "280px",
          borderRight: "1px solid #ddd",
          overflowY: "auto",
        }}
      >
        <h3 style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>
          채팅
        </h3>
        {chatRooms.map((room) => (
          <div
            key={room._id}
            onClick={() => navigate(`/chat/${room._id}`)}
            style={{
              padding: "12px",
              cursor: "pointer",
              borderBottom: "1px solid #f0f0f0",
              backgroundColor: id === room._id ? "#f9f9f9" : "transparent",
            }}
          >
            <strong>
              {room.name} ({room.participants?.length || 0})
            </strong>
            <div style={{ fontSize: "14px", color: "#555" }}>
              {room.lastMessage?.content || "메시지가 없습니다."}
            </div>
          </div>
        ))}
      </div>

      {/* 오른쪽: 채팅방 상세 */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {id ? (
          <>
            {/* 🔹 채팅방 제목 */}
            <div
              style={{
                borderBottom: "1px solid #ddd",
                padding: "12px",
                fontWeight: "bold",
              }}
            >
              {currentRoom?.name} ({currentRoom?.participants?.length || 0})
            </div>

            {/* 🔹 채팅 내역 */}
            <div style={{ flex: 1, padding: "16px", overflowY: "auto" }}>
              {messages.map((msg) => {
                const isMine = msg.author?._id === currentUser?._id;
                return (
                  <div
                    key={msg._id}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: isMine ? "flex-end" : "flex-start",
                      marginBottom: "12px",
                    }}
                  >
                    {/* 이름 + 시간 */}
                    <div style={{ fontSize: "12px", color: "#666" }}>
                      {!isMine && msg.author?.username}{" "}
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </div>
                    {/* 메시지 내용 */}
                    <div
                      style={{
                        maxWidth: "60%",
                        padding: "8px 12px",
                        borderRadius: "12px",
                        background: isMine ? "#DCF8C6" : "#F1F1F1",
                      }}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 🔹 입력창 */}
            <div style={{ borderTop: "1px solid #ddd", padding: "8px" }}>
              <input
                ref={inputRef}
                type="text"
                placeholder="메시지를 입력하세요..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                style={{ width: "80%", padding: "8px" }}
              />
              <button
                onClick={handleSend}
                style={{ padding: "8px 12px", marginLeft: "8px" }}
              >
                전송
              </button>
            </div>
          </>
        ) : (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#888",
            }}
          >
            채팅방을 선택해주세요.
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
