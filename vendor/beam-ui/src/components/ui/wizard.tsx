import { css, cx } from "../../system.ts";

import { type ReactNode, useEffect, useState } from "react";
import {
  DialogBackdrop,
  DialogCloseTrigger,
  DialogContent,
  DialogPositioner,
  DialogRoot,
  DialogTitle,
} from "@ark-ui/react/dialog";
import { Button } from "./button.tsx";
import { Icon } from "./icon.tsx";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

/** Step in a {@link Wizard} or {@link WizardModal}. */
export interface WizardStep {
  /** Step title displayed in the indicator and header. */
  title: string;
  /** Optional description displayed above the step content. */
  description?: string;
  /** Step content (form, text, or other React nodes). */
  content: ReactNode;
  /** Whether the step is valid. If false, the Next button is disabled. Defaults to `true`. */
  isValid?: boolean;
}

/** Props for {@link Wizard}. */
export interface WizardProps {
  /** Array of wizard steps with title and content. */
  steps: WizardStep[];
  /** Called when the final step is completed. */
  onComplete: () => void;
  /** Called when the user clicks Cancel (only shown on first step). */
  onCancel?: () => void;
  /** Called when the user advances to a new step with its index. */
  onStepChange?: (step: number) => void;
  /** Button label for advancing to the next step. Defaults to `"Continue"`. */
  nextLabel?: string;
  /** Button label for returning to the previous step. Defaults to `"Back"`. */
  backLabel?: string;
  /** Button label on the final step. Defaults to `"Finish"`. */
  completeLabel?: string;
  /** Button label for canceling (first step only). Defaults to `"Cancel"`. */
  cancelLabel?: string;
  /** Optional CSS class applied to the root container. */
  className?: string;
}

/** Props for {@link WizardModal}. */
export interface WizardModalProps extends WizardProps {
  /** Whether the modal is open. */
  open: boolean;
  /** Called when the user closes the modal (via close button or Escape). */
  onClose: () => void;
  /** Optional title displayed in the modal header. */
  title?: string;
}

/* ------------------------------------------------------------------ */
/* Wizard                                                              */
/* ------------------------------------------------------------------ */

/**
 * Multi-step wizard with progress indicator and navigation buttons.
 * Shows one step at a time with title, optional description, and custom content.
 * Back button disabled on first step; Cancel only shown on first step.
 *
 * @example
 * ```tsx
 * <Wizard
 *   steps={[
 *     { title: "Profile", content: <ProfileForm /> },
 *     { title: "Preferences", content: <PreferencesForm /> },
 *   ]}
 *   onComplete={() => console.log("done")}
 *   onCancel={() => console.log("cancelled")}
 * />
 * ```
 */
export function Wizard({
  steps,
  onComplete,
  onCancel,
  onStepChange,
  nextLabel = "Continue",
  backLabel = "Back",
  completeLabel = "Finish",
  cancelLabel = "Cancel",
  className,
}: WizardProps): ReactNode {
  const [current, setCurrent] = useState(0);
  const step = steps[current];
  const isFirst = current === 0;
  const isLast = current === steps.length - 1;
  const canProceed = step.isValid !== false;

  const goNext = () => {
    if (isLast) {
      onComplete();
    } else {
      const next = current + 1;
      setCurrent(next);
      onStepChange?.(next);
    }
  };

  const goBack = () => {
    if (!isFirst) {
      const prev = current - 1;
      setCurrent(prev);
      onStepChange?.(prev);
    }
  };

  return (
    <div className={cx(wrapper, className)}>
      {/* Step indicator */}
      <nav aria-label="Wizard progress" className={stepIndicator}>
        {steps.map((s, i) => (
          <div
            key={i}
            className={stepItem}
            aria-current={i === current ? "step" : undefined}
          >
            <div
              className={cx(
                stepCircle,
                i < current ? stepDone : i === current ? stepActive : stepPending,
              )}
              aria-hidden="true"
            >
              {i < current
                ? <Icon name="check" size={14} />
                : <span className={stepNumber}>{i + 1}</span>}
            </div>
            <span
              className={cx(
                stepLabel,
                i === current && stepLabelActive,
              )}
            >
              {s.title}
            </span>
            {i < steps.length - 1 && (
              <div
                className={cx(stepLine, i < current && stepLineDone)}
                aria-hidden="true"
              />
            )}
          </div>
        ))}
      </nav>

      {/* Content */}
      <div className={content} aria-live="polite">
        {step.description && <p className={description}>{step.description}</p>}
        <div className={body}>
          {step.content}
        </div>
      </div>

      {/* Actions */}
      <div className={actions}>
        <div className={actionsLeft}>
          {onCancel && isFirst && <Button variant="ghost" onClick={onCancel}>{cancelLabel}</Button>}
          {!isFirst && (
            <Button variant="ghost" onClick={goBack}>
              <Icon name="arrow_back" size={16} />
              {backLabel}
            </Button>
          )}
        </div>
        <div className={actionsRight}>
          <span className={stepCount}>{current + 1} of {steps.length}</span>
          <Button
            variant="primary"
            onClick={goNext}
            disabled={!canProceed}
            aria-disabled={!canProceed}
          >
            {isLast ? completeLabel : nextLabel}
            {!isLast && <Icon name="arrow_forward" size={16} />}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* WizardModal                                                         */
/* ------------------------------------------------------------------ */

/**
 * Wizard wrapped in an Ark UI dialog modal using fixed positioning and backdrop.
 * Closes on backdrop click, close button, or Escape key. Inherits all Wizard behavior.
 *
 * @example
 * ```tsx
 * const [open, setOpen] = useState(false);
 * <WizardModal
 *   open={open}
 *   onClose={() => setOpen(false)}
 *   title="Setup Wizard"
 *   steps={[...]}
 *   onComplete={() => { setOpen(false); console.log("done"); }}
 * />
 * ```
 */
export function WizardModal({
  open,
  onClose,
  title,
  onCancel,
  ...wizardProps
}: WizardModalProps): ReactNode {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <DialogRoot
      open={open}
      onOpenChange={(d) => {
        if (!d.open) onClose();
      }}
    >
      <DialogBackdrop className={modalBackdrop} />
      <DialogPositioner className={modalPositioner}>
        <DialogContent className={modalContent}>
          <div className={modalHeader}>
            {title && <DialogTitle className={modalTitle}>{title}</DialogTitle>}
            <DialogCloseTrigger
              className={modalClose}
              aria-label="Close wizard"
            >
              <Icon name="close" size={20} />
            </DialogCloseTrigger>
          </div>
          <Wizard
            {...wizardProps}
            onCancel={onCancel ?? onClose}
          />
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  );
}

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */

const wrapper = css({
  display: "flex",
  flexDirection: "column",
  gap: "6",
});

const stepIndicator = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0",
});

