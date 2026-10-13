
import {
  ReactNode,
  useCallback,
  useEffect,
  useState,
  InputHTMLAttributes,
  ButtonHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';
import { ApiError } from './api';
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
} from 'lucide-react';

export function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-32 items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 text-sm font-medium text-slate-600 shadow-sm"
    >
      <LoaderCircle
        size={21}
        className="animate-spin text-blue-700"
        aria-hidden="true"
      />
      Loading, please wait...
    </div>
  );
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
    >
      <AlertCircle size={19} className="mt-0.5 shrink-0" aria-hidden="true" />
      <div>
        <p className="font-semibold">Something went wrong</p>
        <p className="mt-1 leading-6">{message}</p>
      </div>
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        <AlertCircle size={21} aria-hidden="true" />
      </div>
      <div className="max-w-lg text-sm leading-6 text-slate-600">
        {children}
      </div>
    </div>
  );
}

export function Card({
  title,
  children,
  className = '',
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`min-w-0 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-6 ${className}`}
    >
      {title && (
        <h2 className="mb-5 border-b border-slate-100 pb-3 text-base font-bold tracking-tight text-slate-900 sm:text-lg">
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'danger';
};

export function Btn({
  variant = 'primary',
  className = '',
  type = 'button',
  ...p
}: BtnProps) {
  const variants = {
    primary:
      'border border-blue-700 bg-blue-700 text-white shadow-sm hover:border-blue-800 hover:bg-blue-800 focus-visible:ring-blue-500',
    danger:
      'border border-red-700 bg-red-700 text-white shadow-sm hover:bg-red-800 focus-visible:ring-red-500',
    ghost:
      'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-blue-500',
  };

  return (
    <button
      {...p}
      type={type}
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition duration-150 focus-visible:outline-none focus-visible:ring-4 disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${className}`}
    />
  );
}

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  id: string;
};

export function Field({
  label,
  error,
  id,
  className = '',
  required,
  ...p
}: FieldProps) {
  return (
    <div className="mb-4 min-w-0">
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-semibold text-slate-700"
      >
        {label}
        {required && (
          <span className="ml-1 text-red-600" aria-hidden="true">
            *
          </span>
        )}
      </label>

      <input
        {...p}
        id={id}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : undefined}
        className={`min-h-11 w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 ${
          error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-300'
        } ${className}`}
      />

      {error && (
        <p
          id={`${id}-err`}
          className="mt-1.5 flex items-start gap-1.5 text-xs font-medium text-red-700"
        >
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  id: string;
};

export function TextArea({
  label,
  id,
  className = '',
  required,
  ...p
}: TextAreaProps) {
  return (
    <div className="mb-4 min-w-0">
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-semibold text-slate-700"
      >
        {label}
        {required && (
          <span className="ml-1 text-red-600" aria-hidden="true">
            *
          </span>
        )}
      </label>

      <textarea
        {...p}
        id={id}
        rows={3}
        required={required}
        className={`w-full resize-y rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-100 ${className}`}
      />
    </div>
  );
}

const colors: Record<string, string> = {
  ACTIVE: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  APPROVED: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  RESOLVED: 'border-blue-200 bg-blue-50 text-blue-700',
  REJECTED: 'border-red-200 bg-red-50 text-red-700',
  PENDING_REVIEW: 'border-amber-200 bg-amber-50 text-amber-800',
  PENDING: 'border-amber-200 bg-amber-50 text-amber-800',
  POTENTIAL_MATCH: 'border-violet-200 bg-violet-50 text-violet-700',
  CONFIRMED: 'border-purple-200 bg-purple-50 text-purple-700',
  FAILED: 'border-red-200 bg-red-50 text-red-700',
  LOW: 'border-slate-200 bg-slate-50 text-slate-700',
  MEDIUM: 'border-blue-200 bg-blue-50 text-blue-700',
  HIGH: 'border-orange-200 bg-orange-50 text-orange-700',
  CRITICAL: 'border-red-200 bg-red-50 text-red-700',
};

export function Badge({ value }: { value: string }) {
  const label = value.replace(/_/g, ' ');

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
        colors[value] ?? 'border-slate-200 bg-slate-100 text-slate-700'
      }`}
    >
      {label}
    </span>
  );
}

export function useAsync<T>(fn: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const reload = useCallback(() => {
    setLoading(true);

    fn()
      .then((result) => {
        setData(result);
        setError(null);
      })
      .catch((e: unknown) => {
        setError(
          e instanceof ApiError ? e.message : 'Unexpected error',
        );
      })
      .finally(() => setLoading(false));
  }, deps);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, error, loading, reload };
}

export const fmt = (s?: string) =>
  s ? new Date(s).toLocaleString() : '';

export function Pager({
  page,
  size,
  total,
  onPage,
}: {
  page: number;
  size: number;
  total: number;
  onPage: (p: number) => void;
}) {
  const last = Math.max(0, Math.ceil(total / size) - 1);
  const current = Math.min(page + 1, last + 1);

  return (
    <nav
      aria-label="Pagination"
      className="mt-5 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-sm text-slate-500">
        Page <span className="font-semibold text-slate-900">{current}</span>
        {' of '}
        <span className="font-semibold text-slate-900">{last + 1}</span>
        <span className="ml-2 text-slate-400">
          ({total.toLocaleString()} total)
        </span>
      </p>

      <div className="flex items-center gap-2">
        <Btn
          variant="ghost"
          disabled={page <= 0}
          onClick={() => onPage(page - 1)}
        >
          <ChevronLeft size={16} />
          Previous
        </Btn>

        <Btn
          variant="ghost"
          disabled={page >= last}
          onClick={() => onPage(page + 1)}
        >
          Next
          <ChevronRight size={16} />
        </Btn>
      </div>
    </nav>
  );
}
