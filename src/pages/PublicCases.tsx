
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  MapPin,
  Search,
  ShieldCheck,
  UserRound,
  Users,
} from 'lucide-react';

import { api, Page, PublicCase, qs } from '../api';
import {
  Card,
  Empty,
  ErrorBox,
  Field,
  Loading,
  Pager,
  fmt,
  useAsync,
  Btn,
} from '../ui';

function Heading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
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
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="mt-1 break-words text-sm font-semibold text-slate-800">
          {value}
        </p>
      </div>
    </div>
  );
}

export function PublicSearch() {
  const [q, setQ] = useState('');
  const [city, setCity] = useState('');
  const [page, setPage] = useState(0);
  const [applied, setApplied] = useState({ q: '', city: '' });

  const {
    data,
    error,
    loading,
  } = useAsync(
    () =>
      api<Page<PublicCase>>(
        '/public/cases' + qs({ ...applied, page }),
      ),
    [applied, page],
  );

  const search = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPage(0);
    setApplied({ q: q.trim(), city: city.trim() });
  };

  const clearSearch = () => {
    setQ('');
    setCity('');
    setPage(0);
    setApplied({ q: '', city: '' });
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Heading
        eyebrow="Public information"
        title="Missing-person search"
        description="Search approved public cases by name or city. If you have relevant information, submit a sighting for authorized investigators to review."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <Search size={21} />
            </span>
            <div>
              <p className="text-sm text-slate-500">Search filters</p>
              <p className="mt-1 font-bold text-slate-950">
                Name and location
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <Users size={21} />
            </span>
            <div>
              <p className="text-sm text-slate-500">Public listings</p>
              <p className="mt-1 font-bold text-slate-950">
                Approved cases only
              </p>
            </div>
          </div>
        </div>
      </div>

      <Card>
        <div className="mb-5">
          <h2 className="text-lg font-bold text-slate-950">
            Find a case
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Enter a name, city, or both to narrow the results.
          </p>
        </div>

        <form onSubmit={search} className="grid gap-4 md:grid-cols-2">
          <Field
            id="public-name-search"
            label="Person's name"
            placeholder="Enter full or partial name"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <Field
            id="public-city-search"
            label="City"
            placeholder="Enter last-seen city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />

          <div className="flex flex-wrap items-center gap-3 md:col-span-2">
            <Btn type="submit">
              <Search size={16} />
              Search cases
            </Btn>
            {(q || city || applied.q || applied.city) && (
              <Btn type="button" variant="ghost" onClick={clearSearch}>
                Clear filters
              </Btn>
            )}
          </div>
        </form>
      </Card>

      <section className="space-y-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-950">
              Public case listings
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {data
                ? `${data.total.toLocaleString()} matching case(s)`
                : 'Loading available listings...'}
            </p>
          </div>

          {(applied.q || applied.city) && (
            <div className="flex flex-wrap gap-2">
              {applied.q && (
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800">
                  Name: {applied.q}
                </span>
              )}
              {applied.city && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  City: {applied.city}
                </span>
              )}
            </div>
          )}
        </div>

        {loading && <Loading />}
        {error && <ErrorBox message={error} />}

        {data && data.items.length === 0 && !loading && (
          <Card>
            <Empty>
              <div className="flex flex-col items-center gap-2">
                <Search size={30} />
                <span className="font-semibold">
                  No matching public cases
                </span>
                <span className="max-w-md text-center text-sm leading-6">
                  Try another name or city. No results do not necessarily
                  mean that a person has no case in the system.
                </span>
              </div>
            </Empty>
          </Card>
        )}

        {data && data.items.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {data.items.map((c) => (
              <article
                key={c.id}
                className="group flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                    <UserRound size={24} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="break-words text-lg font-bold text-slate-950">
                      <Link
                        className="transition hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        to={`/search/${c.id}`}
                      >
                        {c.fullName}
                      </Link>
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {[
                        c.age != null ? `Age ${c.age}` : '',
                        c.city,
                        c.country,
                      ]
                        .filter(Boolean)
                        .join(' · ') || 'Location details unavailable'}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <InfoItem
                    icon={<CalendarDays size={18} />}
                    label="Last seen"
                    value={fmt(c.lastSeenAt)}
                  />
                  <InfoItem
                    icon={<MapPin size={18} />}
                    label="Last-seen location"
                    value={[c.city, c.country].filter(Boolean).join(', ') || 'Not stated'}
                  />
                </div>

                <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  <span className="text-xs leading-5 text-slate-500">
                    Publicly approved listing
                  </span>
                  <Link
                    className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                    to={`/search/${c.id}`}
                  >
                    View details <ArrowRight size={15} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {data && data.items.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <Pager
              page={data.page}
              size={data.size}
              total={data.total}
              onPage={setPage}
            />
          </div>
        )}
      </section>

      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <ShieldCheck size={21} className="mt-0.5 shrink-0 text-amber-800" />
        <div>
          <p className="font-semibold text-amber-950">
            Have information about a case?
          </p>
          <p className="mt-1 text-sm leading-6 text-amber-900">
            Submit information through the sighting form. Avoid posting
            sensitive personal information publicly. If someone is in
            immediate danger, contact local emergency services.
          </p>
        </div>
      </div>
    </div>
  );
}

export function PublicCaseDetail() {
  const { id } = useParams();

  const {
    data,
    error,
    loading,
  } = useAsync(
    () => api<PublicCase>(`/public/cases/${id}`),
    [id],
  );

  if (loading) return <Loading />;
  if (error || !data) {
    return <ErrorBox message={error ?? 'Case not found'} />;
  }

  const location =
    [data.city, data.country].filter(Boolean).join(', ') || 'Not stated';

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <Link
        to="/search"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-blue-700"
      >
        <ArrowLeft size={16} />
        Back to search
      </Link>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 px-5 py-8 text-white sm:px-8 sm:py-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-100">
            <ShieldCheck size={15} />
            Approved public case
          </div>

          <h1 className="break-words text-2xl font-extrabold tracking-tight sm:text-3xl">
            {data.fullName}
          </h1>

          <p className="mt-3 flex items-center gap-2 text-sm text-slate-300">
            <MapPin size={16} />
            {location}
          </p>
        </div>

        <div className="space-y-6 p-5 sm:p-8">
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoItem
              icon={<UserRound size={18} />}
              label="Age"
              value={data.age != null ? String(data.age) : 'Unknown'}
            />
            <InfoItem
              icon={<Users size={18} />}
              label="Gender"
              value={data.gender || 'Not stated'}
            />
            <InfoItem
              icon={<CalendarDays size={18} />}
              label="Last seen"
              value={fmt(data.lastSeenAt)}
            />
            <InfoItem
              icon={<MapPin size={18} />}
              label="Last-seen location"
              value={location}
            />
          </div>

          <section>
            <h2 className="text-lg font-bold text-slate-950">
              Description
            </h2>
            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">
                {data.description || 'No public description provided.'}
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-blue-200 bg-blue-50/60 p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm">
                <ShieldCheck size={21} />
              </span>
              <div>
                <h2 className="font-bold text-slate-950">
                  Have relevant information?
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Submit a sighting so authorized investigators can review
                  it. Share only information you believe is accurate and
                  avoid publishing private details in public spaces.
                </p>
                <Link
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/30"
                  to={`/sightings/new?caseId=${encodeURIComponent(data.id)}`}
                >
                  Submit a sighting <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </section>

          <p className="text-xs leading-5 text-slate-500">
            If someone is in immediate danger, contact local emergency
            services. Public listing information should be handled
            sensitively and used only for legitimate assistance.
          </p>
        </div>
      </div>
    </div>
  );
}
