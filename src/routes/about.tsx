import { css } from "styled-system/css";

const wrap = css({ px: { base: "4", md: "8" }, py: { base: "10", md: "16" }, maxWidth: "44rem", marginX: "auto", width: "100%" });
const title = css({ fontFamily: "heading", fontWeight: "bold", fontSize: "4xl", color: "text.primary", marginBottom: "4" });
const lead = css({ fontSize: "lg", color: "text.primary", lineHeight: "1.5" });
const sectionHead = css({ fontFamily: "heading", fontWeight: "bold", fontSize: "xl", color: "text.primary", marginTop: "10", marginBottom: "2" });
const body = css({ fontSize: "md", color: "text.secondary", lineHeight: "1.6" });
const colophon = css({ display: "flex", flexWrap: "wrap", gap: "2", marginTop: "10", paddingTop: "6", borderTopWidth: "1px", borderTopStyle: "solid", borderColor: "border.default" });
const chip = css({ fontSize: "sm", fontWeight: "bold", color: "text.secondary", bg: "bg.card", borderWidth: "1px", borderStyle: "solid", borderColor: "border.default", borderRadius: "sm", py: "1", px: "3" });

const STACK = ["Lore", "Beam", "React", "Vite"];

export default function About() {
  return (
    <main className={wrap}>
      <h1 className={title}>About</h1>
      <p className={lead}>{"Witness is an in-browser mock of a web forge for the Lore version-control system."}</p>

      <h2 className={sectionHead}>Design</h2>
			<p className={body}>{"Lore is actually surprisingly close to Git, with some exceptions, none of which really impact the developer experience all that much. The big thing is obviously that you don't really have local copies and don't stage or push in the way that you'd come to think from git, which can be good or bad. I do like the support of nice, large files without afterthoughts like Git LFS, but I feel like it's not for me."}</p>
			<p className={body}>{"Beam as a library is... fine. World's okayest library. I liked it at first, a lot especially, the font in specific really reminded me of classic 2013-style Silicon Valley, but that's come and gone. I really don't think it's that great for UI work, and the colour palette is pretty restrictive."}</p>

      <div className={colophon}>
        {STACK.map((name) => <span key={name} className={chip}>{name}</span>)}
      </div>
    </main>
  );
}
