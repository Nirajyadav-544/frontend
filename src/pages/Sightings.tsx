
import { FormEvent, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  MapPin,
  ShieldCheck,
  XCircle,
} from 'lucide-react';

import { api, ApiError, Page, Sighting, qs } from '../api';
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

type SightingValues = {
  caseId: string;
  seenAt: string;
  locationDescription: string;
  latitude: string;
  longitude: string;
  source: string;
  description: string;
};

export function validateSighting(v: SightingValues) {
  const e: Record<string, string> = {};

  if (!v.caseId.trim()) {
    e.caseId = 'Case ID is required';
  }

  if (!v.seenAt) {
    e.seenAt = 'Date and time seen is required';
  } else if (Number.isNaN(new Date(v.seenAt).getTime())) {
    e.seenAt = 'Enter a valid date and time';
  }

  if (!v.locationDescription.trim()) {
    e.locationDescription = 'Location description is required';
  }

  if (!v.description.trim()) {
    e.description = 'Describe what you observed';
  }

  if (v.latitude !== '') {
    const latitude = Number(v.latitude);

    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
      e.latitude = 'Latitude must be between -90 and 90';
    }
  }

  if (v.longitude !== '') {
    const longitude = Number(v.longitude);

    if (
      !Number.isFinite(longitude) ||
      longitude < -180 ||
      longitude > 180
    ) {
      e.longitude = 'Longitude must be between -180 and 180';
    }
  }

  return e;
}

