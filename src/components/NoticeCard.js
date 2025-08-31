import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function NoticeCard({ _id, title, content, author, createdAt, currentUser }) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}.${String(date.getDate()).padStart(2, "0")} ${String(
      date.getHours()
    ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  return (
    <div style={styles.card}>
      {/* 카드 헤더 */}
      <div style={styles.cardHeader}>
        <h4 style={{ margin: 0 }}>{title}</h4>
        <button onClick={() => setExpanded(!expanded)} style={styles.toggleBtn}>
          {expanded ? "줄이기" : "늘리기"}
        </button>
      </div>

      {/* 펼쳐졌을 때 */}
      {expanded && (
        <div style={styles.cardBody}>
          <div style={styles.metaRow}>
            <span>
              글쓴이: <b>{author?.name || "알 수 없음"}</b>
            </span>
            <span>
              날짜: {createdAt ? formatDate(createdAt) : "N/A"}
              {/* ✅ 글쓴이 본인일 때만 수정 버튼 */}
              {currentUser && currentUser._id === author?._id && (
                <button
                  onClick={() => navigate(`/posts/${_id}/edit`)}
                  style={styles.editBtn}
                >
                  수정
                </button>
              )}
            </span>
          </div>
          <p style={{ ...styles.content, whiteSpace: "pre-line" }}>{content}</p>
        </div>
      )}
    </div>
  );
}

const styles = {
  card: {
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "10px",
    background: "#fff",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  toggleBtn: { fontSize: "12px", padding: "5px", cursor: "pointer" },
  cardBody: { marginTop: "10px" },
  metaRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "14px",
    color: "gray",
    marginBottom: "10px",
  },
  content: { fontSize: "15px", marginBottom: "15px" },
  editBtn: {
    marginLeft: "10px",
    padding: "2px 6px",
    background: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
  },
};

export default NoticeCard;
