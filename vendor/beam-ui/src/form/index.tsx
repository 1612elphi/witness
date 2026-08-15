/**
 * Form helpers built on `react-hook-form` + `zod`.
 *
 * Exposes a typed {@link Form} wrapper that connects a Zod schema to RHF and
 * a {@link FormField} primitive for individual fields. Re-exports `useForm`,
 * `zodResolver`, and `z` so consumers only need a single dependency for the
 * common form-validation flow.
 *
 * @example
 * ```tsx
 * import { Form, FormField, z } from "@sunbeam/beam-ui/form";
 *
 * const schema = z.object({
 *   email: z.string().email(),
 *   password: z.string().min(8),
 * });
 *
 * export function SignIn() {
 *   return (
 *     <Form schema={schema} onSubmit={(values) => console.log(values)}>
 *       {(methods) => (
 *         <>
 *           <FormField name="email" label="Email" methods={methods} />
 *           <FormField name="password" label="Password" methods={methods} />
 *           <button type="submit">Sign in</button>
 *         </>
 *       )}
 *     </Form>
 *   );
 * }
 * ```
 *
 * @module
 */
import { css } from "../system.ts";

import type { ReactNode } from "react";
import {
  type DefaultValues,
  type FieldValues,
  type Path,
  useForm,
  type UseFormReturn,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";

/**
 * Form validation and submission library.
 *
 * Re-exports from `react-hook-form` and related libraries.
 * Use with {@link Form} component for type-safe forms with Zod schema validation.
 */

/** {@link useForm} from react-hook-form — register fields and handle submission. */
export { useForm } from "react-hook-form";
/** {@link zodResolver} from @hookform/resolvers/zod — integrate Zod schemas with react-hook-form. */
export { zodResolver } from "@hookform/resolvers/zod";
/** {@link z} from zod — runtime schema validation library. */
export { z } from "zod";

/* ------------------------------------------------------------------ */
/* Form wrapper                                                        */
/* ------------------------------------------------------------------ */

/** Props for {@link Form}. */
interface FormProps<T extends FieldValues> {
  /** Zod schema for validation — defines field types and constraints. */
  schema: z.ZodSchema<T>;
  /** Initial field values. */
  defaultValues?: DefaultValues<T>;
  /** Callback invoked with validated form data on successful submit. */
  onSubmit: (data: T) => void | Promise<void>;
  /** Render function receiving react-hook-form methods for field registration. */
  children: (methods: UseFormReturn<T>) => ReactNode;
  /** Optional CSS class for the form element. */
  className?: string;
}

/**
 * Type-safe form wrapper combining react-hook-form with Zod schema validation.
 *
 * Automatically handles validation, error display, and submission.
 * Child function receives react-hook-form methods for field registration.
 *
 * @example
 * ```tsx
 * const schema = z.object({
 *   email: z.string().email(),
 *   password: z.string().min(8),
 * });
 *
 * <Form schema={schema} defaultValues={{ email: "", password: "" }} onSubmit={handleLogin}>
 *   {(methods) => (
 *     <>
 *       <FormField name="email" label="Email" methods={methods} />
 *       <FormField name="password" label="Password" methods={methods} />
 *       <button type="submit">Sign In</button>
 *     </>
 *   )}
 * </Form>
 * ```
 */
export function Form<T extends FieldValues>({
  schema,
  defaultValues,
  onSubmit,
  children,
  className,
}: FormProps<T>): ReactNode {
  const methods = useForm<T>({
    resolver: zodResolver(schema as never) as never,
    defaultValues,
  });

  return (
    <form
      onSubmit={methods.handleSubmit(onSubmit as never)}
      className={className}
      noValidate
    >
      {children(methods as never)}
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* FormField connector                                                 */
/* ------------------------------------------------------------------ */

/** Props for {@link FormField}. */
interface FormFieldProps<T extends FieldValues> {
  /** Field name (must match schema and form data key). */
  name: Path<T>;
  /** Optional label text displayed above the input. */
  label?: string;
  /** react-hook-form methods from {@link Form} or `useForm()`. */
  methods: UseFormReturn<T>;
  /** Optional CSS class for the wrapper element. */
  className?: string;
}

/**
 * Input field connector for react-hook-form.
 *
 * Renders a labeled input with automatic error display.
 * Requires a parent {@link Form} component or manual `useForm()` setup.
 *
 * @example
 * ```tsx
 * <Form schema={schema} onSubmit={save}>
 *   {(methods) => (
 *     <>
 *       <FormField name="username" label="Username" methods={methods} />
 *       <FormField name="email" label="Email" methods={methods} />
 *     </>
 *   )}
 * </Form>
 * ```
 */
export function FormField<T extends FieldValues>(
  { name, label, methods, className }: FormFieldProps<T>,
): ReactNode {
  const { register, formState: { errors } } = methods;
  const error = errors[name];

  return (
    <div className={className ?? fieldWrapper}>
      {label && <label className={labelStyle} htmlFor={name}>{label}</label>}
      <input
        id={name}
        {...register(name)}
        className={inputStyle}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
      />
      {error && (
        <p id={`${name}-error`} className={errorStyle}>
          {error.message as string}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */

const fieldWrapper = css({
  display: "flex",
  flexDirection: "column",
  gap: "1.5",
  marginBottom: "4",
});

const labelStyle = css({
  fontSize: "13",
  fontWeight: "button",
  color: "text.primary",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
});

const inputStyle = css({
  py: "2.5",
  px: "3",
  fontSize: "sm",
  fontFamily: "body",
  color: "text.primary",
  backgroundColor: "bg.card",
  borderWidth: "0.25",
  borderStyle: "solid",
  borderColor: "border.default",
  borderRadius: "0",
  outline: "none",
  transition: "border-color 0.15s ease",
  _focus: {
    borderColor: "sunbeam.orange",
  },
});

const errorStyle = css({
  fontSize: "xs",
  color: "sunbeam.orange",
  margin: 0,
});
