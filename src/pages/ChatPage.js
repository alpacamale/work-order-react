import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

const ChatPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [chatRooms, setChatRooms] = useState([]);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [input, setInput] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const inputRef = useRef();

  const currentUser = JSON.parse(localStorage.getItem("user"));

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

  // 🔹 유저 목록 (멘션 자동완성용)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("https://api.work-order.org/v1/users", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("❌ 유저 목록 불러오기 실패:", err);
      }
    };
    fetchUsers();
  }, []);

  // 🔹 메시지 불러오기
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

  // 🔹 입력 변경 시 멘션 후보 띄우기
  const handleChange = (e) => {
    const val = e.target.value;
    setInput(val);

    const match = val.match(/@(\w*)$/); // 마지막 단어가 @로 시작하면
    if (match) {
      const keyword = match[1].toLowerCase();
      const filtered = users.filter((u) =>
        u.username.toLowerCase().startsWith(keyword)
      );
      setFilteredUsers(filtered);
      setShowMentions(true);
    } else {
      setShowMentions(false);
    }
  };

  // 🔹 멘션 선택
  const handleSelectUser = (username) => {
    const newText = input.replace(/@\w*$/, `@${username} `);
    setInput(newText);
    setShowMentions(false);
    inputRef.current.focus();
  };

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

            {/* 입력창 */}
            <div
              style={{
                borderTop: "1px solid #ddd",
                padding: "8px",
                position: "relative",
              }}
            >
              <input
                ref={inputRef}
                type="text"
                placeholder="@username 메시지 입력..."
                value={input}
                onChange={handleChange}
                style={{ width: "80%", padding: "8px" }}
              />
              <button
                onClick={handleSend}
                style={{ padding: "8px 12px", marginLeft: "8px" }}
              >
                전송
              </button>

              {/* 멘션 자동완성 드롭다운 */}
              {showMentions && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "50px",
                    left: "10px",
                    width: "200px",
                    background: "white",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    maxHeight: "150px",
                    overflowY: "auto",
                    zIndex: 100,
                  }}
                >
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <div
                        key={user._id}
                        onClick={() => handleSelectUser(user.username)}
                        style={{
                          padding: "8px",
                          cursor: "pointer",
                          borderBottom: "1px solid #eee",
                        }}
                      >
                        @{user.username} ({user.name})
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: "8px", color: "#888" }}>
                      일치하는 유저 없음
                    </div>
                  )}
                </div>
              )}
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
