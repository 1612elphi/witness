import { css, cx } from "../../system.ts";

import type { ReactNode } from "react";
import {
  StepsIndicator,
  StepsItem,
  StepsList,
  StepsRoot,
  StepsSeparator,
  StepsTrigger,
} from "@ark-ui/react/steps";

/** Single step in a steps component. */
interface StepItem {
  /** Step title. */
  title: string;
  /** Optional step description. */
  description?: string;
}

/** Props for {@link Steps}. */
export interface StepsProps {
  /** Array of steps. */
  steps: StepItem[];
  /** Currently active step index (0-based). */
  currentStep: number;
  /** Optional callback when user clicks a step. */
  onChange?: (step: number) => void;
}

/**
 * Horizontal step indicator with titles, optional descriptions, and completion markers.
 * Completed steps show a checkmark, current step has a highlighted ring, upcoming steps are muted.
 * Steps are clickable if onChange handler is provided.
 *
 * @example
 * ```tsx
 * <Steps
 *   steps={[
 *     { title: "Personal", description: "Your info" },
 *     { title: "Payment" },
 *     { title: "Review" },
 *   ]}
 *   currentStep={1}
 *   onChange={(i) => setStep(i)}
 * />
 * ```
 */
export function Steps({ steps, currentStep, onChange }: StepsProps): ReactNode {
  return (
    <StepsRoot
      count={steps.length}
      step={currentStep}
      onStepChange={onChange ? (details) => onChange(details.step) : undefined}
      className={root}
    >
      <StepsList className={list}>
        {steps.map((stepItem, index) => (
          <StepsItem key={index} index={index} className={item}>
            <StepsTrigger className={trigger}>
              <StepsIndicator
                className={cx(
                  indicator,
                  index < currentStep
                    ? completedIndicator
                    : index === currentStep
                    ? currentIndicator
                    : upcomingIndicator,
                )}
              >
                {index < currentStep
                  ? (
                    <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                      <path
                        d="M1 5L4.5 8.5L11 1"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )
                  : <span className={stepNumber}>{index + 1}</span>}
              </StepsIndicator>
              <div className={labelWrap}>
                <span
                  className={cx(
                    label,
                    index === currentStep ? currentLabel : undefined,
                  )}
                >
                  {stepItem.title}
                </span>
                {stepItem.description && <span className={description}>{stepItem.description}
                </span>}
              </div>
            </StepsTrigger>
            {index < steps.length - 1 && (
              <StepsSeparator
                className={cx(
                  separator,
                  index < currentStep ? completedSeparator : undefined,
                )}
              />
            )}
          </StepsItem>
        ))}
      </StepsList>
    </StepsRoot>
  );
}

const root = css({
  width: "100%",
});

const list = css({
  display: "flex",
  alignItems: "flex-start",
});

const item = css({
  display: "flex",
  alignItems: "center",
  flex: 1,
});

const trigger = css({
  display: "flex",
  alignItems: "center",
  gap: "2.5",
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: 0,
  whiteSpace: "nowrap",
});

const indicator = css({
  width: "8",
  height: "8",
  borderRadius: "full",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  transition: "all 0.2s ease",
});

const completedIndicator = css({
  backgroundColor: "sunbeam.orange",
});

const currentIndicator = css({
  backgroundColor: "transparent",
  borderWidth: "0.5",
  borderStyle: "solid",
  borderColor: "sunbeam.orange",
});

const upcomingIndicator = css({
  backgroundColor: "bg.card",
  borderWidth: "0.25",
  borderStyle: "solid",
  borderColor: "border.default",
});

const stepNumber = css({
  fontSize: "13",
  fontWeight: "heading",
  fontFamily: "body",
  color: "text.primary",
});

const labelWrap = css({
  display: "flex",
  flexDirection: "column",
  gap: "0.25",
});

const label = css({
  fontSize: "sm",
  fontWeight: "body",
  fontFamily: "body",
  color: "text.secondary",
  lineHeight: 1.3,
});

const currentLabel = css({
  fontWeight: "heading",
  color: "text.primary",
});

const description = css({
  fontSize: "xs",
  color: "text.muted",
  fontFamily: "body",
  lineHeight: 1.3,
});

const separator = css({
  flex: 1,
  height: "0.5",
  backgroundColor: "border.default",
  my: "0",
  mx: "3",
  borderRadius: "full",
  transition: "background-color 0.2s ease",
  alignSelf: "center",
});

const completedSeparator = css({
  backgroundColor: "sunbeam.orange",
});
