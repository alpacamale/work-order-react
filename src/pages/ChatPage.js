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
  const [showParticipants, setShowParticipants] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const inputRef = useRef();

  const currentUser = JSON.parse(localStorage.getItem("user"));

  // ✅ 화면 크기 감지
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  // 🔹 유저 목록
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

  // 🔹 입력 변경 시 멘션 후보
  const handleChange = (e) => {
    const val = e.target.value;
    setInput(val);

    const match = val.match(/@(\w*)$/);
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

  const currentRoom = chatRooms.find((r) => r._id === id);

  return (
    <div style={{ display: "flex", height: "calc(100vh - 77px)" }}>
      {/* ================= 모바일 ================= */}
      {isMobile ? (
        <>
          {/* 방 선택 안 했을 때 → 목록만 */}
          {!id && (
            <div
              style={{
                flex: 1,
                borderRight: "1px solid #ddd",
                overflowY: "auto",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px",
                  borderBottom: "1px solid #ddd",
                }}
              >
                <h3 style={{ margin: 0 }}>채팅</h3>
                <button
                  onClick={() => navigate("/chat/new")}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "20px",
                    cursor: "pointer",
                  }}
                >
                  ＋
                </button>
              </div>

              {chatRooms.map((room) => (
                <div
                  key={room._id}
                  onClick={() => navigate(`/chat/${room._id}`)}
                  style={{
                    padding: "12px",
                    cursor: "pointer",
                    borderBottom: "1px solid #f0f0f0",
                    backgroundColor:
                      id === room._id ? "#f9f9f9" : "transparent",
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
          )}

          {/* 방 선택했을 때 → 채팅 화면만 */}
          {id && (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                position: "relative",
              }}
            >
              {/* ← 목록으로 */}
              <div
                style={{
                  borderBottom: "1px solid #ddd",
                  padding: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <button
                  onClick={() => navigate("/chat")}
                  style={{
                    background: "none",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    padding: "4px 8px",
                    cursor: "pointer",
                  }}
                >
                  ←
                </button>
                <span style={{ fontWeight: "bold" }}>
                  {currentRoom?.name} ({currentRoom?.participants?.length || 0})
                </span>
                <button
                  onClick={() => setShowParticipants((prev) => !prev)}
                  style={{
                    marginLeft: "auto",
                    fontSize: "18px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  ☰
                </button>
              </div>

              {/* 채팅 내역 */}
              <div style={{ flex: 1, padding: "16px", overflowY: "auto" }}>
                {messages.map((msg) => {
                  const myId = currentUser?._id || currentUser?.id;
                  const senderId =
                    typeof msg.sender === "string"
                      ? msg.sender
                      : msg.sender?._id;
                  const isMine = String(senderId) === String(myId);

                  return isMine ? (
                    <div
                      key={msg._id}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        marginBottom: "12px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#666",
                          marginBottom: "4px",
                        }}
                      >
                        {msg.createdAt &&
                          new Date(msg.createdAt).toLocaleTimeString()}
                      </div>
                      <div
                        style={{
                          maxWidth: "60%",
                          padding: "8px 12px",
                          borderRadius: "12px",
                          background: "#DCF8C6",
                        }}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ) : (
                    <div
                      key={msg._id}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        marginBottom: "12px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#666",
                          marginBottom: "4px",
                        }}
                      >
                        {msg.sender?.username} ({msg.sender?.name}){" "}
                        {msg.createdAt &&
                          new Date(msg.createdAt).toLocaleTimeString()}
                      </div>
                      <div
                        style={{
                          maxWidth: "60%",
                          padding: "8px 12px",
                          borderRadius: "12px",
                          background: "#F1F1F1",
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
                <textarea
                  ref={inputRef}
                  rows={2}
                  placeholder="@username 메시지 입력..."
                  value={input}
                  onChange={handleChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  style={{ width: "80%", padding: "8px", resize: "none" }}
                />
                <button
                  onClick={handleSend}
                  style={{
                    padding: "8px 12px",
                    marginLeft: "8px",
                    verticalAlign: "top",
                  }}
                >
                  전송
                </button>

                {/* 멘션 자동완성 */}
                {showMentions && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: "60px",
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

              {/* 참가자 패널 */}
              {showParticipants && (
                <div
                  style={{
                    position: "absolute",
                    top: "50px",
                    right: "10px",
                    width: "250px",
                    background: "#fff",
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                    zIndex: 200,
                  }}
                >
                  <h4
                    style={{
                      margin: 0,
                      padding: "8px",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    참가자 목록
                  </h4>
                  <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                    {currentRoom?.participants?.map((p) => (
                      <div
                        key={p._id}
                        style={{
                          padding: "8px",
                          borderBottom: "1px solid #f5f5f5",
                        }}
                      >
                        @{p.username} ({p.name})
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        /* ================= 데스크탑 ================= */
        <>
          {/* 🔹 왼쪽 - 채팅방 목록 */}
          <div
            style={{
              width: "280px",
              borderRight: "1px solid #ddd",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px",
                borderBottom: "1px solid #ddd",
              }}
            >
              <h3 style={{ margin: 0 }}>채팅</h3>
              <button
                onClick={() => navigate("/chat/new")}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "20px",
                  cursor: "pointer",
                }}
              >
                ＋
              </button>
            </div>

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

          {/* 🔹 오른쪽 - 채팅방 상세 */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              position: "relative",
            }}
          >
            {id ? (
              <>
                {/* 제목줄 */}
                <div
                  style={{
                    borderBottom: "1px solid #ddd",
                    padding: "12px",
                    fontWeight: "bold",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>
                    {currentRoom?.name} (
                    {currentRoom?.participants?.length || 0})
                  </span>
                  <button
                    onClick={() => setShowParticipants((prev) => !prev)}
                    style={{
                      fontSize: "18px",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    ☰
                  </button>
                </div>

                {/* 채팅 내역 */}
                <div style={{ flex: 1, padding: "16px", overflowY: "auto" }}>
                  {messages.map((msg) => {
                    const myId = currentUser?._id || currentUser?.id;
                    const senderId =
                      typeof msg.sender === "string"
                        ? msg.sender
                        : msg.sender?._id;
                    const isMine = String(senderId) === String(myId);

                    return isMine ? (
                      <div
                        key={msg._id}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-end",
                          marginBottom: "12px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#666",
                            marginBottom: "4px",
                          }}
                        >
                          {msg.createdAt &&
                            new Date(msg.createdAt).toLocaleTimeString()}
                        </div>
                        <div
                          style={{
                            maxWidth: "60%",
                            padding: "8px 12px",
                            borderRadius: "12px",
                            background: "#DCF8C6",
                          }}
                        >
                          {msg.text}
                        </div>
                      </div>
                    ) : (
                      <div
                        key={msg._id}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                          marginBottom: "12px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#666",
                            marginBottom: "4px",
                          }}
                        >
                          {msg.sender?.username} ({msg.sender?.name}){" "}
                          {msg.createdAt &&
                            new Date(msg.createdAt).toLocaleTimeString()}
                        </div>
                        <div
                          style={{
                            maxWidth: "60%",
                            padding: "8px 12px",
                            borderRadius: "12px",
                            background: "#F1F1F1",
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
                  <textarea
                    ref={inputRef}
                    rows={2}
                    placeholder="@username 메시지 입력..."
                    value={input}
                    onChange={handleChange}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    style={{ width: "80%", padding: "8px", resize: "none" }}
                  />
                  <button
                    onClick={handleSend}
                    style={{
                      padding: "8px 12px",
                      marginLeft: "8px",
                      verticalAlign: "top",
                    }}
                  >
                    전송
                  </button>

                  {/* 멘션 자동완성 */}
                  {showMentions && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: "60px",
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

                {/* 참가자 패널 */}
                {showParticipants && (
                  <div
                    style={{
                      position: "absolute",
                      top: "50px",
                      right: "10px",
                      width: "250px",
                      background: "#fff",
                      border: "1px solid #ccc",
                      borderRadius: "8px",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                      zIndex: 200,
                    }}
                  >
                    <h4
                      style={{
                        margin: 0,
                        padding: "8px",
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      참가자 목록
                    </h4>
                    <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                      {currentRoom?.participants?.map((p) => (
                        <div
                          key={p._id}
                          style={{
                            padding: "8px",
                            borderBottom: "1px solid #f5f5f5",
                          }}
                        >
                          @{p.username} ({p.name})
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
        </>
      )}
    </div>
  );
};

export default ChatPage;
