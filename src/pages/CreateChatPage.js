import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const CreateChatRoomPage = () => {
  const [name, setName] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const navigate = useNavigate();

  // 🔹 참가자 목록 불러오기
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("https://api.work-order.org/v1/users", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("❌ 유저 목록 불러오기 실패:", err);
      }
    };
    fetchUsers();
  }, []);

  // 🔹 체크박스로 참가자 선택
  const toggleUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  // 🔹 채팅방 생성
  const handleCreate = async () => {
    if (!name.trim()) return alert("채팅방 이름을 입력하세요.");
    if (selectedUsers.length === 0) return alert("참가자를 선택하세요.");

    try {
      const res = await fetch("https://api.work-order.org/v1/chat-rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          name,
          participants: selectedUsers,
        }),
      });

      if (!res.ok) throw new Error("채팅방 생성 실패");

      const newRoom = await res.json();
      navigate(`/chat/${newRoom._id}`);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <div
        style={{
          width: "400px",
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          background: "#fff",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "16px" }}>
          채팅방 만들기
        </h2>

        {/* 채팅방 이름 입력 */}
        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "6px" }}>
            채팅방 이름
          </label>
          <input
            type="text"
            placeholder="채팅방 이름 입력"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        {/* 참가자 선택 */}
        <div
          style={{
            marginBottom: "16px",
            maxHeight: "200px",
            overflowY: "auto",
          }}
        >
          <label style={{ display: "block", marginBottom: "6px" }}>
            참가자 선택
          </label>
          {users.map((user) => (
            <div key={user._id}>
              <label>
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user._id)}
                  onChange={() => toggleUser(user._id)}
                  style={{ marginRight: "6px" }}
                />
                {user.username} ({user.name})
              </label>
            </div>
          ))}
        </div>

        {/* 버튼 */}
        <div style={{ textAlign: "center" }}>
          <button
            onClick={handleCreate}
            style={{
              padding: "10px 16px",
              background: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            생성
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateChatRoomPage;
