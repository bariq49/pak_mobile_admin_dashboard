import Cookies from "js-cookie";

// Get auth token safely (handles SSR)
export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return Cookies.get("auth_token") || null;
};

// Optional helpers for login/logout
export const setToken = (token: string) => {
  Cookies.set("auth_token", token, { expires: 7 }); // 7 days
};

export const removeToken = () => {
  Cookies.remove("auth_token");
};
