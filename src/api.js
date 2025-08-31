const API_BASE_URL = "https://api.work-order.org/v1"; // 실제 배포된 백엔드 주소

// 회원가입 요청
export async function signup(username, password, name, position) {
  const res = await fetch(`${API_BASE_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, name, position }),
  });
  if (!res.ok) {
    // 서버에서 내려주는 에러 메시지를 추출
    let errorMessage = "회원가입 실패";
    try {
      const errorData = await res.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch (e) {
      // JSON이 아닐 경우 텍스트라도 읽어보기
      const errorText = await res.text();
      if (errorText) errorMessage = errorText;
    }
    throw new Error(errorMessage);
  }

  return res.json();
}

// 로그인 요청
export async function login(username, password) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    // 서버에서 내려주는 에러 메시지를 추출
    let errorMessage = "회원가입 실패";
    try {
      const errorData = await res.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch (e) {
      // JSON이 아닐 경우 텍스트라도 읽어보기
      const errorText = await res.text();
      if (errorText) errorMessage = errorText;
    }
    throw new Error(errorMessage);
  }

  return res.json();
}

// 모든 게시글(공지사항 + 작업들) 가져오기
export async function getPosts() {
  const res = await fetch(`${API_BASE_URL}/posts`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  if (!res.ok) throw new Error("게시글 불러오기 실패");
  return res.json();
}

export async function getUserById(userId) {
  const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  if (!res.ok) throw new Error("사용자 정보 불러오기 실패");
  return res.json();
}

// 게시글 작성
export async function createPost({ title, category, importance, content }) {
  const res = await fetch(`${API_BASE_URL}/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ title, category, importance, content }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || "글쓰기 실패");
  }
  return res.json();
}

// 파일 업로드 (별도 엔드포인트)
export async function uploadFiles(files) {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  const res = await fetch(`${API_BASE_URL}/uploads/documents`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || "파일 업로드 실패");
  }
  return res.json(); // 업로드된 파일 URL 또는 키 반환
}
