const ACCESS_TOKEN_KEY = "token";
const REFRESH_TOKEN_KEY = "refresh_token";

// Save tokens
export function setAuthTokens(accessToken: string, refreshToken?: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

// Get tokens
export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

// Clear tokens (on logout)
export function clearAuthTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

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
