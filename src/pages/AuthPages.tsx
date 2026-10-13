
import { useState, type FormEvent } from 'react';
import {
  ArrowRight,
  Eye,
  EyeOff,
  Fingerprint,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { api, ApiError } from '../api';
import { useAuth } from '../auth';
import { Btn, ErrorBox, Field } from '../ui';

type RegisterValues = {
  email: string;
  password: string;
  displayName: string;
};

export function validateRegister(
  v: RegisterValues,
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) {
    errors.email = 'Enter a valid email address';
  }

  if (v.password.length < 10) {
    errors.password = 'Password must be at least 10 characters';
  }

  if (!v.displayName.trim()) {
    errors.displayName = 'Display name is required';
  }

  return errors;
}

function AuthShell({
  children,
  heading,
  subtitle,
  mode,
}: {
  children: React.ReactNode;
  heading: string;
  subtitle: string;
  mode: 'login' | 'register';
}) {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:py-16">
      <div className="grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60 lg:grid-cols-2">
        {/* Brand panel */}
        <aside className="relative hidden min-h-[640px] flex-col justify-between overflow-hidden bg-slate-950 p-10 text-white lg:flex xl:p-12">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 via-transparent to-indigo-500/20" />

          <div className="absolute -right-24 top-24 h-72 w-72 rounded-full border border-blue-300/20" />
          <div className="absolute -right-12 top-36 h-48 w-48 rounded-full border border-blue-300/20" />
          <div className="absolute -bottom-24 -left-20 h-80 w-80 rounded-full bg-blue-600/10 blur-3xl" />

          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-900/30">
                <ShieldCheck size={27} />
              </span>

              <span>
                <span className="block text-lg font-extrabold tracking-tight">
                  MPAI
                </span>
                <span className="block text-xs text-slate-400">
                  Missing Person AI
                </span>
              </span>
            </Link>
          </div>

          <div className="relative z-10 my-12 max-w-md">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-blue-400/10 px-3 py-2 text-xs font-semibold text-blue-200">
              <Fingerprint size={15} />
              Responsible investigation platform
            </div>

            <h2 className="text-4xl font-extrabold leading-tight tracking-tight xl:text-5xl">
              Every report
              <br />
              deserves attention.
            </h2>

            <p className="mt-6 max-w-sm text-sm leading-7 text-slate-300">
              Manage reports, review sightings and support investigations
              through a secure, structured workflow.
            </p>

            <div className="mt-9 space-y-4">
              {[
                'Role-based access to protected information',
                'Organized reports and sighting reviews',
                'Human review of potential AI matches',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300">
                    <ShieldCheck size={15} />
                  </span>
                  <span className="text-sm text-slate-300">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 border-t border-white/10 pt-5 text-xs leading-5 text-slate-400">
            AI-generated similarity results are leads for authorized human
            review, not proof of identity.
          </div>
        </aside>

        {/* Form panel */}
        <section className="flex min-w-0 items-center justify-center p-5 sm:p-10 lg:p-12">
          <div className="w-full max-w-md">
            <Link
              to="/"
              className="mb-9 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-700 lg:hidden"
            >
              <ShieldCheck size={20} className="text-blue-600" />
              MPAI
            </Link>

            <div className="mb-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                {mode === 'login' ? (
                  <LockKeyhole size={23} />
                ) : (
                  <UserRound size={23} />
                )}
              </div>

              <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
                {mode === 'login' ? 'Welcome back' : 'Get started'}
              </p>

              <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">
                {heading}
              </h1>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                {subtitle}
              </p>
            </div>

            {children}

            <p className="mt-8 text-center text-xs leading-5 text-slate-400">
              Secure access · Authorized use only
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function PasswordField({
  id,
  value,
  onChange,
  label,
  autoComplete,
  error,
  onBlur,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  label: string;
  autoComplete: string;
  error?: string;
  onBlur?: () => void;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Field
        id={id}
        label={label}
        type={visible ? 'text' : 'password'}
        autoComplete={autoComplete}
        value={value}
        error={error}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        required
        className="pr-12"
      />

      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
        className="absolute right-3 top-[34px] rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo =
    (location.state as { from?: string } | null)?.from ?? '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setBusy(true);

    try {
      await login(email.trim(), password);
      navigate(redirectTo);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Login failed. Please try again.',
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      mode="login"
      heading="Sign in to your account"
      subtitle="Enter your credentials to continue to your workspace."
    >
      <form onSubmit={submit} noValidate className="space-y-2">
        {error && (
          <div className="mb-5">
            <ErrorBox message={error} />
          </div>
        )}

        <Field
          id="login-email"
          label="Email address"
          type="email"
          placeholder="you@example.com"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <PasswordField
          id="login-password"
          label="Password"
          autoComplete="current-password"
          value={password}
          onChange={setPassword}
        />

        <div className="pt-3">
          <Btn
            type="submit"
            disabled={busy || !email.trim() || !password}
            className="flex w-full items-center justify-center gap-2 !rounded-xl !py-3"
          >
            {busy ? 'Signing in...' : 'Sign in'}
            {!busy && <ArrowRight size={17} />}
          </Btn>
        </div>

        <p className="pt-5 text-center text-sm text-slate-500">
          Don't have an account?{' '}
          <Link
            className="font-bold text-blue-700 transition hover:text-blue-900"
            to="/register"
          >
            Create one
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

export function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [values, setValues] = useState<RegisterValues>({
    email: '',
    password: '',
    displayName: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const update = (field: keyof RegisterValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));

    setErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });

    setError('');
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const normalized = {
      ...values,
      email: values.email.trim(),
      displayName: values.displayName.trim(),
    };

    const validationErrors = validateRegister(normalized);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setBusy(true);

    try {
      await api('/auth/register', {
        method: 'POST',
        body: normalized,
      });

      await login(normalized.email, normalized.password);
      navigate('/dashboard');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);

        if (err.fields) {
          setErrors((current) => ({ ...current, ...err.fields }));
        }
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      mode="register"
      heading="Create your account"
      subtitle="Register to submit and manage reports available to your account."
    >
      <form onSubmit={submit} noValidate className="space-y-2">
        {error && (
          <div className="mb-5">
            <ErrorBox message={error} />
          </div>
        )}

        <Field
          id="register-name"
          label="Full name"
          placeholder="Enter your name"
          autoComplete="name"
          value={values.displayName}
          error={errors.displayName}
          onChange={(e) => update('displayName', e.target.value)}
          required
        />

        <Field
          id="register-email"
          label="Email address"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={values.email}
          error={errors.email}
          onChange={(e) => update('email', e.target.value)}
          required
        />

        <PasswordField
          id="register-password"
          label="Password (minimum 10 characters)"
          autoComplete="new-password"
          value={values.password}
          error={errors.password}
          onChange={(value) => update('password', value)}
        />

        <div className="flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50/70 p-3 text-xs leading-5 text-slate-600">
          <Mail size={16} className="mt-0.5 shrink-0 text-blue-700" />
          <p>
            Use an email address you control. Account access and permissions
            are governed by the server.
          </p>
        </div>

        <div className="pt-3">
          <Btn
            type="submit"
            disabled={
              busy ||
              !values.displayName.trim() ||
              !values.email.trim() ||
              !values.password
            }
            className="flex w-full items-center justify-center gap-2 !rounded-xl !py-3"
          >
            {busy ? 'Creating account...' : 'Create account'}
            {!busy && <ArrowRight size={17} />}
          </Btn>
        </div>

        <p className="pt-5 text-center text-sm text-slate-500">
          Already registered?{' '}
          <Link
            className="font-bold text-blue-700 transition hover:text-blue-900"
            to="/login"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
