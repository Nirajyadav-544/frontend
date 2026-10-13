
import { FormEvent, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  ClipboardList,
  FilePlus2,
  FileSearch,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Upload,
  UserRound,
} from 'lucide-react';

import { api, ApiError, CaseRow, imageUrl, Page, qs } from '../api';
import { useAuth } from '../auth';
import {
  Badge,
  Btn,
  Card,
  Empty,
  ErrorBox,
  Field,
  Loading,
  Pager,
  TextArea,
  fmt,
  useAsync,
} from '../ui';

const STATUSES = [
  'DRAFT',
  'PENDING_REVIEW',
  'APPROVED',
  'ACTIVE',
  'UNDER_INVESTIGATION',
  'POTENTIAL_MATCH',
  'RESOLVED',
  'CLOSED',
  'REJECTED',
];

function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-blue-700">
          <ShieldCheck size={15} />
          {eyebrow}
        </p>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}

export function CaseList() {
  const { user } = useAuth();
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(0);

  const { data, error, loading } = useAsync(
    () => api<Page<CaseRow>>('/cases' + qs({ status, q, page })),
    [status, q, page],
  );

  const heading =
    user?.role === 'INVESTIGATOR'
      ? 'Assigned cases'
      : user?.role === 'ADMIN'
        ? 'All cases'
        : 'My reports';

  return (
    <div className="mx-auto max-w-[1440px] space-y-6">
      <PageHeading
        eyebrow="Case management"
        title={heading}
        description="Find reports, review case status and open a record to view its details."
        action={
          <Link
            to="/cases/new"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <FilePlus2 size={17} />
            New report
          </Link>
        }
      />

      <Card className="!p-4 sm:!p-5">
        <div className="mb-4 flex items-center gap-2">
          <FileSearch size={18} className="text-slate-500" />
          <h2 className="text-sm font-bold text-slate-900">
            Search and filter
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Field
            id="cq"
            label="Search by name"
            placeholder="Enter a person's name"
            value={q}
            onChange={(e) => {
              setPage(0);
              setQ(e.target.value);
            }}
          />

          <div className="mb-3">
            <label
              htmlFor="cs"
              className="mb-1.5 block text-sm font-semibold text-slate-700"
            >
              Case status
            </label>
            <select
              id="cs"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              value={status}
              onChange={(e) => {
                setPage(0);
                setStatus(e.target.value);
              }}
            >
              <option value="">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {loading && <Loading />}
      {error && <ErrorBox message={error} />}

      {data && (
        <Card className="!overflow-hidden !p-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="font-bold text-slate-900">Case records</h2>
              <p className="mt-1 text-xs text-slate-500">
                Review each record according to your access permissions.
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {data.total} records
            </span>
          </div>

          {data.items.length === 0 ? (
            <div className="p-5">
              <Empty>No cases match your current filters.</Empty>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-4 font-semibold">Person / case</th>
                      <th className="px-4 py-4 font-semibold">Status</th>
                      <th className="px-4 py-4 font-semibold">Priority</th>
                      <th className="px-4 py-4 font-semibold">Last seen</th>
                      <th className="px-4 py-4 font-semibold">Reported</th>
                      <th className="px-5 py-4 text-right font-semibold">View</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.items.map((c) => (
                      <tr
                        key={c.id}
                        className="transition hover:bg-slate-50/80"
                      >
                        <td className="px-5 py-4">
                          <Link
                            to={`/cases/${c.id}`}
                            className="font-bold text-slate-900 transition hover:text-blue-700"
                          >
                            {c.fullName}
                          </Link>
                          <p className="mt-1 text-xs text-slate-400">
                            Case ID: {c.id}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <Badge value={c.status} />
                        </td>
                        <td className="px-4 py-4">
                          <Badge value={c.priority} />
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-slate-600">
                          {fmt(c.lastSeenAt) || '—'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-slate-600">
                          {fmt(c.createdAt) || '—'}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Link
                            to={`/cases/${c.id}`}
                            aria-label={`View case for ${c.fullName}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                          >
                            Details <ArrowRight size={14} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-slate-100 px-5 py-3">
                <Pager
                  page={data.page}
                  size={data.size}
                  total={data.total}
                  onPage={setPage}
                />
              </div>
            </>
          )}
        </Card>
      )}
    </div>
  );
}

const empty = {
  fullName: '',
  aliases: '',
  age: '',
  gender: '',
  description: '',
  lastSeenAt: '',
  lastSeenLocation: '',
  city: '',
  country: '',
  latitude: '',
  longitude: '',
  circumstances: '',
  priority: 'MEDIUM',
  contactInfo: '',
  consentConfirmed: false,
  consentNote: '',
};

export function validateCase(v: typeof empty): Record<string, string> {
  const e: Record<string, string> = {};

  if (!v.fullName.trim()) e.fullName = 'Full name is required';
  if (!v.lastSeenAt) e.lastSeenAt = 'Last-seen date and time is required';
  if (!v.lastSeenLocation.trim()) {
    e.lastSeenLocation = 'Last-seen location is required';
  }

  if (v.age !== '' && (!Number.isFinite(Number(v.age)) || Number(v.age) < 0 || Number(v.age) > 120)) {
    e.age = 'Age must be between 0 and 120';
  }

  if (v.latitude !== '' && (!Number.isFinite(Number(v.latitude)) || Math.abs(Number(v.latitude)) > 90)) {
    e.latitude = 'Latitude must be between -90 and 90';
  }

  if (v.longitude !== '' && (!Number.isFinite(Number(v.longitude)) || Math.abs(Number(v.longitude)) > 180)) {
    e.longitude = 'Longitude must be between -180 and 180';
  }

  if (!v.consentConfirmed) {
    e.consentConfirmed = 'Confirm your lawful authorization before submitting';
  }

  return e;
}

export function CaseForm() {
  const { id } = useParams();
  const nav = useNavigate();
  const [v, setV] = useState(empty);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const loaded = useAsync(async () => {
    if (!id) return null;

    const c = await api<CaseRow>(`/cases/${id}`);
    const values = Object.fromEntries(
      Object.entries(c)
        .filter(([k]) => k in empty)
        .map(([k, x]) => [k, x ?? '']),
    );

    setV({
      ...empty,
      ...values,
      lastSeenAt: c.lastSeenAt ? c.lastSeenAt.slice(0, 16) : '',
    } as typeof empty);

    return c;
  }, [id]);

  const set = (k: keyof typeof empty) =>
    (e: { target: { value: string } }) => {
      const value = e.target.value;
      setV((current) => ({ ...current, [k]: value }));
      setErrs((current) => {
        const next = { ...current };
        delete next[k];
        return next;
      });
    };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const ve = validateCase(v);
    setErrs(ve);

    if (Object.keys(ve).length) return;

    setBusy(true);

    try {
      const num = (s: string) => (s === '' ? null : Number(s));

      const body = {
        ...v,
        age: num(v.age),
        latitude: num(v.latitude),
        longitude: num(v.longitude),
        lastSeenAt: new Date(v.lastSeenAt).toISOString(),
      };

      const c = id
        ? await api<CaseRow>(`/cases/${id}`, { method: 'PUT', body })
        : await api<CaseRow>('/cases', { method: 'POST', body });

      nav(`/cases/${c.id}`);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.fields) setErrs(err.fields);
      } else {
        setError('Could not save the report. Please try again.');
      }
    } finally {
      setBusy(false);
    }
  };

  if (id && loaded.loading) return <Loading />;
  if (id && loaded.error) return <ErrorBox message={loaded.error} />;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        to={id ? `/cases/${id}` : '/cases'}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-700"
      >
        <ArrowLeft size={16} /> Back
      </Link>

      <PageHeading
        eyebrow="Report management"
        title={id ? 'Edit case report' : 'Create a report'}
        description="Enter accurate information. Sensitive details should only be included when needed for authorized case handling."
      />

      <form onSubmit={submit} noValidate className="space-y-5">
        {error && <ErrorBox message={error} />}

        <Card>
          <div className="mb-5 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <UserRound size={20} />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">Person information</h2>
              <p className="mt-1 text-sm text-slate-500">
                Basic details to help authorized teams identify the report.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
            <Field id="fullName" label="Full name *" value={v.fullName} error={errs.fullName} onChange={set('fullName')} required />
            <Field id="aliases" label="Known aliases" value={v.aliases} onChange={set('aliases')} />
            <Field id="age" label="Age / estimated age" type="number" min="0" max="120" value={v.age} error={errs.age} onChange={set('age')} />
            <Field id="gender" label="Gender description" value={v.gender} onChange={set('gender')} />
            <div className="md:col-span-2">
              <TextArea
                id="description"
                label="Physical description, clothing and distinctive characteristics"
                value={v.description}
                onChange={set('description')}
              />
            </div>
          </div>
        </Card>

        <Card>
          <div className="mb-5 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
              <MapPin size={20} />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">Last known location</h2>
              <p className="mt-1 text-sm text-slate-500">
                Record the last known date, time and location.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
            <Field id="lastSeenAt" label="Last seen (date and time) *" type="datetime-local" value={v.lastSeenAt} error={errs.lastSeenAt} onChange={set('lastSeenAt')} required />
            <Field id="lastSeenLocation" label="Last-seen location *" value={v.lastSeenLocation} error={errs.lastSeenLocation} onChange={set('lastSeenLocation')} required />
            <Field id="city" label="City" value={v.city} onChange={set('city')} />
            <Field id="country" label="Country" value={v.country} onChange={set('country')} />
            <Field id="latitude" label="Latitude (optional)" type="number" step="any" value={v.latitude} error={errs.latitude} onChange={set('latitude')} />
            <Field id="longitude" label="Longitude (optional)" type="number" step="any" value={v.longitude} error={errs.longitude} onChange={set('longitude')} />
          </div>
        </Card>

        <Card>
          <div className="mb-5 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <ClipboardList size={20} />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">Case circumstances</h2>
              <p className="mt-1 text-sm text-slate-500">
                Keep confidential details accurate and limited to what is necessary.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <TextArea
                id="circumstances"
                label="Circumstances of disappearance (private)"
                value={v.circumstances}
                onChange={set('circumstances')}
              />
            </div>
            <Field id="contactInfo" label="Contact / reporting authority (private)" value={v.contactInfo} onChange={set('contactInfo')} />
            <div className="mb-3">
              <label htmlFor="priority" className="mb-1.5 block text-sm font-semibold text-slate-700">
                Priority
              </label>
              <select
                id="priority"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                value={v.priority}
                onChange={set('priority')}
              >
                {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="font-bold text-slate-900">Authorization confirmation</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Confirm that you are legally authorized to submit this report and any accompanying photographs.
          </p>

          <label className="mt-4 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 shrink-0 accent-blue-600"
              checked={v.consentConfirmed}
              onChange={(e) => setV((current) => ({ ...current, consentConfirmed: e.target.checked }))}
            />
            <span>
              I confirm that I am lawfully authorized to submit this report and any photographs.
            </span>
          </label>

          {errs.consentConfirmed && (
            <p role="alert" className="mt-2 text-sm text-red-700">{errs.consentConfirmed}</p>
          )}

          <div className="mt-4">
            <Field id="consentNote" label="Authorization details (optional)" value={v.consentNote} onChange={set('consentNote')} />
          </div>
        </Card>

        <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
          <Link
            to={id ? `/cases/${id}` : '/cases'}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </Link>
          <Btn
            type="submit"
            disabled={busy}
            className="inline-flex items-center justify-center gap-2 !rounded-xl !px-5 !py-3"
          >
            {busy ? 'Saving...' : id ? 'Save changes' : 'Create draft'}
            {!busy && <ArrowRight size={16} />}
          </Btn>
        </div>
      </form>
    </div>
  );
}

export function CaseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const nav = useNavigate();

  const { data: c, error, loading, reload } = useAsync(
    () => api<CaseRow>(`/cases/${id}`),
    [id],
  );

  const hist = useAsync(
    () => api<{ from?: string; to: string; createdAt: string; note?: string }[]>(`/cases/${id}/history`),
    [id],
  );

  const invs = useAsync(
    () => user?.role === 'ADMIN'
      ? api<{ id: string; displayName: string }[]>('/admin/investigators')
      : Promise.resolve([]),
    [user?.role],
  );

  const [msg, setMsg] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const file = useRef<HTMLInputElement>(null);

  const run = async (fn: () => Promise<unknown>, ok?: string) => {
    setMsg('');
    setBusy(true);

    try {
      await fn();
      if (ok) setMsg(ok);
      await Promise.all([reload(), hist.reload()]);
    } catch (e) {
      setMsg(e instanceof ApiError ? e.message : 'Action failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Loading />;
  if (error || !c) return <ErrorBox message={error ?? 'Case not found'} />;

  const canEditPhotos =
    c.canManage ||
    (c.reporterId === user?.id &&
      ['DRAFT', 'PENDING_REVIEW', 'REJECTED'].includes(c.status));

  const canEditCase =
    (c.reporterId === user?.id && ['DRAFT', 'REJECTED'].includes(c.status)) ||
    user?.role === 'ADMIN';

  const canDelete =
    user?.role === 'ADMIN' ||
    (c.reporterId === user?.id && c.status === 'DRAFT');

  return (
    <div className="mx-auto max-w-[1440px] space-y-6">
      <Link
        to="/cases"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-700"
      >
        <ArrowLeft size={16} /> Back to cases
      </Link>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-blue-700">
              Case record
            </p>
            <h1 className="break-words text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
              {c.fullName}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge value={c.status} />
              <Badge value={c.priority} />
              {c.publicVisible && (
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Public listing enabled
                </span>
              )}
            </div>
            <p className="mt-3 text-sm text-slate-500">
              Case ID: <span className="break-all font-mono">{c.id}</span>
            </p>
          </div>

          {canEditCase && (
            <Link
              to={`/cases/${c.id}/edit`}
              className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Edit report
            </Link>
          )}
        </div>
      </div>

      {msg && (
        <div role="status" className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
          {msg}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Card>
          <h2 className="mb-5 font-bold text-slate-900">Case information</h2>

          <dl className="divide-y divide-slate-100">
            {([
              ['Age', c.age],
              ['Gender', c.gender],
              ['Aliases', c.aliases],
              ['Last seen', fmt(c.lastSeenAt)],
              ['Location', c.lastSeenLocation],
              ['City', c.city],
              ['Country', c.country],
              ['Priority', c.priority],
              ['Description', c.description],
              ['Circumstances', c.circumstances],
              ['Contact', c.contactInfo],
              ['Authorization', c.consentNote],
            ] as [string, unknown][])
              .filter(([, value]) => value !== undefined && value !== null && value !== '')
              .map(([label, value]) => (
                <div key={label} className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-[140px_1fr] sm:gap-4">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {label}
                  </dt>
                  <dd className="break-words whitespace-pre-wrap text-sm leading-6 text-slate-800">
                    {String(value)}
                  </dd>
                </div>
              ))}
          </dl>

          <div className="mt-5 flex flex-wrap gap-2">
            {(c.status === 'ACTIVE' || c.publicVisible) && (
              <Link
                to={`/sightings/new?caseId=${c.id}`}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <MapPin size={16} /> Submit sighting
              </Link>
            )}

            {canDelete && (
              <Btn
                variant="danger"
                disabled={busy}
                onClick={() => {
                  if (window.confirm('Delete this case? Associated embeddings will be purged according to the backend workflow.')) {
                    void run(async () => {
                      await api(`/cases/${c.id}`, { method: 'DELETE' });
                      nav('/cases');
                    });
                  }
                }}
              >
                Delete case
              </Btn>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="mb-1 font-bold text-slate-900">Investigation workflow</h2>
          <p className="mb-5 text-sm leading-6 text-slate-500">
            Available actions depend on your role and the current case status.
          </p>

          <TextArea
            id="tnote"
            label="Workflow note (optional)"
            placeholder="Add a concise note for the case history..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          <div className="flex flex-wrap gap-2">
            {(c.allowedTransitions ?? []).length === 0 && (
              <Empty>No workflow actions are available for this status.</Empty>
            )}

            {(c.allowedTransitions ?? []).map((transition) => (
              <Btn
                key={transition}
                disabled={busy}
                variant={
                  transition === 'REJECTED' || transition === 'CLOSED'
                    ? 'danger'
                    : 'primary'
                }
                onClick={() => {
                  void run(
                    () => api(`/cases/${c.id}/transition`, {
                      method: 'POST',
                      body: { to: transition, note },
                    }),
                    `Status changed to ${transition.replace(/_/g, ' ')}`,
                  );
                }}
              >
                {transition.replace(/_/g, ' ')}
              </Btn>
            ))}
          </div>

          {user?.role === 'ADMIN' && (
            <div className="mt-6 border-t border-slate-100 pt-5">
              <label htmlFor="assign" className="mb-2 block text-sm font-semibold text-slate-700">
                Assign investigator
              </label>

              <select
                id="assign"
                disabled={busy}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                value={c.assignedInvestigatorId ?? ''}
                onChange={(e) => {
                  const investigatorId = e.target.value;
                  if (!investigatorId) return;

                  void run(
                    () => api(`/cases/${c.id}/assign`, {
                      method: 'POST',
                      body: { investigatorId },
                    }),
                    'Investigator assignment updated',
                  );
                }}
              >
                <option value="">Choose investigator</option>
                {invs.data?.map((investigator) => (
                  <option key={investigator.id} value={investigator.id}>
                    {investigator.displayName}
                  </option>
                ))}
              </select>
              {invs.error && (
                <p className="mt-2 text-sm text-red-700">{invs.error}</p>
              )}
            </div>
          )}
        </Card>
      </div>

      <Card>
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-bold text-slate-900">Private photographs</h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
              Restricted case media. Only photos with exactly one detectable face are eligible for indexing under the current workflow. Indexing does not prove identity.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 self-start rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
            <ShieldCheck size={14} /> Restricted access
          </span>
        </div>

        {(c.photos ?? []).length === 0 ? (
          <Empty>No photographs have been added to this case.</Empty>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {c.photos!.map((photo) => (
              <figure key={photo.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <img
                  alt="Restricted case photograph"
                  src={imageUrl(c.id, photo.id)}
                  loading="lazy"
                  className="h-52 w-full bg-slate-100 object-cover"
                />
                <figcaption className="space-y-3 p-3">
                  <Badge value={photo.indexed ? 'INDEXED' : 'NOT_INDEXED'} />
                  <p className="break-all text-xs text-slate-500">
                    Photo ID: {photo.id}
                  </p>

                  {canEditPhotos && (
                    <div className="flex flex-wrap gap-2">
                      {!photo.indexed && c.canManage && (
                        <Btn
                          variant="ghost"
                          disabled={busy}
                          onClick={() => {
                            void run(
                              () => api(`/cases/${c.id}/photos/${photo.id}/reindex`, { method: 'POST' }),
                              'Re-index request submitted',
                            );
                          }}
                        >
                          <RefreshCw size={14} /> Index
                        </Btn>
                      )}

                      <Btn
                        variant="danger"
                        disabled={busy}
                        onClick={() => {
                          if (window.confirm('Delete this photograph?')) {
                            void run(
                              () => api(`/cases/${c.id}/photos/${photo.id}`, { method: 'DELETE' }),
                              'Photograph deleted',
                            );
                          }
                        }}
                      >
                        Delete
                      </Btn>
                    </div>
                  )}
                </figcaption>
              </figure>
            ))}
          </div>
        )}

        {canEditPhotos && (
          <form
            className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4"
            onSubmit={(e) => {
              e.preventDefault();
              const selectedFile = file.current?.files?.[0];

              if (!selectedFile) {
                setMsg('Choose a JPEG or PNG photograph first.');
                return;
              }

              if (!['image/jpeg', 'image/png'].includes(selectedFile.type)) {
                setMsg('Only JPEG and PNG images are accepted by this form.');
                return;
              }

              const form = new FormData();
              form.append('file', selectedFile);

              void run(async () => {
                const result = await api<{ indexing: string }>(
                  `/cases/${c.id}/photos`,
                  { form },
                );
                setMsg(`Upload completed. Indexing status: ${result.indexing}`);
                if (file.current) file.current.value = '';
              });
            }}
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm">
                <Upload size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Add a photograph</h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Select an authorized JPEG or PNG image. Server-side file-size and content validation must also be enforced.
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <label htmlFor="photo" className="sr-only">Select photograph</label>
              <input
                id="photo"
                ref={file}
                type="file"
                accept="image/jpeg,image/png"
                className="min-w-0 flex-1 text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-2 file:text-sm file:font-semibold file:text-slate-700 hover:file:bg-slate-100"
              />
              <Btn type="submit" disabled={busy}>
                <Upload size={16} /> Upload photo
              </Btn>
            </div>
          </form>
        )}
      </Card>

      <Card>
        <h2 className="mb-5 font-bold text-slate-900">Status history</h2>

        {hist.loading ? (
          <Loading />
        ) : hist.error ? (
          <ErrorBox message={hist.error} />
        ) : hist.data?.length ? (
          <ol className="space-y-0">
            {hist.data.map((entry, index) => (
              <li key={`${entry.createdAt}-${index}`} className="relative flex gap-3 pb-5 last:pb-0">
                <div className="flex flex-col items-center">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                    <ClipboardList size={15} />
                  </span>
                  {index < hist.data!.length - 1 && (
                    <span className="mt-1 w-px flex-1 bg-slate-200" />
                  )}
                </div>
                <div className="min-w-0 flex-1 pt-1">
                  <p className="text-sm font-semibold text-slate-800">
                    {entry.from ?? 'Initial status'} <ArrowRight className="mx-1 inline" size={13} /> {entry.to}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{fmt(entry.createdAt)}</p>
                  {entry.note && (
                    <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
                      {entry.note}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <Empty>No status history is available yet.</Empty>
        )}
      </Card>
    </div>
  );
}
