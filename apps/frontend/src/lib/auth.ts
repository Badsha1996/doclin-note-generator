export function setUserInfo(user: {
  email: string;
  role: string;
  username: string;
}) {
  localStorage.setItem("user", JSON.stringify(user));
}

export function getUserInfo(): {
  email: string;
  role: string;
  username: string;
} | null {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

export function clearUserInfo() {
  localStorage.removeItem("user");
}
