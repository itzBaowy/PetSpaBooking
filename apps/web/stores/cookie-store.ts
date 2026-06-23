import { getCookie, removeCookie, setCookie } from "typescript-cookie";
import { StateStorage } from "zustand/middleware";

function shouldUseSecureCookie(): boolean {
  return typeof window !== "undefined" && window.location.protocol === "https:";
}

const createCookieStorage = (): StateStorage => ({
  getItem: (name: string) => {
    return getCookie(name) ?? null;
  },
  setItem: (name: string, value: string) => {
    setCookie(name, value, {
      secure: shouldUseSecureCookie(),
      sameSite: "strict",
      path: "/",
    });
  },
  removeItem: (name: string) => {
    removeCookie(name, { path: "/" });
  },
});
export { createCookieStorage };
