import { css, cx } from "../../system.ts";

import { type ReactNode, useId } from "react";
import {
  DatePickerContent,
  DatePickerContext,
  DatePickerControl,
  DatePickerInput,
  DatePickerNextTrigger,
  DatePickerPositioner,
  DatePickerPrevTrigger,
  DatePickerRoot,
  DatePickerTable,
  DatePickerTableBody,
  DatePickerTableCell,
  DatePickerTableCellTrigger,
  DatePickerTableHead,
  DatePickerTableHeader,
  DatePickerTableRow,
  DatePickerTrigger,
  DatePickerView,
  DatePickerViewControl,
  DatePickerViewTrigger,
  parseDate,
} from "@ark-ui/react/date-picker";
import { Icon } from "./icon.tsx";

/** Props for {@link DatePicker}. */
export interface DatePickerProps {
  /** Current date value as ISO 8601 string (e.g., `"2024-12-25"`). */
  value?: string;
  /** Callback fired when the user selects a date; receives the ISO date string. */
  onChange?: (value: string) => void;
  /** Optional label shown above the date input. */
  label?: string;
  /** Placeholder text shown in the input when no date is selected. Defaults to `"Select date"`. */
  placeholder?: string;
  /** Whether the calendar popover is open. Defaults to `false`. */
  open?: boolean;
  /** Called when the open state changes. */
  onOpenChange?: (open: boolean) => void;
  /** If true, the date picker is disabled and cannot be interacted with. Defaults to false. */
  disabled?: boolean;
  /** Extra CSS class names to apply to the root container. */
  className?: string;
}

/**
 * Ark UI date picker with day/month/year views and calendar navigation.
 *
 * Displays a trigger button with a calendar icon; opens a popover with day, month, and year views.
 * Supports keyboard navigation and locale-aware formatting. Closes automatically on selection.
 *
 * @example
 * ```tsx
 * <DatePicker value={date} onChange={setDate} label="Start Date" />
 * ```
 */
