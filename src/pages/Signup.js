import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../api";

function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await signup(username, password, name, position);
      alert("✅ 회원가입 성공! 로그인 페이지로 이동합니다.");
      navigate("/login"); // 로그인 페이지로 이동
    } catch (err) {
      setMessage("❌ 회원가입 실패: " + err.message);
    }
  };

  return (
    <div style={styles.container}>
      <h2>회원가입</h2>
      <form onSubmit={handleSignup} style={styles.form}>
        <input
          type="text"
          placeholder="아이디"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={styles.input}
          required
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          required
        />
        <input
          type="name"
          placeholder="이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={styles.input}
          required
        />
        <input
          type="position"
          placeholder="직책"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          style={styles.input}
          required
        />
        <button type="submit" style={styles.button}>
          회원가입
        </button>
      </form>
      <p>{message}</p>
      <Link to="/login">로그인</Link>
    </div>
  );
}

const styles = {
  container: { maxWidth: "400px", margin: "50px auto", textAlign: "center" },
  form: { display: "flex", flexDirection: "column", gap: "10px" },
  input: { padding: "10px", fontSize: "16px" },
  button: {
    padding: "10px",
    background: "#5C2574",
    color: "white",
    border: "none",
  },
};

export default Signup;
