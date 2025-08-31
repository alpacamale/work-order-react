import React, { useState } from "react";

function NoticeCard({ title, content, author, createdAt }) {
  const [expanded, setExpanded] = useState(false);

  const formatDate = (dateStr) => {
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
      <div style={styles.cardHeader}>
        <h4 style={{ margin: 0 }}>{title}</h4>
        <button onClick={() => setExpanded(!expanded)} style={styles.toggleBtn}>
          {expanded ? "줄이기" : "늘리기"}
        </button>
      </div>

      {expanded && (
        <div style={styles.cardBody}>
          <p style={styles.meta}>
            글쓴이: <b>{author?.name || "알 수 없음"}</b> &nbsp; | &nbsp; 날짜:{" "}
            {createdAt ? formatDate(createdAt) : "N/A"}
          </p>
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
  meta: { fontSize: "14px", color: "gray", marginBottom: "10px" },
  content: { fontSize: "15px", marginBottom: "15px" },
};

export default NoticeCard;
