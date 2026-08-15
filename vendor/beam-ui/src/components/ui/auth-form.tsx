import { css } from "../../system.ts";

import { type ReactNode, useState } from "react";
import { Icon } from "./icon.tsx";
import { Spinner } from "./spinner.tsx";
import { TextInput } from "./text-input.tsx";
import { Checkbox } from "./checkbox.tsx";
import { Button } from "./button.tsx";
import { PinInput } from "./pin-input.tsx";
import { Callout } from "./callout.tsx";

/* ------------------------------------------------------------------ */
/* LoginForm                                                           */
/* ------------------------------------------------------------------ */

interface OAuthProvider {
  name: string;
  icon: string;
  onClick: () => void;
}

/** Props for {@link LoginForm}. */
export interface LoginFormProps {
  /** Called with username, password, and remember-me flag on form submission. */
  onSubmit: (username: string, password: string, remember: boolean) => void;
  /** OAuth provider buttons to display (optional). */
  oauthProviders?: OAuthProvider[];
  /** Error message displayed in a callout (optional). */
  error?: string;
  /** If true, inputs are disabled and submit button shows spinner. Defaults to false. */
  loading?: boolean;
}

/**
 * Login form with username/password fields and optional OAuth providers.
 *
 * Includes "Remember me" checkbox, links to sign up and forgot password. Shows error callout if provided.
 *
 * @example
 * ```tsx
 * <LoginForm
 *   onSubmit={(u, p, r) => signIn(u, p, r)}
 *   oauthProviders={[{ name: "GitHub", icon: "github", onClick: () => signInWithGH() }]}
 * />
 * ```
 */
