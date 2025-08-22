import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import { useFetcher } from "react-router";

enum Theme {
  DARK = "dark",
  LIGHT = "light",
}

enum ThemeColor {
  INDIGO = "indigo",
  LIME = "lime",
  FUCHSIA = "fuchsia",
  CARMINE = "carmine",
}

type ThemeContextType = [Theme | null, Dispatch<SetStateAction<Theme | null>>];

const prefersDarkMQ = "(prefers-color-scheme: dark)";

const getPreferredTheme = () =>
  window.matchMedia(prefersDarkMQ).matches ? Theme.DARK : Theme.LIGHT;

const clientThemeCode = `
;(() => {
  const theme = window.matchMedia(${JSON.stringify(prefersDarkMQ)}).matches
    ? 'dark'
    : 'light';
  const cl = document.documentElement.classList;
  const themeAlreadyApplied = cl.contains('light') || cl.contains('dark');
  if (themeAlreadyApplied) {
    // this script shouldn't exist if the theme is already applied!
    console.warn(
      "Hi there, could you let Matt know you're seeing this message? Thanks!",
    );
  } else {
    cl.add(theme);
  }
})();
`;

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function ThemeProvider({
  children,
  specifyedTheme,
}: {
  children: ReactNode;
  specifyedTheme: Theme | null;
}) {
  const [theme, setTheme] = useState<Theme | null>(() => {
    if (specifyedTheme) {
      if (themes.includes(specifyedTheme)) {
        return specifyedTheme;
      } else {
        return null;
      }
    }

    if (typeof window !== "object") {
      return null;
    }

    return getPreferredTheme();
  });

  const [themeColor] = useState<ThemeColor | null>(() => {
    if (typeof window !== "object") {
      return null;
    }

    return ThemeColor.LIME;
  });

  const persistTheme = useFetcher();

  const persistThemeRef = useRef(persistTheme);
  useEffect(() => {
    persistThemeRef.current = persistTheme;
  }, [persistTheme]);

  const mountRun = useRef(false);

  useEffect(() => {
    if (!mountRun.current) {
      mountRun.current = true;
      return;
    }
    if (!theme || !themeColor) {
      return;
    }

    persistThemeRef.current.submit(
      { theme, themeColor },
      { action: "/set-theme", method: "post" },
    );
  }, [theme, themeColor]);

  return (
    <ThemeContext.Provider value={[theme, setTheme]}>
      {children}
    </ThemeContext.Provider>
  );
}

function useTheme() {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

function NonFlashOfWrongThemeEls({ ssrTheme }: { ssrTheme: boolean }) {
  return (
    <>
      {ssrTheme ? null : (
        <script dangerouslySetInnerHTML={{ __html: clientThemeCode }} />
      )}
    </>
  );
}

const themes: Array<Theme> = Object.values(Theme);
const themeColors: Array<ThemeColor> = Object.values(ThemeColor);

function isTheme(value: unknown): value is Theme {
  return typeof value === "string" && themes.includes(value as Theme);
}

function isThemeColor(value: unknown): value is ThemeColor {
  return typeof value === "string" && themeColors.includes(value as ThemeColor);
}

export {
  isTheme,
  isThemeColor,
  NonFlashOfWrongThemeEls,
  Theme,
  ThemeColor,
  ThemeProvider,
  useTheme,
};

// export { NonFlashOfWrongThemeEls, Theme, ThemeProvider, useTheme };
