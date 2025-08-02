import { createCookieSessionStorage } from "react-router";
import { Theme, isTheme, isThemeColor, ThemeColor } from "./theme-provider";

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}

export const config = { runtime: "edge" };

const themeStorage = createCookieSessionStorage({
  cookie: {
    name: "bussola_theme",
    secure: true,
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    httpOnly: true,
  },
});

async function getThemeSession(request: Request) {
  const session = await themeStorage.getSession(request.headers.get("Cookie"));
  return {
    getTheme: () => {
      const themeValue = session.get("theme");
      return isTheme(themeValue) ? themeValue : null;
    },
    getThemeColor: () => {
      const themeColorValue = session.get("theme-color");
      return isThemeColor(themeColorValue) ? themeColorValue : null;
    },
    setTheme: (theme: Theme) => session.set("theme", theme),
    setThemeColor: (themeColor: ThemeColor) =>
      session.set("theme-color", themeColor),
    commit: () => themeStorage.commitSession(session),
  };
}

export { getThemeSession };
