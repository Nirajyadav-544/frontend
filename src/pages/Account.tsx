
import { FormEvent, useEffect, useState } from 'react';
import {
  Bell,
  CheckCheck,
  CircleUserRound,
  Clock3,
  Mail,
  ShieldCheck,
  UserRound,
} from 'lucide-react';

import { api, ApiError, Page } from '../api';
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
  fmt,
  useAsync,
} from '../ui';

interface Note {
  id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export function Notifications() {
  const [page, setPage] = useState(0);
  const [actionError, setActionError] = useState('');
  const [busyId, setBusyId] = useState('');

  const {
    data,
    error,
    loading,
    reload,
  } = useAsync(
    () => api<Page<Note> & { unread: number }>(`/notifications?page=${page}`),
    [page],
  );

  const markOneRead = async (id: string) => {
    setBusyId(id);
    setActionError('');

    try {
      await api(`/notifications/${id}/read`, { method: 'POST' });
      await reload();
    } catch (err) {
      setActionError(
        err instanceof ApiError
          ? err.message
          : 'Could not update the notification.',
      );
    } finally {
      setBusyId('');
    }
  };

  const markAllRead = async () => {
    setBusyId('all');
    setActionError('');

    try {
      await api('/notifications/read-all', { method: 'POST' });
      await reload();
    } catch (err) {
      setActionError(
        err instanceof ApiError
          ? err.message
          : 'Could not mark notifications as read.',
      );
    } finally {
      setBusyId('');
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-blue-700">
            <Bell size={15} />
            Updates and alerts
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
            Notifications
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Keep track of account updates and activity related to your access.
          </p>
        </div>

        <Btn
          variant="ghost"
          disabled={busyId !== '' || !data || data.unread === 0}
          onClick={markAllRead}
          className="self-start sm:self-auto"
        >
          <CheckCheck size={16} />
          {busyId === 'all' ? 'Updating...' : 'Mark all as read'}
        </Btn>
      </section>

      {data && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <Bell size={20} />
              </span>
              <div>
                <p className="text-sm text-slate-500">Unread notifications</p>
                <p className="mt-1 text-2xl font-extrabold text-slate-950">
                  {data.unread.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>

          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <CheckCheck size={20} />
              </span>
              <div>
                <p className="text-sm text-slate-500">Current page</p>
                <p className="mt-1 text-2xl font-extrabold text-slate-950">
                  {data.items.length.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {actionError && <ErrorBox message={actionError} />}
      {loading && <Loading />}
      {error && <ErrorBox message={error} />}

      {data && data.items.length === 0 && !loading && (
        <Card className="!py-10">
          <Empty>
            <div className="flex flex-col items-center gap-3">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <Bell size={25} />
              </span>
              <span className="font-semibold text-slate-700">
                You're all caught up
              </span>
              <span className="text-sm">
                No notifications are available on this page.
              </span>
            </div>
          </Empty>
        </Card>
      )}

      {data && data.items.length > 0 && (
        <Card className="!overflow-hidden !p-0">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="font-bold text-slate-900">Recent notifications</h2>
            <p className="mt-1 text-sm text-slate-500">
              Unread items are highlighted for easier identification.
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {data.items.map((notification) => (
              <article
                key={notification.id}
                className={`flex flex-col gap-4 p-5 transition sm:flex-row sm:items-start ${
                  notification.read
                    ? 'bg-white'
                    : 'bg-blue-50/50'
                }`}
              >
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                    notification.read
                      ? 'bg-slate-100 text-slate-500'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {notification.read ? (
                    <Mail size={19} />
                  ) : (
                    <Bell size={19} />
                  )}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">
                      {notification.type.replace(/_/g, ' ')}
                    </span>
                    {!notification.read && (
                      <Badge value="UNREAD" />
                    )}
                  </div>

                  <p className="mt-2 break-words whitespace-pre-wrap text-sm leading-6 text-slate-700">
                    {notification.message}
                  </p>

                  <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                    <Clock3 size={13} />
                    {fmt(notification.createdAt)}
                  </p>
                </div>

                {!notification.read && (
                  <Btn
                    variant="ghost"
                    disabled={busyId !== ''}
                    onClick={() => markOneRead(notification.id)}
                    className="self-start whitespace-nowrap"
                  >
                    {busyId === notification.id
                      ? 'Updating...'
                      : 'Mark as read'}
                  </Btn>
                )}
              </article>
            ))}
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

export function Profile() {
  const { user, refresh } = useAuth();

  const [name, setName] = useState(user?.displayName ?? '');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setName(user?.displayName ?? '');
  }, [user?.displayName]);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMsg('');
    setError('');

    const displayName = name.trim();

    if (!displayName) {
      setError('Display name is required.');
      return;
    }

    setBusy(true);

    try {
      await api('/auth/me', {
        method: 'PUT',
        body: { displayName },
      });

      await refresh();
      setMsg('Your profile has been updated successfully.');
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Could not save your profile. Please try again.',
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section>
        <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-blue-700">
          <CircleUserRound size={15} />
          Account settings
        </p>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
          Profile
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          View your account information and update your display name.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[0.85fr_1.4fr]">
        <Card className="self-start !overflow-hidden !p-0">
          <div className="h-24 bg-gradient-to-r from-slate-950 via-blue-900 to-blue-600" />

          <div className="px-5 pb-6">
            <div className="-mt-9 flex h-[72px] w-[72px] items-center justify-center rounded-2xl border-4 border-white bg-blue-50 text-blue-700 shadow-sm">
              <UserRound size={31} />
            </div>

            <h2 className="mt-4 break-words text-xl font-extrabold text-slate-950">
              {user?.displayName || 'Account holder'}
            </h2>

            <p className="mt-1 break-all text-sm text-slate-500">
              {user?.email}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {user?.role && <Badge value={user.role} />}
              {user?.status && <Badge value={user.status} />}
            </div>

            <div className="mt-6 space-y-4 border-t border-slate-100 pt-5">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-slate-400">
                  <Mail size={17} />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Email address
                  </p>
                  <p className="mt-1 break-all text-sm font-medium text-slate-800">
                    {user?.email || 'Not available'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-slate-400">
                  <ShieldCheck size={17} />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Account role
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {user?.role?.replace(/_/g, ' ') || 'Not available'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="mb-6 flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <UserRound size={21} />
            </span>
            <div>
              <h2 className="font-bold text-slate-900">
                Personal information
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Change the display name associated with your account.
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-5">
              <ErrorBox message={error} />
            </div>
          )}

          {msg && (
            <div
              role="status"
              className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"
            >
              {msg}
            </div>
          )}

          <form onSubmit={submit} className="space-y-2">
            <Field
              id="profile-name"
              label="Display name"
              placeholder="Enter your display name"
              autoComplete="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setMsg('');
                setError('');
              }}
              required
            />

            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-800">
                Account permissions
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Your role and access permissions are managed by the server.
                Changing your display name does not change your role.
              </p>
            </div>

            <div className="flex justify-end pt-4">
              <Btn
                type="submit"
                disabled={busy || !name.trim() || name.trim() === user?.displayName}
                className="!rounded-xl !px-5 !py-3"
              >
                {busy ? 'Saving changes...' : 'Save changes'}
              </Btn>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
