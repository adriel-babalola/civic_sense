import { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { AlertTriangle, Eye, EyeOff, Lock } from "lucide-react";
import { signIn, isAuthenticated, usingDefaultPassword } from "../../services/auth";
import { validatePassword } from "../../utils/validators";
import { Logo } from "../../components/layout/Logo";
import { Button } from "../../components/shared/Button";
import { Alert } from "../../components/shared/Field";
import { Input } from "../../components/shared/Input";

/**
 * Admin sign-in.
 *
 * The password is compared in the browser, so this is an access gate and not a
 * security boundary — the page says so, plainly, rather than implying the
 * moderation queue is protected. See services/auth.js.
 */
export function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  // Someone who is already signed in has no business on this page.
  useEffect(() => {
    if (isAuthenticated()) navigate("/admin", { replace: true });
  }, [navigate]);

  if (isAuthenticated()) return <Navigate to="/admin" replace />;

  const handleSubmit = (event) => {
    event.preventDefault();

    const invalid = validatePassword(password);
    if (invalid) {
      setError(invalid);
      return;
    }

    const result = signIn(password);
    if (!result.ok) {
      setError(result.error);
      setPassword("");
      return;
    }

    // Return them to wherever the guard intercepted them.
    const from = location.state?.from;
    navigate(from && from !== "/admin/login" ? from : "/admin", { replace: true });
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-surface px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="flex justify-center">
          <Logo />
        </div>

        <h1 className="mt-7 text-center text-heading text-fg">Moderation access</h1>
        <p className="mt-1.5 text-center text-sm text-fg-muted">
          This area is for the team reviewing incoming reports.
        </p>

        <form onSubmit={handleSubmit} noValidate className="cs-card mt-6 space-y-4 p-5">
          <Input
            label="Access password"
            type={isVisible ? "text" : "password"}
            autoComplete="current-password"
            autoFocus
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setError(null);
            }}
            error={error}
            placeholder="Enter the password"
            icon={Lock}
          />

          <button
            type="button"
            onClick={() => setIsVisible((value) => !value)}
            className="-mt-1 flex items-center gap-1.5 text-xs text-fg-muted transition-colors hover:text-fg"
            aria-label={isVisible ? "Hide password" : "Show password"}
          >
            {isVisible ? <EyeOff size={13} aria-hidden="true" /> : <Eye size={13} aria-hidden="true" />}
            {isVisible ? "Hide" : "Show"} password
          </button>

          <Button type="submit" variant="primary" size="lg" fullWidth>
            Sign in
          </Button>
        </form>

        {usingDefaultPassword() ? (
          <Alert tone="warning" className="mt-4" title="Development password in use">
            This deployment is still on the built-in development password. Set{" "}
            <code className="font-mono">VITE_ADMIN_PASSWORD</code> before it handles real reports.
          </Alert>
        ) : null}

        <p className="cs-hint mt-6 text-center">
          <AlertTriangle size={11} className="mr-1 inline align-[-1px]" aria-hidden="true" />
          This gate runs in your browser. It keeps casual visitors out of an internal tool; it is
          not a substitute for server-side authentication.
        </p>
      </div>
    </div>
  );
}

export default AdminLogin;
