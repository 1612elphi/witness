import { css, cx } from "../../system.ts";

import { type ReactNode, useEffect } from "react";
import { Icon } from "./icon.tsx";

/** Toast notification style variant. */
type ToastVariant = "success" | "error" | "info";

/** Props for {@link Toast}. */
export interface ToastProps {
  /** Message text displayed in the toast. */
  message: string;
  /** Visual variant. Defaults to `"info"`. */
  variant?: ToastVariant;
  /** Whether the toast is visible. Controls slide-in/out animation. */
  visible: boolean;
  /** Called when the user clicks the close button or auto-dismiss timer expires (4.5s). */
  onDismiss?: () => void;
  /** Called when the toast becomes visible. */
  onShow?: () => void;
}

/**
 * Fixed-position toast notification with auto-dismiss and manual close.
 * Positioned bottom-right; auto-hides after 4.5 seconds if `onDismiss` is provided.
 * Fires `onShow` when toast becomes visible and `onDismiss` on timer or close click.
 *
 * @example
 * ```tsx
 * const [visible, setVisible] = useState(false);
 * <Toast
 *   message="Changes saved"
 *   variant="success"
 *   visible={visible}
 *   onDismiss={() => setVisible(false)}
 * />
 * ```
 */
export function Toast({
  message,
  variant = "info",
  visible,
  onDismiss,
  onShow,
}: ToastProps): ReactNode {
  useEffect(() => {
    if (visible && onShow) onShow();
  }, [visible, onShow]);

  useEffect(() => {
    if (!visible || !onDismiss) return;
    const timer = setTimeout(onDismiss, 4500);
    return () => clearTimeout(timer);
  }, [visible, onDismiss]);

  return (
    <div
      className={cx(
        wrapper,
        borderVariants[variant],
        visible ? visibleStyle : hiddenStyle,
      )}
      role={variant === "error" ? "alert" : "status"}
      aria-live={variant === "error" ? "assertive" : "polite"}
      aria-atomic="true"
    >
      <span className={messageStyle}>{message}</span>
      {onDismiss && (
        <button
          className={closeBtn}
          onClick={onDismiss}
          type="button"
          aria-label="Close notification"
        >
          <Icon name="close" size={16} />
        </button>
      )}
    </div>
  );
}

const wrapper = css({
  position: "fixed",
  bottom: "6",
  right: "6",
  display: "flex",
  alignItems: "center",
  gap: "3",
  paddingBlock: "3",
  paddingInline: "4",
  backgroundColor: "bg.card",
  shadow: "golden",
  borderLeftWidth: "0.75",
  borderLeftStyle: "solid",
  zIndex: 200,
  maxWidth: "90",
  transition: "all 0.3s ease",
});

const visibleStyle = css({
  opacity: 1,
  transform: "translateX(0)",
});

const hiddenStyle = css({
  opacity: 0,
  transform: "translateX(100%)",
  pointerEvents: "none",
});

const borderVariants: Record<ToastVariant, string> = {
  success: css({
    borderLeftColor: "sunshine.700",
  }),
  error: css({
    borderLeftColor: "sunbeam.orange",
  }),
  info: css({
    borderLeftColor: "sunshine.300",
  }),
};

const messageStyle = css({
  fontSize: "sm",
  fontFamily: "body",
  color: "text.primary",
  flex: 1,
});

const closeBtn = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "text.secondary",
  padding: "0.5",
  flexShrink: 0,
  _hover: {
    color: "sunbeam.orange",
  },
});
