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
