import { css } from "../../system.ts";

import type { ReactNode } from "react";

/** Props for {@link TweakSection}. */
interface TweakSectionProps {
  /** Section title/label. */
  label: string;
  /** Section content. */
  children?: ReactNode;
}

/**
 * Labeled grouping container for tweak controls.
 * Renders a section header with dividing line and children stacked below.
 *
 * @example
 * ```tsx
 * <TweakSection label="Appearance">
 *   <TweakToggle label="Dark mode" value={dark} onChange={setDark} />
 * </TweakSection>
 * ```
 */
export function TweakSection(
  { label, children }: TweakSectionProps,
): ReactNode {
  return (
    <section className={root} data-part="section">
      <h3 className={header}>{label}</h3>
      {children && <div className={content}>{children}</div>}
    </section>
  );
}

const root = css({
  display: "flex",
  flexDirection: "column",
  gap: "3",
  paddingTop: "3",
  borderTopWidth: "0.25",
  borderTopStyle: "solid",
  borderTopColor: "border.default",
  _first: {
    paddingTop: 0,
    borderTopWidth: 0,
  },
});

const header = css({
  fontSize: "11",
  fontWeight: 600,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "text.secondary",
  margin: 0,
  marginBottom: "1",
});

const content = css({
  display: "flex",
  flexDirection: "column",
  gap: "2.5",
});
