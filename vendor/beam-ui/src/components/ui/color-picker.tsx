import { css, cx } from "../../system.ts";

import { type ReactNode, useId, useState } from "react";
import {
  PopoverCloseTrigger,
  PopoverContent,
  PopoverPositioner,
  PopoverRoot,
  PopoverTrigger,
} from "@ark-ui/react/popover";
import { Icon } from "./icon.tsx";

/** Props for {@link ColorPicker}. */
export interface ColorPickerProps {
  /** Current hex color value (e.g., `"#FF5733"`). */
  value: string;
  /** Callback fired when the user selects a color; receives the hex string. */
  onChange: (value: string) => void;
  /** Array of preset hex colors to display in the swatch grid. Defaults to a curated palette. */
  presets?: string[];
  /** Optional label shown above the color picker. */
  label?: string;
  /** Whether the color picker popover is open. Defaults to `false`. */
  open?: boolean;
  /** Called when the open state changes. */
  onOpenChange?: (open: boolean) => void;
  /** Extra CSS class names to apply to the root container. */
  className?: string;
}

const DEFAULT_PRESETS = [
  "#EF4444",
  "#F97316",
  "#F59E0B",
  "#EAB308",
  "#84CC16",
  "#22C55E",
  "#14B8A6",
  "#06B6D4",
  "#3B82F6",
  "#6366F1",
  "#8B5CF6",
  "#A855F7",
  "#D946EF",
  "#EC4899",
  "#F43F5E",
  "#78716C",
  "#DC2626",
  "#EA580C",
  "#D97706",
  "#059669",
];

/**
 * Popover-based color picker with hex input and preset swatches.
 *
 * Displays a trigger button showing the current color; opens a popover with a preset swatch grid,
 * live preview, and manual hex input. Only accepts valid 6-digit hex colors.
 *
 * @example
 * ```tsx
 * <ColorPicker value={color} onChange={setColor} label="Brand Color" />
 * ```
 */
export function ColorPicker({
  value,
  onChange,
  presets = DEFAULT_PRESETS,
  label,
  open,
  onOpenChange,
  className,
}: ColorPickerProps): ReactNode {
  const hexInputId = useId();
  const [hexInput, setHexInput] = useState(value);

  const handleHexChange = (hex: string) => {
    setHexInput(hex);
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      onChange(hex);
    }
  };

  const handleSwatchClick = (color: string) => {
    setHexInput(color);
    onChange(color);
  };

  return (
    <div className={cx(wrapper, className)}>
      {label && <label className={labelStyle}>{label}</label>}
      <PopoverRoot
        positioning={{ placement: "bottom-start" }}
        open={open}
        onOpenChange={(d) => onOpenChange?.(d.open)}
      >
        <PopoverTrigger className={triggerStyle}>
          <span
            className={triggerSwatch}
            style={{ backgroundColor: value }}
            aria-hidden="true"
          />
          <span className={triggerHex}>{value.toUpperCase()}</span>
          <Icon name="expand_more" size={16} />
        </PopoverTrigger>

        <PopoverPositioner>
          <PopoverContent className={contentStyle}>
            <div className={popoverHeader}>
              <span className={popoverTitle}>Choose color</span>
              <PopoverCloseTrigger
                className={closeBtn}
                aria-label="Close color picker"
              >
                <Icon name="close" size={16} />
              </PopoverCloseTrigger>
            </div>

            <div className={previewRow}>
              <span
                className={previewSwatch}
                style={{ backgroundColor: value }}
                aria-hidden="true"
              />
              <span className={previewHex}>{value.toUpperCase()}</span>
            </div>

            <div className={swatchGrid}>
              {presets.map((color) => (
                <button
                  key={color}
                  className={cx(
                    swatchButton,
                    value.toUpperCase() === color.toUpperCase() ? swatchSelected : undefined,
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => handleSwatchClick(color)}
                  aria-label={`Select color ${color}`}
                  type="button"
                />
              ))}
            </div>

            <div className={hexInputRow}>
              <label htmlFor={hexInputId} className={hexLabel}>HEX</label>
              <input
                id={hexInputId}
                className={hexInputStyle}
                value={hexInput}
                onChange={(e) => handleHexChange(e.target.value)}
                maxLength={7}
                spellCheck={false}
              />
            </div>
          </PopoverContent>
        </PopoverPositioner>
      </PopoverRoot>
    </div>
  );
}