const stepItem = css({
  display: "flex",
  alignItems: "center",
  gap: "2",
});

const stepCircle = css({
  width: "7",
  height: "7",
  borderRadius: "full",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "xs",
  fontWeight: "button",
  fontFamily: "mono",
  flexShrink: 0,
  transition: "all 0.2s ease",
});

const stepDone = css({
  backgroundColor: "sunbeam.orange",
  color: "white",
});

const stepActive = css({
  backgroundColor: "sunbeam.orange",
  color: "white",
  boxShadow: "focusRing.md",
});

const stepPending = css({
  backgroundColor: "bg.card",
  color: "text.muted",
  borderWidth: "0.25",
  borderStyle: "solid",
  borderColor: "border.default",
});

const stepNumber = css({
  fontSize: "xs",
});

const stepLabel = css({
  fontSize: "xs",
  color: "text.muted",
  fontWeight: "body",
  whiteSpace: "nowrap",
  display: { base: "none", md: "block" },
});

const stepLabelActive = css({
  color: "text.primary",
  fontWeight: "heading",
});

const stepLine = css({
  width: { base: "4", md: "10" },
  height: "0.5",
  backgroundColor: "border.default",
  marginInline: "2",
  flexShrink: 0,
  transition: "background-color 0.2s ease",
});

const stepLineDone = css({
  backgroundColor: "sunbeam.orange",
});

const content = css({
  minHeight: "30",
});

const description = css({
  fontSize: "sm",
  color: "text.secondary",
  lineHeight: 1.6,
  marginBottom: "4",
});

const body = css({});

const actions = css({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  paddingTop: "4",
  borderTopWidth: "0.25",
  borderTopStyle: "solid",
  borderColor: "border.subtle",
});

const actionsLeft = css({
  display: "flex",
  gap: "2",
});

const actionsRight = css({
  display: "flex",
  alignItems: "center",
  gap: "3",
});

const stepCount = css({
  fontSize: "xs",
  fontFamily: "mono",
  color: "text.muted",
});

/* Modal styles */

const modalBackdrop = css({
  position: "fixed",
  inset: 0,
  backgroundColor: "scrim.50",
  zIndex: 50,
});

const modalPositioner = css({
  position: "fixed",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 51,
  padding: "6",
});

const modalContent = css({
  backgroundColor: "bg.page",
  borderWidth: "0.25",
  borderStyle: "solid",
  borderColor: "border.default",
  shadow: "golden",
  width: "100%",
  maxWidth: "150",
  maxHeight: "85vh",
  overflowY: "auto",
  padding: "6",
});

const modalHeader = css({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "6",
});

const modalTitle = css({
  fontSize: "xl",
  fontWeight: "heading",
  fontFamily: "heading",
  color: "text.primary",
  margin: 0,
});

const modalClose = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "text.muted",
  padding: "1",
  _hover: { color: "sunbeam.orange" },
});
