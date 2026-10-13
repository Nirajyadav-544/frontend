
import { useState } from 'react';
import {
  Activity,
  CheckCircle2,
  Database,
  FileSearch,
  Search,
  Server,
  ShieldCheck,
  Users,
  XCircle,
} from 'lucide-react';

import { api, ApiError, Page, User } from '../api';
import {
  Badge,
  Card,
  Empty,
  ErrorBox,
  Field,
  Loading,
  Pager,
  fmt,
  useAsync,
} from '../ui';

const inputClass =
  'rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10';

const selectClass =
  'max-w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10';

function PageHeading({
  eyebrow,
  title,
  description,
  icon,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-blue-700">
        {icon}
        {eyebrow}
      </p>
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
        {title}
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function ResultMessage({ message }: { message: string }) {
  if (!message) return null;

  return (
    <div
      role="status"
      className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"
    >
      <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

function Metric({
  label,
  value,
  icon,
  tone = 'blue',
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  tone?: 'blue' | 'green' | 'amber';
}) {
  const tones = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
  };

  return (
    <Card className="!p-4">
      <div className="flex items-center gap-3">
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}>
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-1 break-words text-xl font-extrabold text-slate-950">
            {value}
          </p>
        </div>
      </div>
    </Card>
  );
}

export function AdminUsers() {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(0);
  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [busyId, setBusyId] = useState('');

  const {
    data,
    error,
    loading,
    reload,
  } = useAsync(
    () =>
      api<Page<User & { createdAt: string }>>(
        `/admin/users?page=${page}&q=${encodeURIComponent(q)}`,
      ),
    [page, q],
  );

  const patch = async (
    id: string,
    body: { role?: string; status?: string },
  ) => {
    setMsg('');
    setErrorMsg('');
    setBusyId(id);

    try {
      await api(`/admin/users/${id}`, {
        method: 'PUT',
        body,
      });

      setMsg('User account updated successfully.');
      await reload();
    } catch (err) {
      setErrorMsg(
        err instanceof ApiError
          ? err.message
          : 'Unable to update this account.',
      );
    } finally {
      setBusyId('');
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeading
        eyebrow="Administration"
        title="User management"
        description="Review accounts, manage assigned roles and control account access."
        icon={<Users size={15} />}
      />

      {data && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Metric
            label="Accounts on this page"
            value={data.items.length}
            icon={<Users size={20} />}
          />
          <Metric
            label="Total matching accounts"
            value={data.total.toLocaleString()}
            icon={<ShieldCheck size={20} />}
            tone="green"
          />
        </div>
      )}

      <Card>
        <div className="mb-4">
          <h2 className="font-bold text-slate-900">Search accounts</h2>
          <p className="mt-1 text-sm text-slate-500">
            Search by the terms supported by your user API.
          </p>
        </div>

        <div className="relative max-w-xl">
          <Search
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            id="user-search"
            aria-label="Search users"
            placeholder="Search users..."
            value={q}
            onChange={(e) => {
              setPage(0);
              setQ(e.target.value);
              setMsg('');
              setErrorMsg('');
            }}
            className={`w-full pl-10 ${inputClass}`}
          />
        </div>
      </Card>

      <ResultMessage message={msg} />
      {errorMsg && <ErrorBox message={errorMsg} />}
      {loading && <Loading />}
      {error && <ErrorBox message={error} />}

      {data && data.items.length === 0 && !loading && (
        <Card>
          <Empty>
            <div className="flex flex-col items-center gap-2">
              <Users size={28} />
              <span className="font-semibold">No accounts found</span>
              <span className="text-sm">
                Try a different search term.
              </span>
            </div>
          </Empty>
        </Card>
      )}

      {data && data.items.length > 0 && (
        <Card className="!overflow-hidden !p-0">
          <div className="flex flex-col gap-1 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold text-slate-900">
                Registered accounts
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Select a role or status to submit an update.
              </p>
            </div>
            <Badge value="ADMIN ONLY" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">User</th>
                  <th className="px-4 py-4 font-semibold">Role</th>
                  <th className="px-4 py-4 font-semibold">Account status</th>
                  <th className="px-4 py-4 font-semibold">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.items.map((u) => (
                  <tr
                    key={u.id}
                    className="transition hover:bg-slate-50/70"
                  >
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900">
                        {u.displayName}
                      </div>
                      <div className="mt-1 break-all text-xs text-slate-500">
                        {u.email}
                      </div>
                      <div className="mt-1 font-mono text-[10px] text-slate-400">
                        ID: {u.id.slice(0, 8)}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <label className="sr-only" htmlFor={`r-${u.id}`}>
                        Role for {u.email}
                      </label>
                      <select
                        id={`r-${u.id}`}
                        className={selectClass}
                        value={u.role}
                        disabled={busyId !== ''}
                        onChange={(e) =>
                          patch(u.id, { role: e.target.value })
                        }
                      >
                        {['REGISTERED_USER', 'INVESTIGATOR', 'ADMIN'].map(
                          (role) => (
                            <option key={role} value={role}>
                              {role.replace(/_/g, ' ')}
                            </option>
                          ),
                        )}
                      </select>
                    </td>

                    <td className="px-4 py-4">
                      <label className="sr-only" htmlFor={`s-${u.id}`}>
                        Status for {u.email}
                      </label>
                      <select
                        id={`s-${u.id}`}
                        className={selectClass}
                        value={u.status}
                        disabled={busyId !== ''}
                        onChange={(e) =>
                          patch(u.id, { status: e.target.value })
                        }
                      >
                        {['ACTIVE', 'SUSPENDED', 'DISABLED'].map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                      {busyId === u.id && (
                        <p className="mt-1 text-xs text-blue-600">
                          Saving...
                        </p>
                      )}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-slate-500">
                      {fmt(u.createdAt)}
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
        </Card>
      )}
    </div>
  );
}

export function AdminAudit() {
  const [action, setAction] = useState('');
  const [page, setPage] = useState(0);

  const {
    data,
    error,
    loading,
  } = useAsync(
    () =>
      api<
        Page<{
          id: number;
          action: string;
          entityType?: string;
          entityId?: string;
          detail?: string;
          actor?: string;
          createdAt: string;
        }>
      >(
        `/admin/audit?page=${page}&action=${encodeURIComponent(action)}`,
      ),
    [page, action],
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeading
        eyebrow="Security and accountability"
        title="Audit log"
        description="Review recorded system actions, actors and affected entities."
        icon={<FileSearch size={15} />}
      />

      {data && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Metric
            label="Entries on this page"
            value={data.items.length}
            icon={<Activity size={20} />}
          />
          <Metric
            label="Total matching entries"
            value={data.total.toLocaleString()}
            icon={<ShieldCheck size={20} />}
            tone="amber"
          />
        </div>
      )}

      <Card>
        <div className="mb-4">
          <h2 className="font-bold text-slate-900">Filter audit entries</h2>
          <p className="mt-1 text-sm text-slate-500">
            Filter by action name using the existing audit API.
          </p>
        </div>

        <div className="max-w-xl">
          <Field
            id="audit-action"
            label="Action"
            placeholder="e.g. CASE_UPDATED"
            value={action}
            onChange={(e) => {
              setPage(0);
              setAction(e.target.value);
            }}
          />
        </div>
      </Card>

      {loading && <Loading />}
      {error && <ErrorBox message={error} />}

      {data && data.items.length === 0 && !loading && (
        <Card>
          <Empty>
            <div className="flex flex-col items-center gap-2">
              <FileSearch size={28} />
              <span className="font-semibold">No audit entries found</span>
              <span className="text-sm">
                Change the filter to search for other actions.
              </span>
            </div>
          </Empty>
        </Card>
      )}

      {data && data.items.length > 0 && (
        <Card className="!overflow-hidden !p-0">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="font-bold text-slate-900">Activity records</h2>
            <p className="mt-1 text-sm text-slate-500">
              Details depend on the information recorded by the backend.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">Timestamp</th>
                  <th className="px-4 py-4 font-semibold">Actor</th>
                  <th className="px-4 py-4 font-semibold">Action</th>
                  <th className="px-4 py-4 font-semibold">Entity</th>
                  <th className="px-4 py-4 font-semibold">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.items.map((entry) => (
                  <tr
                    key={entry.id}
                    className="align-top transition hover:bg-slate-50/70"
                  >
                    <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                      {fmt(entry.createdAt)}
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-700">
                      {entry.actor || 'System'}
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-800">
                        {entry.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-medium text-slate-800">
                        {entry.entityType || '—'}
                      </div>
                      {entry.entityId && (
                        <div
                          className="mt-1 font-mono text-xs text-slate-400"
                          title={entry.entityId}
                        >
                          {entry.entityId.slice(0, 8)}
                        </div>
                      )}
                    </td>
                    <td className="max-w-sm whitespace-pre-wrap break-words px-4 py-4 text-slate-600">
                      {entry.detail || '—'}
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
        </Card>
      )}
    </div>
  );
}

export function AdminSystem() {
  const {
    data,
    error,
    loading,
  } = useAsync(
    () =>
      api<{
        database: string;
        aiService: {
          status: string;
          models_loaded?: boolean;
          detail?: string;
        };
      }>('/admin/system'),
    [],
  );

  const databaseOK = data?.database?.toUpperCase() === 'UP';
  const aiOK = data?.aiService?.status?.toUpperCase() === 'UP';
  const modelsLoaded = data?.aiService?.models_loaded === true;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeading
        eyebrow="Infrastructure overview"
        title="System health"
        description="Review the reported status of the database and AI service."
        icon={<Activity size={15} />}
      />

      {loading && <Loading />}
      {error && <ErrorBox message={error} />}

      {data && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Metric
              label="Database status"
              value={data.database || 'Unknown'}
              icon={<Database size={20} />}
              tone={databaseOK ? 'green' : 'amber'}
            />
            <Metric
              label="AI service status"
              value={data.aiService.status || 'Unknown'}
              icon={<Server size={20} />}
              tone={aiOK && modelsLoaded ? 'green' : 'amber'}
            />
          </div>

          <Card>
            <div className="mb-5">
              <h2 className="font-bold text-slate-900">
                Service availability
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                These indicators reflect the status returned by the backend.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="rounded-lg bg-slate-100 p-2 text-slate-600">
                    <Database size={19} />
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900">
                      PostgreSQL database
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Backend-reported database connectivity.
                    </p>
                  </div>
                </div>
                <Badge value={data.database || 'UNKNOWN'} />
              </div>

              <div className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="rounded-lg bg-slate-100 p-2 text-slate-600">
                    <Server size={19} />
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900">AI service</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Face-processing service availability.
                    </p>
                  </div>
                </div>
                <Badge value={data.aiService.status || 'UNKNOWN'} />
              </div>

              <div className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="rounded-lg bg-slate-100 p-2 text-slate-600">
                    {modelsLoaded ? (
                      <CheckCircle2 size={19} />
                    ) : (
                      <XCircle size={19} />
                    )}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900">
                      AI models loaded
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Whether the service reports its models as loaded.
                    </p>
                  </div>
                </div>
                <Badge value={modelsLoaded ? 'LOADED' : 'NOT_LOADED'} />
              </div>
            </div>

            {data.aiService.detail && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-semibold text-amber-900">
                  AI service information
                </p>
                <p className="mt-1 break-words text-sm leading-6 text-amber-800">
                  {data.aiService.detail}
                </p>
              </div>
            )}
          </Card>
        </>
      )}

      <Card>
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <ShieldCheck size={21} />
          </span>
          <div>
            <h2 className="font-bold text-slate-900">
              Configuration and security
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Application settings are managed through environment variables
              and server configuration. This page does not display secret
              values.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {[
            ['Database connection', 'Environment configuration'],
            ['JWT authentication', 'Signing secret and token policy'],
            ['CORS policy', 'Allowed frontend origins'],
            ['File storage', 'Storage directory and access controls'],
            ['AI integration', 'Service URL and protected token'],
            ['Matching policy', 'Thresholds and human-review requirements'],
            ['Data retention', 'Retention and deletion policy'],
            ['Audit records', 'Recorded security-relevant actions'],
          ].map(([label, description]) => (
            <div
              key={label}
              className="rounded-xl border border-slate-200 bg-slate-50/70 p-4"
            >
              <p className="text-sm font-semibold text-slate-800">{label}</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                {description}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-4 text-xs leading-5 text-slate-500">
          These configuration descriptions are informational. They do not
          independently verify that every security control is configured
          correctly.
        </p>
      </Card>
    </div>
  );
}
