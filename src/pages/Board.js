import React, { useState, useEffect } from "react";
import { getPosts, getUserById } from "../api";
import NoticeCard from "../components/NoticeCard";
import TaskCard from "../components/TaskCard";

function Board() {
  const [user, setUser] = useState(null);
  const [notices, setNotices] = useState([]);
  const [tasks, setTasks] = useState({ new: [], progress: [], done: [] });

  useEffect(() => {
    async function fetchData() {
      try {
        const savedUser = localStorage.getItem("user");
        let userData = null;

        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          userData = await getUserById(parsed._id || parsed.id);
          setUser(userData);
        }

        const posts = await getPosts();

        // ✅ 공지사항은 전체 보여주기
        setNotices(posts.filter((p) => p.category === "공지사항"));

        // ✅ 내가 멘션되었거나, 내가 작성한 글만
        const myTasks = userData
          ? posts.filter(
              (p) =>
                p.category !== "공지사항" &&
                (p.author?._id === userData._id || // 내가 쓴 글
                  p.mentions?.some((m) => m._id === userData._id)) // 내가 멘션된 글
            )
          : [];

        setTasks({
          new: myTasks.filter((p) => p.category === "새로운 작업"),
          progress: myTasks.filter((p) => p.category === "진행중"),
          done: myTasks.filter((p) => p.category === "완료"),
        });
      } catch (err) {
        console.error("데이터 불러오기 실패:", err.message);
      }
    }
    fetchData();
  }, []);

  const today = new Date().toISOString().split("T")[0].replace(/-/g, ".");

  return (
    <div style={styles.container}>
      <div style={styles.userInfo}>
        {user ? (
          <h2>
            {user.position} - {user.name}
          </h2>
        ) : (
          <p>사용자 정보를 불러오는 중...</p>
        )}
      </div>

      <div style={styles.subBar}>
        <span style={styles.date}>{today}</span>
        <button
          style={styles.writeBtn}
          onClick={() => (window.location.href = "/posts/new")}
        >
          글쓰기
        </button>
      </div>

      <hr />

      {/* 공지사항 */}
      <div style={{ width: "100%", marginBottom: "20px" }}>
        <h3 style={{ marginBottom: "10px" }}>공지사항</h3>
        {notices.map((n) => (
          <NoticeCard
            key={n._id}
            _id={n._id}
            title={n.title}
            content={n.content}
            author={n.author}
            createdAt={n.createdAt}
            currentUser={user}
          />
        ))}
      </div>

      {/* 칸반 */}
      <div style={styles.kanban}>
        <div style={styles.column}>
          <h3>새로운 작업</h3>
          {tasks.new.map((t) => (
            <TaskCard key={t._id} {...t} currentUser={user} />
          ))}
        </div>
        <div style={styles.column}>
          <h3>진행중</h3>
          {tasks.progress.map((t) => (
            <TaskCard key={t._id} {...t} currentUser={user} />
          ))}
        </div>
        <div style={styles.column}>
          <h3>완료</h3>
          {tasks.done.map((t) => (
            <TaskCard key={t._id} {...t} currentUser={user} />
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { width: "80%", margin: "0 auto", padding: "20px" },
  userInfo: { textAlign: "center", marginBottom: "5px" },
  subBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  date: { fontSize: "16px", color: "gray" },
  writeBtn: {
    padding: "8px 12px",
    background: "#5C2574",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  kanban: { display: "flex", justifyContent: "space-between", gap: "20px" },
  column: { flex: 1, display: "flex", flexDirection: "column", gap: "10px" },
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
};

export default Board;