const wrapper = css({
  display: "flex",
  flexDirection: "column",
  gap: "1.5",
});

const labelStyle = css({
  fontSize: "xs",
  fontWeight: "button",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: "text.secondary",
  fontFamily: "body",
});

const triggerStyle = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "2",
  py: "2",
  px: "3",
  backgroundColor: "bg.card",
  borderWidth: "0.25",
  borderStyle: "solid",
  borderColor: "border.default",
  borderRadius: "0",
  cursor: "pointer",
  fontSize: "13",
  fontFamily: "mono",
  color: "text.primary",
  transition: "all 0.15s ease",
  _hover: {
    borderColor: "sunbeam.orange",
  },
  _focusVisible: {
    outlineWidth: "0.5",
    outlineStyle: "solid",
    outlineColor: "sunbeam.orange",
    outlineOffset: "0.5",
  },
});

const triggerSwatch = css({
  width: "4.5",
  height: "4.5",
  borderRadius: "50%",
  borderWidth: "0.25",
  borderStyle: "solid",
  borderColor: "border.default",
  flexShrink: 0,
});

const triggerHex = css({
  fontSize: "13",
  fontFamily: "mono",
  color: "text.primary",
});

const contentStyle = css({
  backgroundColor: "bg.page",
  borderWidth: "0.25",
  borderStyle: "solid",
  borderColor: "border.default",
  shadow: "golden",
  padding: "4",
  zIndex: 50,
  outline: "none",
  width: "65",
});

const popoverHeader = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "3",
});

const popoverTitle = css({
  fontSize: "sm",
  fontWeight: "heading",
  fontFamily: "body",
  color: "text.primary",
});

const closeBtn = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "text.secondary",
  padding: "1",
  transition: "color 0.15s ease",
  _hover: {
    color: "sunbeam.orange",
  },
  _focusVisible: {
    outlineWidth: "0.5",
    outlineStyle: "solid",
    outlineColor: "sunbeam.orange",
    outlineOffset: "0.5",
  },
});

const previewRow = css({
  display: "flex",
  alignItems: "center",
  gap: "2.5",
  marginBottom: "3.5",
});

const previewSwatch = css({
  width: "9",
  height: "9",
  borderRadius: "md",
  borderWidth: "0.25",
  borderStyle: "solid",
  borderColor: "border.default",
  flexShrink: 0,
});

const previewHex = css({
  fontSize: "sm",
  fontFamily: "mono",
  fontWeight: "heading",
  color: "text.primary",
});

const swatchGrid = css({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, 24px)",
  gap: "2",
  marginBottom: "3.5",
  justifyContent: "start",
});

const swatchButton = css({
  width: "6",
  height: "6",
  borderRadius: "50%",
  borderWidth: "0.5",
  borderStyle: "solid",
  borderColor: "transparent",
  cursor: "pointer",
  padding: 0,
  transition: "all 0.15s ease",
  outline: "none",
  _hover: {
    transform: "scale(1.15)",
  },
  _focusVisible: {
    outlineWidth: "0.5",
    outlineStyle: "solid",
    outlineColor: "sunbeam.orange",
    outlineOffset: "0.5",
  },
});

const swatchSelected = css({
  borderColor: "sunbeam.orange",
  ringWidth: "0.5",
  ringColor: "sunbeam.orange",
  ringOffset: "0.25",
});

const hexInputRow = css({
  display: "flex",
  alignItems: "center",
  gap: "2",
  borderTopWidth: "0.25",
  borderTopStyle: "solid",
  borderColor: "border.default",
  paddingTop: "3",
});

const hexLabel = css({
  fontSize: "11",
  fontWeight: "button",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: "text.muted",
  fontFamily: "body",
});

const hexInputStyle = css({
  flex: 1,
  py: "1.5",
  px: "2",
  backgroundColor: "bg.card",
  borderWidth: "0.25",
  borderStyle: "solid",
  borderColor: "border.default",
  borderRadius: "0",
  fontSize: "13",
  fontFamily: "mono",
  color: "text.primary",
  outline: "none",
  _focus: {
    ringWidth: "0.5",
    ringColor: "sunbeam.orange",
    borderColor: "transparent",
  },
});