export function LoginForm({
  onSubmit,
  oauthProviders,
  error,
  loading = false,
}: LoginFormProps): ReactNode {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(username, password, remember);
  };

  return (
    <div className={card}>
      <h2 className={title}>Sign In</h2>
      {error && <Callout variant="warning">{error}</Callout>}
      <form onSubmit={handleSubmit} className={form}>
        <TextInput
          label="Username or Email"
          value={username}
          onChange={setUsername}
          placeholder="you@example.com"
          disabled={loading}
        />
        <TextInput
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="Enter password"
          disabled={loading}
        />
        <div className={row}>
          <Checkbox
            checked={remember}
            onChange={setRemember}
            label="Remember me"
            disabled={loading}
          />
        </div>
        <Button variant="primary" type="submit" className={fullWidth}>
          {loading && <Spinner size="sm" color="white" />}
          Sign In
        </Button>
      </form>

      {oauthProviders && oauthProviders.length > 0 && (
        <>
          <div className={divider}>
            <span className={dividerLine} />
            <span className={dividerText}>or</span>
            <span className={dividerLine} />
          </div>
          <div className={oauthList}>
            {oauthProviders.map((provider) => (
              <Button
                key={provider.name}
                variant="ghost"
                onClick={provider.onClick}
                className={fullWidth}
              >
                <Icon name={provider.icon} size={18} />
                {provider.name}
              </Button>
            ))}
          </div>
        </>
      )}

      <div className={links}>
        <span className={linkText}>
          Don't have an account? <a className={link}>Sign up</a>
        </span>
        <a className={link}>Forgot your password?</a>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* SignUpForm                                                           */
/* ------------------------------------------------------------------ */

/** Props for {@link SignUpForm}. */
export interface SignUpFormProps {
  /** Called with username, email, and password on form submission. */
  onSubmit: (
    data: { username: string; email: string; password: string },
  ) => void;
  /** Error message displayed in a callout (optional). */
  error?: string;
  /** If true, inputs are disabled and submit button shows spinner. Defaults to false. */
  loading?: boolean;
}

/**
 * Sign-up form for account creation.
 *
 * Collects username, email, and password. Includes link to sign in page.
 *
 * @example
 * ```tsx
 * <SignUpForm
 *   onSubmit={(data) => createAccount(data)}
 *   loading={isCreating}
 * />
 * ```
 */
export function SignUpForm(
  { onSubmit, error, loading = false }: SignUpFormProps,
): ReactNode {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ username, email, password });
  };

  return (
    <div className={card}>
      <h2 className={title}>Create Account</h2>
      {error && <Callout variant="warning">{error}</Callout>}
      <form onSubmit={handleSubmit} className={form}>
        <TextInput
          label="Username"
          value={username}
          onChange={setUsername}
          placeholder="Choose a username"
          disabled={loading}
        />
        <TextInput
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          disabled={loading}
        />
        <TextInput
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="Create a password"
          disabled={loading}
        />
        <Button variant="primary" type="submit" className={fullWidth}>
          {loading && <Spinner size="sm" color="white" />}
          Create Account
        </Button>
      </form>
      <div className={links}>
        <span className={linkText}>
          Already have an account? <a className={link}>Sign in</a>
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* ForgotPasswordForm                                                  */
/* ------------------------------------------------------------------ */

/** Props for {@link ForgotPasswordForm}. */
export interface ForgotPasswordFormProps {
  /** Called with email address on form submission. */
  onSubmit: (email: string) => void;
  /** Error message displayed in a callout (optional). */
  error?: string;
  /** If true, input is disabled and submit button shows spinner. Defaults to false. */
  loading?: boolean;
  /** If true, shows success message instead of the form. Defaults to false. */
  success?: boolean;
}

/**
 * Password recovery form.
 *
 * Collects email address and shows confirmation message after submission. Includes link back to sign in.
 *
 * @example
 * ```tsx
 * <ForgotPasswordForm
 *   onSubmit={(email) => requestReset(email)}
 *   success={resetSent}
 * />
 * ```
 */
export function ForgotPasswordForm({
  onSubmit,
  error,
  loading = false,
  success = false,
}: ForgotPasswordFormProps): ReactNode {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email);
  };

  return (
    <div className={card}>
      <h2 className={title}>Forgot Password</h2>
      {error && <Callout variant="warning">{error}</Callout>}
      {success
        ? (
          <Callout variant="tip">
            A password reset link has been sent to your email address.
          </Callout>
        )
        : (
          <form onSubmit={handleSubmit} className={form}>
            <p className={subtitle}>
              Enter your email address and we'll send you a link to reset your password.
            </p>
            <TextInput
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@example.com"
              disabled={loading}
            />
            <Button variant="primary" type="submit" className={fullWidth}>
              {loading && <Spinner size="sm" color="white" />}
              Send Reset Link
            </Button>
          </form>
        )}
      <div className={links}>
        <a className={link}>Back to sign in</a>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* TwoFactorForm                                                       */
/* ------------------------------------------------------------------ */

/** Props for {@link TwoFactorForm}. */
export interface TwoFactorFormProps {
  /** Called with the 6-digit code on form submission. */
  onSubmit: (code: string) => void;
  /** Called when user clicks "Use a scratch code instead" button. */
  onScratchCode: () => void;
  /** Error message displayed in a callout (optional). */
  error?: string;
  /** If true, input is disabled and submit button shows spinner. Defaults to false. */
  loading?: boolean;
}

/**
 * Two-factor authentication code verification form.
 *
 * Uses a 6-digit PIN input component. Includes link to use a backup scratch code instead.
 *
 * @example
 * ```tsx
 * <TwoFactorForm
 *   onSubmit={(code) => verify2FA(code)}
 *   onScratchCode={() => switchToScratchCode()}
 * />
 * ```
 */
export function TwoFactorForm({
  onSubmit,
  onScratchCode,
  error,
  loading = false,
}: TwoFactorFormProps): ReactNode {
  const [code, setCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(code);
  };

  return (
    <div className={card}>
      <h2 className={title}>Two-Factor Authentication</h2>
      <p className={subtitle}>
        Enter the 6-digit code from your authenticator app.
      </p>
      {error && <Callout variant="warning">{error}</Callout>}
      <form onSubmit={handleSubmit} className={form}>
        <div className={centered}>
          <PinInput length={6} value={code} onChange={setCode} />
        </div>
        <Button variant="primary" type="submit" className={fullWidth}>
          {loading && <Spinner size="sm" color="white" />}
          Verify
        </Button>
      </form>
      <div className={links}>
        <button className={linkBtn} onClick={onScratchCode} type="button">
          Use a scratch code instead
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shared styles                                                       */
/* ------------------------------------------------------------------ */

const card = css({
  maxWidth: "100",
  width: "100%",
  margin: "0 auto",
  backgroundColor: "bg.page",
  borderWidth: "0.5",
  borderStyle: "solid",
  borderColor: "border.default",
  padding: "8",
  display: "flex",
  flexDirection: "column",
  gap: "4",
  shadow: "golden",
});

const title = css({
  fontSize: "2xl",
  fontWeight: "heading",
  fontFamily: "heading",
  color: "text.primary",
  textAlign: "center",
  margin: 0,
});

const subtitle = css({
  fontSize: "sm",
  fontFamily: "body",
  color: "text.secondary",
  lineHeight: 1.5,
  textAlign: "center",
  margin: 0,
});

const form = css({
  display: "flex",
  flexDirection: "column",
  gap: "4",
});

const row = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
});

const fullWidth = css({
  width: "100%",
  justifyContent: "center",
});

const divider = css({
  display: "flex",
  alignItems: "center",
  gap: "3",
});

const dividerLine = css({
  flex: 1,
  height: "0.25",
  backgroundColor: "border.default",
});

const dividerText = css({
  fontSize: "xs",
  fontWeight: "button",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: "text.muted",
  fontFamily: "body",
});

const oauthList = css({
  display: "flex",
  flexDirection: "column",
  gap: "2",
});

const links = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "2",
  marginTop: "2",
});

const linkText = css({
  fontSize: "13",
  fontFamily: "body",
  color: "text.secondary",
});

const link = css({
  fontSize: "13",
  fontFamily: "body",
  color: "sunbeam.orange",
  cursor: "pointer",
  textDecoration: "underline",
  textUnderlineOffset: "0.75",
  _hover: {
    textDecorationColor: "sunbeam.orange",
  },
});

const linkBtn = css({
  fontSize: "13",
  fontFamily: "body",
  color: "sunbeam.orange",
  cursor: "pointer",
  textDecoration: "underline",
  textUnderlineOffset: "0.75",
  background: "none",
  border: "none",
  padding: 0,
  _hover: {
    textDecorationColor: "sunbeam.orange",
  },
});

const centered = css({
  display: "flex",
  justifyContent: "center",
});
