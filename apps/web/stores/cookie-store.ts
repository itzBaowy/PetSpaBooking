import { getCookie, removeCookie, setCookie } from "typescript-cookie";
import { StateStorage } from "zustand/middleware";

const createCookieStorage = (): StateStorage => ({
  getItem: (name: string) => {
    return getCookie(name) ?? null;
  },
  setItem: (name: string, value: string) => {
    setCookie(name, value, {
      secure: true,
      sameSite: "strict",
      path: "/",
    });
  },
  removeItem: (name: string) => {
    removeCookie(name);
  },
});
export { createCookieStorage };
