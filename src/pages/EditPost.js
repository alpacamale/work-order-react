import React, { useState, useEffect } from "react";
import { updatePost, uploadFiles } from "../api";
import { useParams, useNavigate } from "react-router-dom";

function EditPost() {
  const [users, setUsers] = useState([]);
  const [showMentionBox, setShowMentionBox] = useState(false);
  const [files, setFiles] = useState([]);
  const [post, setPost] = useState(null);
  const { id } = useParams();
  const naviate = useNavigate();

  // ✅ 유저 목록 불러오기
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

  useEffect(() => {
    if (!id) return;
    fetch(`https://api.work-order.org/v1/posts/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => setPost(data))
      .catch((err) => console.error("글 불러오기 실패:", err.message));
  }, [id]);

  // ✅ 파일 선택
  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };

  // ✅ 작성
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const newPost = {
      title: formData.get("title"),
      category: formData.get("category"),
      importance: formData.get("importance"),
      content: formData.get("content"),
    };

    try {
      // 1) 글 먼저 작성
      const post = await updatePost(id, newPost);

      // 2) 파일 업로드
      if (files.length > 0) {
        const uploaded = await uploadFiles(files);
        console.log("업로드된 파일:", uploaded);
      }

      alert("✅ 글이 작성되었습니다.");
      window.location.href = "/board";
    } catch (err) {
      alert("❌ 오류: " + err.message);
    }
  };

  const handleCancel = () => {
    window.location.href = "/board";
  };

  if (!post) return <strong>Loading ...</strong>;
  return (
    <div style={styles.container}>
      <h2>글 수정</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          name="title"
          placeholder="제목"
          style={styles.input}
          defaultValue={post.title}
          required
        />

        <div style={styles.field}>
          <label style={styles.label}>카테고리</label>
          <select
            name="category"
            defaultValue={post.category}
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
            name="importance"
            defaultValue={post.importance}
            style={styles.select}
          >
            <option value="Urgent">Urgent</option>
            <option value="Priority">Priority</option>
            <option value="Trivial">Trivial</option>
            <option value="Optional">Optional</option>
          </select>
        </div>

        <textarea
          name="content"
          placeholder="내용을 입력하세요 (@멘션 가능)"
          style={styles.textarea}
          defaultValue={post.content}
          required
          onChange={(e) => {
            if (e.target.value.endsWith("@")) setShowMentionBox(true);
          }}
        />

        {showMentionBox && (
          <div style={styles.mentionBox}>
            {users.map((u) => (
              <div
                key={u._id}
                style={styles.mentionItem}
                onClick={() => {
                  const textarea = document.querySelector(
                    "textarea[name=content]"
                  );
                  textarea.value = textarea.value + u.username + " ";
                  setShowMentionBox(false);
                }}
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
            수정
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

export default EditPost;
