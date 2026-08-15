import { useEffect } from "react";

export interface CommandPaletteAccelerator {
  key: string;
  /** If true, require metaKey on Mac / ctrlKey on other platforms. */
  meta?: boolean;
}

/**
 * Wires a global `keydown` listener that opens the CommandPalette when the
 * accelerator is pressed.
 *
 * On macOS (`navigator.platform` starts with "Mac") the modifier is `metaKey`
 * (⌘). On all other platforms it is `ctrlKey`. The listener is removed on
 * unmount.
 *
 * @example
 * ```tsx
 * const [open, setOpen] = useState(false);
 * useCommandPaletteShortcut(setOpen); // ⌘K / Ctrl+K
 * ```
 */
export function useCommandPaletteShortcut(
  setOpen: (open: boolean) => void,
  accelerator: CommandPaletteAccelerator = { key: "k", meta: true },
): void {
  useEffect(() => {
    function handler(e: KeyboardEvent): void {
      const isMac = navigator.platform.startsWith("Mac");
      const modifierHeld = isMac ? e.metaKey : e.ctrlKey;
      const keyMatches = e.key.toLowerCase() === accelerator.key.toLowerCase();
      const modifierRequired = accelerator.meta !== false;

      if (keyMatches && (!modifierRequired || modifierHeld)) {
        e.preventDefault();
        setOpen(true);
      }
    }

    globalThis.addEventListener("keydown", handler);
    return () => globalThis.removeEventListener("keydown", handler);
  }, [setOpen, accelerator.key, accelerator.meta]);
}
