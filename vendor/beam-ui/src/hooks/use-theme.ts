import { useCallback, useEffect, useState } from "react";

/** Theme variant: light or dark mode. */
type Theme = "light" | "dark";

const COOKIE_NAME = "sunbeam-theme";
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string) {
  const parts = globalThis.location.hostname.split(".");
  const domain = parts.length >= 2 ? "." + parts.slice(-2).join(".") : globalThis.location.hostname;
  document.cookie = `${name}=${
    encodeURIComponent(value)
  }; path=/; domain=${domain}; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
  localStorage.setItem(name, value);
}

function getInitial(): Theme {
  if (typeof window === "undefined") return "light";
  const fromCookie = getCookie(COOKIE_NAME) as Theme | null;
  if (fromCookie === "light" || fromCookie === "dark") return fromCookie;
  const fromStorage = localStorage.getItem(COOKIE_NAME) as Theme | null;
  if (fromStorage === "light" || fromStorage === "dark") return fromStorage;
  return globalThis.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function readTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const attr = document.documentElement.getAttribute("data-theme") as
    | Theme
    | null;
  if (attr === "light" || attr === "dark") return attr;
  return getInitial();
}

/**
 * Reads and toggles the document theme via the `data-theme` attribute.
 *
 * Persists across subdomains using a cookie + localStorage fallback.
 * Syncs with `data-theme` changes made by other code (e.g. g2v's uiStore).
 */
export function useTheme(): { theme: Theme; toggle: () => void } {
  const [theme, setTheme] = useState<Theme>(readTheme);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(readTheme());
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    const mq = globalThis.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (!document.documentElement.hasAttribute("data-theme")) {
        setTheme(mq.matches ? "dark" : "light");
      }
    };
    mq.addEventListener("change", onChange);

    return () => {
      observer.disconnect();
      mq.removeEventListener("change", onChange);
    };
  }, []);

  const toggle = useCallback(() => {
    const next = theme === "light" ? "dark" : "light";
    setCookie(COOKIE_NAME, next);
    document.documentElement.setAttribute("data-theme", next);
    setTheme(next);
  }, [theme]);

  return { theme, toggle };
}
