import React, { useState, useEffect } from "react";
import { createPost, uploadFiles } from "../api";
import { useNavigate } from "react-router-dom";

function NewPost() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("공지사항");
  const [importance, setImportance] = useState("Priority");
  const [content, setContent] = useState("");
  const [mentions, setMentions] = useState([]);
  const [users, setUsers] = useState([]);
  const [showMentionBox, setShowMentionBox] = useState(false);
  const [files, setFiles] = useState([]);
  const navigate = useNavigate();

  // 유저 불러오기
  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch("https://api.work-order.org/v1/users", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (res.ok) setUsers(await res.json());
      } catch (err) {
        console.error("유저 목록 불러오기 실패:", err.message);
      }
    }
    fetchUsers();
  }, []);

  // 멘션 처리
  const handleContentChange = (e) => {
    const value = e.target.value;
    setContent(value);
    if (value.endsWith("@")) setShowMentionBox(true);
  };

  const handleMentionSelect = (username) => {
    setContent(content + username + " ");
    setMentions([...mentions, username]);
    setShowMentionBox(false);
  };

  // 파일 선택
  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };

  // 작성
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1) 글 먼저 작성
      const post = await createPost({ title, category, importance, content });

      // 2) 파일이 있다면 따로 업로드
      if (files.length > 0) {
        const uploaded = await uploadFiles(files);
        console.log("업로드된 파일:", uploaded);
        // 필요하다면 업로드된 파일 URL을 /v1/posts/:id/files 로 PATCH해서 연결
      }

      alert("✅ 글이 작성되었습니다.");
      navigate("/board");
    } catch (err) {
      alert("❌ 오류: " + err.message);
    }
  };

  const handleCancel = () => {
    navigate("/board");
  };

  return (
    <div style={styles.container}>
      <h2>글쓰기</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          placeholder="제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={styles.input}
          required
        />

        <div style={styles.field}>
          <label style={styles.label}>카테고리</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={styles.select}
          >
            <option value="공지사항">공지사항</option>
            <option value="새로운 작업">새로운 작업</option>
            <option value="진행중">진행중</option>
            <option value="완료">완료</option>
          </select>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>중요도</label>
          <select
            value={importance}
            onChange={(e) => setImportance(e.target.value)}
            style={styles.select}
          >
            <option value="Urgent">Urgent</option>
            <option value="Priority">Priority</option>
            <option value="Trivial">Trivial</option>
            <option value="Optional">Optional</option>
          </select>
        </div>

        <textarea
          placeholder="내용을 입력하세요 (@멘션 가능)"
          value={content}
          onChange={handleContentChange}
          style={styles.textarea}
          required
        />

        {showMentionBox && (
          <div style={styles.mentionBox}>
            {users.map((u) => (
              <div
                key={u._id}
                style={styles.mentionItem}
                onClick={() => handleMentionSelect(u.username)}
              >
                @{u.username}
              </div>
            ))}
          </div>
        )}

        <input
          type="file"
          multiple
          onChange={handleFileChange}
          style={styles.fileInput}
        />

        <div style={styles.btnGroup}>
          <button type="submit" style={styles.submitBtn}>
            작성
          </button>
          <button type="button" style={styles.cancelBtn} onClick={handleCancel}>
            취소
          </button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  container: { maxWidth: "600px", margin: "30px auto", padding: "20px" },
  form: { display: "flex", flexDirection: "column", gap: "12px" },
  input: { padding: "10px", fontSize: "16px" },
  field: { display: "flex", flexDirection: "column", gap: "4px" },
  label: { fontWeight: "bold", fontSize: "14px" },
  select: { padding: "10px", fontSize: "16px" },
  textarea: { padding: "10px", fontSize: "16px", minHeight: "150px" },
  fileInput: { marginTop: "10px" },
  btnGroup: { display: "flex", gap: "10px" },
  submitBtn: {
    flex: 1,
    padding: "12px",
    background: "#5C2574",
    color: "white",
    border: "none",
  },
  cancelBtn: {
    flex: 1,
    padding: "12px",
    background: "gray",
    color: "white",
    border: "none",
  },
  mentionBox: {
    border: "1px solid #ddd",
    borderRadius: "6px",
    background: "white",
    maxHeight: "150px",
    overflowY: "auto",
  },
  mentionItem: { padding: "8px", cursor: "pointer" },
};

export default NewPost;
