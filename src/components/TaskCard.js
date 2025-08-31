import React, { useState, useEffect } from "react";

function TaskCard({
  _id,
  title,
  content,
  importance = "Priority",
  author,
  createdAt,
  mentions = [], // ✅ Post에 등록된 mentions (populate된 [{_id, username}])
}) {
  const [expanded, setExpanded] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [showMentionBox, setShowMentionBox] = useState(false);

  const importanceColors = {
    Urgent: "red",
    Priority: "orange",
    Trivial: "blue",
    Optional: "gray",
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}.${String(date.getDate()).padStart(2, "0")} ${String(
      date.getHours()
    ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  // 댓글 불러오기
  const fetchComments = async () => {
    try {
      const res = await fetch(
        `https://api.work-order.org/v1/posts/${_id}/comments`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (res.ok) {
        setComments(await res.json());
      }
    } catch (err) {
      console.error("댓글 불러오기 실패:", err.message);
    }
  };

  useEffect(() => {
    if (expanded) fetchComments();
  }, [expanded]);

  // ✅ 댓글 입력값 변경
  const handleCommentChange = (e) => {
    const value = e.target.value;
    setNewComment(value);

    // 마지막 글자가 @이면 멘션 박스 열기
    if (value.endsWith("@")) {
      setShowMentionBox(true);
    }
  };

  // ✅ 멘션 선택
  const handleMentionSelect = (user) => {
    setNewComment((prev) => prev + user.username + " ");
    setShowMentionBox(false);
  };

  // ✅ 댓글 작성
  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await fetch(
        `https://api.work-order.org/v1/posts/${_id}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            content: newComment,
          }),
        }
      );
      if (!res.ok) throw new Error("댓글 등록 실패");

      setNewComment("");
      fetchComments();
    } catch (err) {
      alert("❌ " + err.message);
    }
  };

  return (
    <div style={styles.card}>
      {/* 카드 헤더 */}
      <div style={styles.cardHeader}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <h4 style={{ margin: 0 }}>{title}</h4>
          <span
            style={{
              background: importanceColors[importance] || "black",
              color: "white",
              padding: "2px 6px",
              borderRadius: "6px",
              fontSize: "12px",
            }}
          >
            {importance}
          </span>
        </div>
        <button onClick={() => setExpanded(!expanded)} style={styles.toggleBtn}>
          {expanded ? "줄이기" : "늘리기"}
        </button>
      </div>

      {/* 펼쳤을 때 내용 */}
      {expanded && (
        <div style={styles.cardBody}>
          <p style={styles.meta}>
            작업지시자: <b>{author?.name || "알 수 없음"}</b> &nbsp; | &nbsp;
            지시일: {createdAt ? formatDate(createdAt) : "N/A"}
          </p>
          <p style={{ ...styles.content, whiteSpace: "pre-line" }}>{content}</p>

          {/* 댓글 목록 */}
          <div style={styles.comments}>
            <h4>댓글</h4>
            {comments.length > 0 ? (
              comments.map((c) => (
                <div key={c._id} style={styles.commentItem}>
                  <div style={styles.commentHeader}>
                    <b>{c.author?.name || "익명"}</b>
                    <span style={styles.commentDate}>
                      {c.createdAt ? formatDate(c.createdAt) : ""}
                    </span>
                  </div>
                  <p
                    style={{ ...styles.commentContent, whiteSpace: "pre-line" }}
                  >
                    {c.content}
                  </p>
                </div>
              ))
            ) : (
              <p style={{ fontSize: "14px", color: "gray" }}>
                댓글이 없습니다.
              </p>
            )}

            {/* ✅ 댓글 입력창 */}
            <div style={{ position: "relative" }}>
              <div style={styles.commentForm}>
                <textarea
                  placeholder="댓글을 입력하세요... (@멘션 가능)"
                  value={newComment}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNewComment(value);

                    // 마지막 글자가 @ 이면 멘션 박스 오픈
                    if (value.endsWith("@")) {
                      setShowMentionBox(true);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault(); // 줄바꿈 막고 등록 실행
                      handleCommentSubmit();
                    }
                  }}
                  style={styles.commentInput}
                  rows={2}
                />
                <button onClick={handleCommentSubmit} style={styles.commentBtn}>
                  등록
                </button>
              </div>

              {/* ✅ 멘션 후보 박스 */}
              {showMentionBox && (
                <div style={styles.mentionBox}>
                  {mentions.length > 0 ? (
                    mentions.map((u) => (
                      <div
                        key={u._id}
                        style={styles.mentionItem}
                        onClick={() => handleMentionSelect(u)}
                      >
                        @{u.username}
                      </div>
                    ))
                  ) : (
                    <div style={styles.mentionItem}>
                      멘션할 수 있는 유저 없음
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
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
  comments: { borderTop: "1px solid #eee", paddingTop: "10px" },
  commentItem: { marginBottom: "10px" },
  commentHeader: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "14px",
  },
  commentDate: { fontSize: "12px", color: "gray" },
  commentContent: { margin: 0, fontSize: "14px" },
  commentForm: { display: "flex", gap: "8px", marginTop: "10px" },
  commentInput: {
    flex: 1,
    padding: "6px",
    fontSize: "14px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    resize: "none", // 크기조절 막기
    lineHeight: "1.4",
  },
  commentBtn: {
    padding: "6px 12px",
    background: "#5C2574",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  mentionBox: {
    position: "absolute",
    bottom: "45px",
    left: 0,
    background: "white",
    border: "1px solid #ccc",
    borderRadius: "4px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
    width: "200px",
    maxHeight: "150px",
    overflowY: "auto",
    zIndex: 10,
  },
  mentionItem: {
    padding: "6px 10px",
    cursor: "pointer",
    borderBottom: "1px solid #eee",
  },
};

export default TaskCard;