export function DatePicker({
  value,
  onChange,
  label,
  placeholder = "Select date",
  open,
  onOpenChange,
  disabled = false,
  className,
}: DatePickerProps): ReactNode {
  const inputId = useId();
  return (
    <div className={cx(wrapper, className)}>
      {label && <label htmlFor={inputId} className={labelStyle}>{label}</label>}
      <DatePickerRoot
        value={value ? [parseDate(value)] : undefined}
        onValueChange={(details) => {
          const dv = details.value[0];
          if (dv) {
            const iso = `${dv.year}-${String(dv.month).padStart(2, "0")}-${
              String(dv.day).padStart(2, "0")
            }`;
            onChange?.(iso);
          }
        }}
        open={open}
        onOpenChange={(d) => onOpenChange?.(d.open)}
        disabled={disabled}
        closeOnSelect
      >
        <DatePickerControl className={controlStyle}>
          <DatePickerInput
            id={inputId}
            className={inputStyle}
            placeholder={placeholder}
          />
          <DatePickerTrigger
            className={triggerButton}
            aria-label="Open calendar"
          >
            <Icon name="calendar_today" size={18} />
          </DatePickerTrigger>
        </DatePickerControl>

        <DatePickerPositioner className={positionerStyle}>
          <DatePickerContent className={contentStyle}>
            <DatePickerView view="day">
              <DatePickerContext>
                {(context) => (
                  <>
                    <DatePickerViewControl className={navRow}>
                      <DatePickerPrevTrigger
                        className={navButton}
                        aria-label="Previous"
                      >
                        <Icon name="chevron_left" size={18} />
                      </DatePickerPrevTrigger>
                      <DatePickerViewTrigger className={viewTrigger}>
                        {context.visibleRangeText.start}
                      </DatePickerViewTrigger>
                      <DatePickerNextTrigger
                        className={navButton}
                        aria-label="Next"
                      >
                        <Icon name="chevron_right" size={18} />
                      </DatePickerNextTrigger>
                    </DatePickerViewControl>

                    <DatePickerTable className={tableStyle}>
                      <DatePickerTableHead>
                        <DatePickerTableRow>
                          {context.weekDays.map((weekDay, i) => (
                            <DatePickerTableHeader
                              key={i}
                              className={headerCell}
                            >
                              {weekDay.narrow}
                            </DatePickerTableHeader>
                          ))}
                        </DatePickerTableRow>
                      </DatePickerTableHead>
                      <DatePickerTableBody>
                        {context.weeks.map((week, i) => (
                          <DatePickerTableRow key={i}>
                            {week.map((day, j) => (
                              <DatePickerTableCell
                                key={j}
                                value={day}
                                className={dayCell}
                              >
                                <DatePickerTableCellTrigger
                                  className={dayCellTrigger}
                                >
                                  {day.day}
                                </DatePickerTableCellTrigger>
                              </DatePickerTableCell>
                            ))}
                          </DatePickerTableRow>
                        ))}
                      </DatePickerTableBody>
                    </DatePickerTable>
                  </>
                )}
              </DatePickerContext>
            </DatePickerView>

            <DatePickerView view="month">
              <DatePickerContext>
                {(context) => (
                  <>
                    <DatePickerViewControl className={navRow}>
                      <DatePickerPrevTrigger
                        className={navButton}
                        aria-label="Previous"
                      >
                        <Icon name="chevron_left" size={18} />
                      </DatePickerPrevTrigger>
                      <DatePickerViewTrigger className={viewTrigger}>
                        {context.visibleRange.start.year}
                      </DatePickerViewTrigger>
                      <DatePickerNextTrigger
                        className={navButton}
                        aria-label="Next"
                      >
                        <Icon name="chevron_right" size={18} />
                      </DatePickerNextTrigger>
                    </DatePickerViewControl>

                    <DatePickerTable className={tableStyle}>
                      <DatePickerTableBody>
                        {context.getMonthsGrid({ columns: 4, format: "short" })
                          .map((months, i) => (
                            <DatePickerTableRow key={i}>
                              {months.map((month, j) => (
                                <DatePickerTableCell
                                  key={j}
                                  value={month.value}
                                  className={dayCell}
                                >
                                  <DatePickerTableCellTrigger
                                    className={dayCellTrigger}
                                  >
                                    {month.label}
                                  </DatePickerTableCellTrigger>
                                </DatePickerTableCell>
                              ))}
                            </DatePickerTableRow>
                          ))}
                      </DatePickerTableBody>
                    </DatePickerTable>
                  </>
                )}
              </DatePickerContext>
            </DatePickerView>

            <DatePickerView view="year">
              <DatePickerContext>
                {(context) => (
                  <>
                    <DatePickerViewControl className={navRow}>
                      <DatePickerPrevTrigger
                        className={navButton}
                        aria-label="Previous"
                      >
                        <Icon name="chevron_left" size={18} />
                      </DatePickerPrevTrigger>
                      <DatePickerViewTrigger className={viewTrigger}>
                        {context.getYearsGrid().at(0)?.at(0)?.label} &ndash;{" "}
                        {context.getYearsGrid().at(-1)?.at(-1)?.label}
                      </DatePickerViewTrigger>
                      <DatePickerNextTrigger
                        className={navButton}
                        aria-label="Next"
                      >
                        <Icon name="chevron_right" size={18} />
                      </DatePickerNextTrigger>
                    </DatePickerViewControl>

                    <DatePickerTable className={tableStyle}>
                      <DatePickerTableBody>
                        {context.getYearsGrid({ columns: 4 }).map((
                          years,
                          i,
                        ) => (
                          <DatePickerTableRow key={i}>
                            {years.map((year, j) => (
                              <DatePickerTableCell
                                key={j}
                                value={year.value}
                                className={dayCell}
                              >
                                <DatePickerTableCellTrigger
                                  className={dayCellTrigger}
                                >
                                  {year.label}
                                </DatePickerTableCellTrigger>
                              </DatePickerTableCell>
                            ))}
                          </DatePickerTableRow>
                        ))}
                      </DatePickerTableBody>
                    </DatePickerTable>
                  </>
                )}
              </DatePickerContext>
            </DatePickerView>
          </DatePickerContent>
        </DatePickerPositioner>
      </DatePickerRoot>
    </div>
  );
}