function PageHeading({
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

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: 'border-amber-200 bg-amber-50 text-amber-800',
    APPROVED: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    REJECTED: 'border-red-200 bg-red-50 text-red-800',
  };

  const icons: Record<string, React.ReactNode> = {
    PENDING: <Clock3 size={13} />,
    APPROVED: <CheckCircle2 size={13} />,
    REJECTED: <XCircle size={13} />,
  };

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${
        styles[status] ?? 'border-slate-200 bg-slate-100 text-slate-700'
      }`}
    >
      {icons[status]}
      {status.replace(/_/g, ' ')}
    </span>
  );
}

function SafetyNotice() {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <ShieldCheck size={21} className="mt-0.5 shrink-0 text-amber-800" />
      <div>
        <p className="font-semibold text-amber-950">
          Safety and privacy first
        </p>
        <p className="mt-1 text-sm leading-6 text-amber-900">
          A sighting is a report, not a verified location. Do not approach or
          confront anyone. Avoid including passwords, financial information
          or unnecessary private details in your report.
        </p>
      </div>
    </div>
  );
}

export function SightingForm() {
  const [sp] = useSearchParams();
  const nav = useNavigate();

  const [v, setV] = useState<SightingValues>({
    caseId: sp.get('caseId') ?? '',
    seenAt: '',
    locationDescription: '',
    latitude: '',
    longitude: '',
    source: '',
    description: '',
  });

  const [errs, setErrs] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const set =
    (k: keyof SightingValues) =>
    (e: { target: { value: string } }) => {
      const value = e.target.value;

      setV((previous) => ({ ...previous, [k]: value }));

      setErrs((previous) => {
        const next = { ...previous };
        delete next[k];
        return next;
      });

      setError('');
    };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const validation = validateSighting(v);
    setErrs(validation);

    if (Object.keys(validation).length > 0) {
      setError('Please correct the highlighted fields.');
      return;
    }

    const num = (value: string) =>
      value.trim() === '' ? null : Number(value);

    setSubmitting(true);

    try {
      await api('/sightings', {
        method: 'POST',
        body: {
          ...v,
          caseId: v.caseId.trim(),
          locationDescription: v.locationDescription.trim(),
          description: v.description.trim(),
          source: v.source.trim(),
          latitude: num(v.latitude),
          longitude: num(v.longitude),
          seenAt: new Date(v.seenAt).toISOString(),
        },
      });

      nav('/sightings', {
        state: { sightingSubmitted: true },
      });
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.status === 404
            ? 'That case could not be found or is not open for sightings.'
            : err.message
          : 'Submission failed. Please try again.',
      );

      if (err instanceof ApiError && err.fields) {
        setErrs(err.fields);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeading
        eyebrow="Community reporting"
        title="Submit a sighting"
        description="Share when and where you observed someone connected to an approved missing-person case."
      />

      <SafetyNotice />

      <Card>
        <div className="mb-6 flex items-start gap-3 border-b border-slate-100 pb-5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <ClipboardCheck size={22} />
          </span>
          <div>
            <h2 className="text-lg font-bold text-slate-950">
              Sighting details
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Fields marked with * are required. Please provide accurate
              information to help investigators assess the report.
            </p>
          </div>
        </div>

        <form
          onSubmit={submit}
          noValidate
          className="grid gap-x-5 gap-y-5 md:grid-cols-2"
        >
          {error && (
            <div className="md:col-span-2">
              <ErrorBox message={error} />
            </div>
          )}

          <div>
            <Field
              id="caseId"
              label="Case ID *"
              placeholder="Enter the relevant case ID"
              value={v.caseId}
              error={errs.caseId}
              onChange={set('caseId')}
            />
            <p className="mt-1 text-xs text-slate-500">
              Open a public case and use its sighting link to prefill this.
            </p>
          </div>

          <Field
            id="seenAt"
            label="When did you see them? *"
            type="datetime-local"
            value={v.seenAt}
            error={errs.seenAt}
            onChange={set('seenAt')}
          />

          <div>
            <Field
              id="locationDescription"
              label="Location description *"
              placeholder="Area, landmark or public place"
              value={v.locationDescription}
              error={errs.locationDescription}
              onChange={set('locationDescription')}
            />
            <p className="mt-1 text-xs text-slate-500">
              Avoid sharing unnecessary private addresses.
            </p>
          </div>

          <Field
            id="source"
            label="Source of information"
            placeholder="Optional context for the report"
            value={v.source}
            onChange={set('source')}
          />

          <div className="md:col-span-2">
            <div className="mb-3">
              <h3 className="font-semibold text-slate-900">
                Coordinates <span className="font-normal text-slate-400">(optional)</span>
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Add coordinates only if you know them accurately.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                id="latitude"
                label="Latitude"
                type="number"
                step="any"
                placeholder="e.g. 17.385"
                value={v.latitude}
                error={errs.latitude}
                onChange={set('latitude')}
              />
              <Field
                id="longitude"
                label="Longitude"
                type="number"
                step="any"
                placeholder="e.g. 78.4867"
                value={v.longitude}
                error={errs.longitude}
                onChange={set('longitude')}
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <TextArea
              id="description"
              label="What did you observe? *"
              placeholder="Describe your observation factually. Include details you directly observed and distinguish them from anything you heard from someone else."
              value={v.description}
              onChange={set('description')}
            />

            {errs.description && (
              <p role="alert" className="mt-1 text-sm text-red-700">
                {errs.description}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5 md:col-span-2">
            <Btn type="submit" disabled={submitting}>
              <ClipboardCheck size={16} />
              {submitting ? 'Submitting report...' : 'Submit sighting'}
            </Btn>

            <Link
              to="/sightings"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              Cancel
            </Link>
          </div>
        </form>
      </Card>

      <p className="text-xs leading-5 text-slate-500">
        Submission does not mean the sighting has been verified or that the
        person has been identified. Authorized reviewers assess reports
        according to the application's review policy.
      </p>
    </div>
  );
}

export function SightingList() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [busyId, setBusyId] = useState('');

  const {
    data,
    error,
    loading,
    reload,
  } = useAsync(
    () => api<Page<Sighting>>('/sightings' + qs({ status, page })),
    [status, page],
  );

  const review = async (
    id: string,
    decision: 'APPROVED' | 'REJECTED',
  ) => {
    setMsg('');
    setReviewError('');
    setBusyId(id);

    try {
      await api(`/sightings/${id}/review`, {
        method: 'POST',
        body: {
          decision,
          notes: (notes[id] ?? '').trim(),
        },
      });

      setMsg(
        decision === 'APPROVED'
          ? 'Sighting report approved.'
          : 'Sighting report rejected.',
      );

      await reload();
    } catch (err) {
      setReviewError(
        err instanceof ApiError
          ? err.message
          : 'Unable to review this sighting.',
      );
    } finally {
      setBusyId('');
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeading
        eyebrow="Reports and verification"
        title="Sightings"
        description="Review submitted reports, inspect observations and track the review status of each sighting."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <MapPin size={21} />
            </span>
            <div>
              <p className="text-sm text-slate-500">Matching reports</p>
              <p className="mt-1 text-xl font-extrabold text-slate-950">
                {data ? data.total.toLocaleString() : '—'}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <ClipboardCheck size={21} />
            </span>
            <div>
              <p className="text-sm text-slate-500">Reports on this page</p>
              <p className="mt-1 text-xl font-extrabold text-slate-950">
                {data ? data.items.length : '—'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {msg && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"
        >
          <CheckCircle2 size={17} />
          {msg}
        </div>
      )}

      {reviewError && <ErrorBox message={reviewError} />}

      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-bold text-slate-950">Filter reports</h2>
            <p className="mt-1 text-sm text-slate-500">
              Choose a status to narrow the list.
            </p>
          </div>

          <div className="w-full sm:max-w-xs">
            <label
              htmlFor="sighting-status"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Report status
            </label>
            <select
              id="sighting-status"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              value={status}
              onChange={(e) => {
                setPage(0);
                setStatus(e.target.value);
                setMsg('');
                setReviewError('');
              }}
            >
              <option value="">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>
      </Card>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-950">
            Sighting reports
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Reports are not verified locations, even after approval.
          </p>
        </div>

        <Link
          to="/sightings/new"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/30"
        >
          Submit sighting <ArrowRight size={16} />
        </Link>
      </div>

      {loading && <Loading />}
      {error && <ErrorBox message={error} />}

      {data && data.items.length === 0 && !loading && (
        <Card>
          <Empty>
            <div className="flex flex-col items-center gap-2">
              <MapPin size={30} />
              <span className="font-semibold">No sightings found</span>
              <span className="text-sm">
                Try another filter or submit a new report.
              </span>
            </div>
          </Empty>
        </Card>
      )}

      {data?.items.map((s) => (
        <Card key={s.id}>
          <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Related case
              </p>
              <h3 className="mt-1 break-words text-lg font-bold text-slate-950">
                {s.caseName}
              </h3>
              <p className="mt-1 flex items-start gap-2 text-sm text-slate-500">
                <MapPin size={15} className="mt-0.5 shrink-0" />
                <span>{s.locationDescription}</span>
              </p>
            </div>

            <StatusPill status={s.status} />
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <Clock3 size={14} />
                Reported observation time
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-800">
                {fmt(s.seenAt)}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Report status
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                {s.status === 'APPROVED'
                  ? 'Reviewed report; the location has not been independently verified by this status alone.'
                  : s.status === 'REJECTED'
                    ? 'This report has been rejected by a reviewer.'
                    : 'This report has not yet received a final review decision.'}
              </p>
            </div>
          </div>

          <section className="mt-4">
            <h4 className="text-sm font-bold text-slate-900">
              Observation details
            </h4>
            <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
              {s.description}
            </p>
          </section>

          {s.reviewNotes && (
            <div className="mt-4 rounded-xl border border-slate-200 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <ClipboardCheck size={16} />
                Reviewer notes
              </p>
              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
                {s.reviewNotes}
              </p>
            </div>
          )}

          {s.canReview && (
            <div className="mt-5 border-t border-slate-100 pt-5">
              <h4 className="font-bold text-slate-900">
                Review this report
              </h4>
              <p className="mt-1 text-sm text-slate-500">
                Record your assessment before making a decision.
              </p>

              <div className="mt-3">
                <Field
                  id={`n-${s.id}`}
                  label="Review notes"
                  placeholder="Record relevant verification steps or reasons for the decision"
                  value={notes[s.id] ?? ''}
                  onChange={(e) =>
                    setNotes((previous) => ({
                      ...previous,
                      [s.id]: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <Btn
                  disabled={busyId !== ''}
                  onClick={() => review(s.id, 'APPROVED')}
                >
                  <CheckCircle2 size={16} />
                  {busyId === s.id ? 'Saving...' : 'Approve report'}
                </Btn>

                <Btn
                  disabled={busyId !== ''}
                  variant="danger"
                  onClick={() => review(s.id, 'REJECTED')}
                >
                  <XCircle size={16} />
                  Reject report
                </Btn>
              </div>
            </div>
          )}
        </Card>
      ))}

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

      <SafetyNotice />
    </div>
  );
}
