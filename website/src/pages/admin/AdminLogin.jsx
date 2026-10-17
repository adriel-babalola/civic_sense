import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { AlertCircle, Eye, EyeOff, Lock, Mail, Shield } from "lucide-react";
import { LogoMark } from "../../components/layout/Logo";
import { Button } from "../../components/shared/Button";
import { isAdminAuthenticated, loginAdmin } from "../../services/adminAuth";

/**
 * CivicSense Admin Login.
 *
 * Minimalist, dark-themed authentication portal adhering strictly to the
 * #0A0A0A surface palette, crisp Inter typography, and subtle border accents.
 * Accessible only by direct URL navigation.
 */
export function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Determine where to redirect after successful login
  const from = location.state?.from || "/_admin";

  // If already authenticated, redirect straight to admin console
  if (isAdminAuthenticated()) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter both your email address and password.");
      return;
    }

    setLoading(true);
    try {
      const result = await loginAdmin(email.trim(), password);
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError(result.error || "Authentication failed.");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#0A0A0A] px-4 py-12 text-fg antialiased selection:bg-brand selection:text-white">
      {/* Background ambient lighting */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(16,185,129,0.08),transparent_70%)]"
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md">
        {/* Brand identity header */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-[#121212] shadow-xl">
            <LogoMark className="h-6 w-6 text-brand" />
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white">CivicSense</h1>
            <span className="inline-flex items-center gap-1 rounded-full border border-brand/30 bg-brand/10 px-2 py-0.5 text-2xs font-semibold tracking-wide text-brand-bright">
              <Shield size={10} className="shrink-0" />
              ADMIN
            </span>
          </div>
          <p className="mt-1.5 text-xs text-fg-muted">
            Internal Operations & Moderation Console
          </p>
        </div>

        {/* Login card */}
        <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#121212] p-7 shadow-2xl shadow-black/80">
          <div className="mb-6">
            <h2 className="text-base font-semibold text-white">Sign in to console</h2>
            <p className="mt-1 text-xs text-fg-muted">
              Enter your authorized staff credentials to continue.
            </p>
          </div>

          {/* Error notice */}
          {error && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-2.5 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300"
            >
              <AlertCircle size={15} className="mt-0.5 shrink-0 text-red-400" />
              <p className="leading-relaxed">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4.5">
            {/* Email input */}
            <div>
              <label
                htmlFor="admin-email"
                className="mb-1.5 block text-xs font-medium text-fg-secondary"
              >
                Staff Email
              </label>
              <div className="relative">
                <Mail
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-faint"
                  aria-hidden="true"
                />
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@civicsense.ng"
                  className="cs-field w-full pl-9 pr-3 text-sm placeholder:text-fg-faint"
                />
              </div>
            </div>

            {/* Password input */}
            <div>
              <label
                htmlFor="admin-password"
                className="mb-1.5 block text-xs font-medium text-fg-secondary"
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-faint"
                  aria-hidden="true"
                />
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="cs-field w-full pl-9 pr-10 text-sm placeholder:text-fg-faint"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-fg-muted transition-colors hover:text-white"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="md"
                loading={loading}
                className="h-10 text-sm font-medium"
              >
                Sign in to Dashboard
              </Button>
            </div>
          </form>

          {/* Security caveat */}
          <div className="mt-6 border-t border-white/[0.06] pt-4 text-center">
            <p className="text-2xs text-fg-faint leading-relaxed">
              Restricted area. Failed login attempts are monitored and rate-limited.
            </p>
          </div>
        </div>

        {/* Back link */}
        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-xs text-fg-faint transition-colors hover:text-fg-muted"
          >
            ← Return to CivicSense public site
          </a>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