const wrapper = css({
  display: "flex",
  flexDirection: "column",
  gap: "1.5",
  width: "100%",
});

const labelStyle = css({
  fontSize: "xs",
  fontWeight: "button",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: "text.secondary",
  fontFamily: "body",
});

const controlStyle = css({
  display: "flex",
  alignItems: "center",
  width: "100%",
});

const inputStyle = css({
  width: "100%",
  py: "2.5",
  px: "3",
  backgroundColor: "bg.card",
  borderWidth: "0.25",
  borderStyle: "solid",
  borderColor: "border.default",
  borderRadius: "0",
  fontSize: "sm",
  fontFamily: "mono",
  color: "text.primary",
  outline: "none",
  transition: "all 0.15s ease",
  _focus: {
    ringWidth: "0.5",
    ringColor: "sunbeam.orange",
    borderColor: "transparent",
  },
  _disabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  _placeholder: {
    color: "text.muted",
  },
});

const triggerButton = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  py: "0",
  px: "3",
  height: "auto",
  alignSelf: "stretch",
  backgroundColor: "bg.card",
  borderWidth: "0.25",
  borderStyle: "solid",
  borderColor: "border.default",
  borderLeft: "none",
  borderRadius: "0",
  cursor: "pointer",
  color: "text.secondary",
  transition: "color 0.15s ease",
  _hover: {
    color: "sunbeam.orange",
  },
  _focusVisible: {
    outlineWidth: "0.5",
    outlineStyle: "solid",
    outlineColor: "sunbeam.orange",
    outlineOffset: "-0.5",
  },
  _disabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
});

const positionerStyle = css({
  zIndex: 50,
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
  minWidth: "70",
  "&[data-state=closed]": {
    display: "none",
  },
});

const navRow = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "3",
});

const navButton = css({
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

const viewTrigger = css({
  background: "none",
  border: "none",
  cursor: "pointer",
  fontSize: "sm",
  fontWeight: "heading",
  fontFamily: "body",
  color: "text.primary",
  py: "1",
  px: "2",
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

const tableStyle = css({
  width: "100%",
  borderCollapse: "collapse",
});

const headerCell = css({
  fontSize: "11",
  fontWeight: "button",
  textTransform: "uppercase",
  color: "text.muted",
  textAlign: "center",
  padding: "1",
  fontFamily: "mono",
});

const dayCell = css({
  textAlign: "center",
  padding: "0.25",
});

const dayCellTrigger = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "8",
  height: "8",
  fontSize: "13",
  fontFamily: "mono",
  color: "text.primary",
  background: "none",
  borderWidth: "0.25",
  borderStyle: "solid",
  borderColor: "transparent",
  cursor: "pointer",
  transition: "all 0.15s ease",
  borderRadius: "0",
  _hover: {
    backgroundColor: "bg.card",
    borderColor: "border.default",
  },
  _today: {
    fontWeight: "heading",
    borderColor: "border.default",
  },
  _selected: {
    backgroundColor: "sunbeam.orange",
    color: "white",
    borderColor: "sunbeam.orange",
    fontWeight: "heading",
  },
  "&[data-outside-range]": {
    color: "text.muted",
    opacity: 0.4,
  },
  _focusVisible: {
    outlineWidth: "0.5",
    outlineStyle: "solid",
    outlineColor: "sunbeam.orange",
    outlineOffset: "0.25",
  },
  _disabled: {
    opacity: 0.3,
    cursor: "not-allowed",
  },
});
