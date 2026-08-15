import { css } from "../../system.ts";

import type { ReactNode } from "react";
import { footerSections } from "../../data/navigation.ts";
import type { LinkComponent } from "../../utils/polymorphic.ts";

declare const __BUILD_LABEL__: string | undefined;

const footer = css({
  bg: "sunbeam.black",
  borderTopWidth: "1",
  borderTopStyle: "solid",
  borderColor: "sunbeam.orange",
});

const grid = css({
  display: "grid",
  gridTemplateColumns: {
    base: "repeat(2, 1fr)",
    md: "repeat(3, 1fr)",
    lg: "repeat(6, 1fr)",
  },
  gap: "8",
  maxWidth: "360",
  marginInline: "auto",
  paddingInline: { base: "6", md: "12", lg: "12" },
  paddingBlock: "16",
});

const brandCol = css({
  gridColumn: { base: "span 2", md: "span 3", lg: "span 2" },
});

const brandName = css({
  display: "block",
  fontSize: "xl",
  fontFamily: "heading",
  fontWeight: "heading",
  color: "warm.ivory",
  marginBottom: "4",
});

const brandDesc = css({
  fontSize: "sm",
  lineHeight: "1.6",
  color: "ivory.50",
  maxWidth: "80",
});

const copyright = css({
  fontSize: "xs",
  color: "ivory.30",
  marginTop: "4",
});

const buildLabel = css({
  fontFamily: "mono",
  fontSize: "2xs",
  opacity: 0.6,
});

const sectionCol = css({
  display: "flex",
  flexDirection: "column",
  gap: "3",
});

const sectionTitle = css({
  fontSize: "xs",
  fontWeight: "button",
  textTransform: "uppercase",
  letterSpacing: "0.15em",
  color: "sunbeam.orange",
  marginBottom: "1",
});

const sectionLink = css({
  fontSize: "sm",
  color: "ivory.50",
  textDecoration: "none",
  transition: "color 0.2s",
  _hover: {
    color: "sunshine.700",
  },
});

/** Props for {@link Footer}. */
export interface FooterProps {
  /** Component used to render internal links. Defaults to a plain `<a>`. */
  linkAs?: LinkComponent;
}

/**
 * Application footer with multi-column navigation and branding.
 * Consumes {@link footerSections} from navigation data. Shows optional build label if defined.
 * Internal links are rendered with the consumer's link component when `linkAs` is provided.
 *
 * @example
 * ```tsx
 * <Footer />
 * ```
 */
export function Footer({ linkAs }: FooterProps = {}): ReactNode {
  const LinkAs = linkAs ?? DefaultLink;
  return (
    <footer className={footer}>
      <div className={grid}>
        <div className={brandCol}>
          <span className={brandName}>Sunbeam Studios</span>
          <p className={brandDesc}>
            Olá de Portugal. Built for creators.
          </p>
          <p className={copyright}>
            &copy; 2026 Sunbeam Studios
            {typeof __BUILD_LABEL__ !== "undefined" && (
              <span className={buildLabel}>· {__BUILD_LABEL__}</span>
            )}
          </p>
        </div>
        {footerSections.map((section) => (
          <nav
            key={section.title}
            className={sectionCol}
            aria-label={section.title}
          >
            <span className={sectionTitle}>{section.title}</span>
            {section.links.map((link) => {
              const isExternal = link.href.startsWith("http") ||
                link.href.startsWith("mailto:");
              if (isExternal) {
                // Inject build version into mailto subject if present
                const href = link.href.startsWith("mailto:") &&
                    typeof __BUILD_LABEL__ !== "undefined"
                  ? link.href.replace(
                    "Question!",
                    `${__BUILD_LABEL__} Question!`,
                  )
                  : link.href;
                return (
                  <a
                    key={link.label}
                    href={href}
                    className={sectionLink}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  >
                    {link.label}
                  </a>
                );
              }
              return (
                <LinkAs
                  key={link.label}
                  href={link.href}
                  className={sectionLink}
                >
                  {link.label}
                </LinkAs>
              );
            })}
          </nav>
        ))}
      </div>
    </footer>
  );
}

function DefaultLink({
  href,
  children,
  className,
  ...rest
}: {
  href: string;
  children: ReactNode;
  className?: string;
  [key: string]: unknown;
}): ReactNode {
  return (
    <a href={href} className={className} {...rest}>
      {children}
    </a>
  );
}
