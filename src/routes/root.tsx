import { isRouteErrorResponse, Link, Outlet, useRouteError } from "react-router";
import { Avatar, Button, Icon, useTheme } from "@sunbeam/beam-ui";
import { css } from "styled-system/css";
import loreRaw from "../assets/lore-wordmark.svg?raw";

// Recolor the monochrome Lore wordmark to currentColor so it follows the theme.
const loreWordmark = loreRaw.replaceAll("#020202", "currentColor");

const shell = css({
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  bg: "bg.page",
  color: "text.primary",
});

const header = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "4",
  px: { base: "4", md: "8" },
  py: "3",
  bg: "bg.card",
  borderBottomWidth: "1px",
  borderBottomStyle: "solid",
  borderColor: "border.default",
  position: "sticky",
  top: "0",
  zIndex: 10,
});

const brand = css({ display: "flex", alignItems: "center", gap: "3", textDecoration: "none" });
const mark = css({ width: { base: "52px", md: "64px" }, height: "5", marginLeft: { base: "-4", md: "-8" }, bgGradient: "to-r", gradientFrom: "sunbeam.orange", gradientTo: "beam.orange", flexShrink: 0 });
const wordmark = css({
  fontFamily: "heading",
  fontWeight: "bold",
  fontSize: "2xl",
  color: "text.primary",
  letterSpacing: "-0.01em",
});
const poweredBy = css({
  fontStyle: "italic",
  fontSize: "sm",
  color: "text.muted",
  display: { base: "none", sm: "inline" },
});
const loreMark = css({
  fontStyle: "normal",
  fontWeight: "bold",
  letterSpacing: "0.12em",
  color: "text.secondary",
});
const loreLogo = css({
  display: "inline-flex",
  alignItems: "center",
  marginLeft: "1.5",
  color: "text.secondary",
  verticalAlign: "middle",
  "& svg": { height: "16px", width: "auto", display: "block" },
});

const actions = css({ display: "flex", alignItems: "center", gap: "2" });
const search = css({
  display: { base: "none", md: "flex" },
  alignItems: "center",
  gap: "2",
  bg: "bg.page",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "border.default",
  borderRadius: "sm",
  px: "3",
  py: "1.5",
  color: "text.muted",
  "& input": {
    border: "none",
    outline: "none",
    bg: "transparent",
    color: "text.primary",
    fontSize: "sm",
    width: "44",
    _placeholder: { color: "text.muted" },
  },
});
const iconButton = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "9",
  height: "9",
  borderRadius: "sm",
  color: "text.secondary",
  cursor: "pointer",
  bg: "transparent",
  border: "none",
  _hover: { bg: "accent.10", color: "sunbeam.orange" },
});

const footer = css({
  marginTop: "auto",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "4",
  px: { base: "4", md: "8" },
  py: "5",
  borderTopWidth: "1px",
  borderTopStyle: "solid",
  borderColor: "border.default",
  fontSize: "sm",
  color: "text.muted",
});
const footerLink = css({ color: "text.secondary", textDecoration: "none", _hover: { color: "sunbeam.orange" } });

const errorPage = css({ px: "8", py: "16", display: "flex", flexDirection: "column", gap: "3" });

function Header() {
  const { theme, toggle } = useTheme();
  return (
    <header className={header}>
      <Link to="/" className={brand} aria-label="Witness home">
        <span className={mark} />
        <span className={wordmark}>Witness</span>
        <span className={poweredBy}>
          powered by
          <span
            className={loreLogo}
            role="img"
            aria-label="Lore"
            dangerouslySetInnerHTML={{ __html: loreWordmark }}
          />
        </span>
      </Link>
      <div className={actions}>
        <label className={search}>
          <Icon name="search" size={18} />
          <input type="search" placeholder="Search" aria-label="Search" />
        </label>
        <button type="button" className={iconButton} onClick={toggle} aria-label="Toggle theme">
          <Icon name={theme === "dark" ? "light_mode" : "dark_mode"} size={20} />
        </button>
        <button type="button" className={iconButton} aria-label="Notifications">
          <Icon name="notifications" size={20} />
        </button>
        <Button as={Link} to="/new" variant="primary">New</Button>
        <Avatar name="Ruby Voigt" size="sm" />
      </div>
    </header>
  );
}

export default function RootLayout() {
  return (
    <div className={shell}>
      <Header />
      <Outlet />
      <footer className={footer}>
        <span>
          <span className={loreMark}>WITNESS</span> · © 2026
        </span>
        <Link to="/about" className={footerLink}>Design notes</Link>
      </footer>
    </div>
  );
}

export function RootError() {
  const error = useRouteError();
  const status = isRouteErrorResponse(error) ? error.status : "Error";
  return (
    <main className={errorPage}>
      <h1 className={css({ fontFamily: "heading", fontSize: "4xl", color: "sunbeam.orange" })}>{status}</h1>
      <p className={css({ color: "text.secondary" })}>That page could not be loaded.</p>
      <Link to="/" className={footerLink}>Home</Link>
    </main>
  );
}
