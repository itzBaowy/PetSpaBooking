export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

export function setToken(token: string): void {
  localStorage.setItem("accessToken", token);
}

export function removeToken(): void {
  localStorage.removeItem("accessToken");
}

export function isAuthenticated(): boolean {
  return getToken() !== null;
}
