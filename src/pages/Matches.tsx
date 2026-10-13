
import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  FileImage,
  Fingerprint,
  Image as ImageIcon,
  ScanFace,
  ShieldCheck,
  UploadCloud,
  XCircle,
} from 'lucide-react';

import {
  api,
  ApiError,
  Candidate,
  imageUrl,
  MatchJob,
  Page,
  probeUrl,
} from '../api';

import {
  Badge,
  Btn,
  Card,
  Empty,
  ErrorBox,
  Loading,
  Pager,
  TextArea,
  fmt,
  useAsync,
} from '../ui';

const panelClass =
  'rounded-2xl border border-slate-200 bg-white shadow-sm';

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
      <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
        <Fingerprint size={15} />
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

function Metric({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
          {icon}
        </div>
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-1 text-xl font-extrabold text-slate-950">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function statusTone(status: string) {
  switch (status.toUpperCase()) {
    case 'COMPLETED':
    case 'CONFIRMED':
    case 'ACTIVE':
      return 'border-emerald-200 bg-emerald-50 text-emerald-800';
    case 'FAILED':
    case 'REJECTED':
    case 'CANCELLED':
      return 'border-red-200 bg-red-50 text-red-800';
    case 'PENDING':
    case 'RUNNING':
    case 'NEEDS_FACE_SELECTION':
    case 'PENDING_REVIEW':
      return 'border-amber-200 bg-amber-50 text-amber-800';
    default:
      return 'border-slate-200 bg-slate-100 text-slate-700';
  }
}

function StatusPill({ value }: { value: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${statusTone(value)}`}
    >
      {['PENDING', 'RUNNING'].includes(value.toUpperCase()) && (
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
      )}
      {value.replace(/_/g, ' ')}
    </span>
  );
}

export function MatchQueue() {
  const [page, setPage] = useState(0);
  const [msg, setMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const file = useRef<HTMLInputElement>(null);

  const {
    data,
    error,
    loading,
    reload,
  } = useAsync(
    () => api<Page<MatchJob>>(`/match-jobs?page=${page}`),
    [page],
  );

  const submitJob = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMsg('');

    const f = selectedFile ?? file.current?.files?.[0];

    if (!f) {
      setMsg('Choose a JPEG or PNG image first.');
      return;
    }

    if (!['image/jpeg', 'image/png'].includes(f.type)) {
      setMsg('Only JPEG and PNG images are accepted.');
      return;
    }

    if (f.size > 10 * 1024 * 1024) {
      setMsg('Image size must not exceed 10 MB.');
      return;
    }

    const form = new FormData();
    form.append('file', f);

    setSubmitting(true);

    try {
      await api('/match-jobs', { form });
      setMsg('Match job submitted successfully.');
      setSelectedFile(null);

      if (file.current) file.current.value = '';

      setPage(0);
      await reload();
    } catch (err) {
      setMsg(
        err instanceof ApiError
          ? err.message
          : 'Unable to submit the match job.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Heading
        eyebrow="AI-assisted investigation"
        title="Match queue"
        description="Submit a probe photograph, monitor processing jobs and review potential candidates."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Metric
          label="Jobs on this page"
          value={data?.items.length ?? '—'}
          icon={<Activity size={20} />}
        />
        <Metric
          label="Total jobs"
          value={data ? data.total.toLocaleString() : '—'}
          icon={<ScanFace size={20} />}
        />
        <Metric
          label="Current page"
          value={data ? data.page + 1 : '—'}
          icon={<FileImage size={20} />}
        />
      </div>

      <Card>
        <div className="mb-5 flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <UploadCloud size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-950">
              Create a match job
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Upload a clear image for processing. Search scope is enforced
              by your backend permissions.
            </p>
          </div>
        </div>

        <form onSubmit={submitJob} className="space-y-4">
          <label
            htmlFor="probe"
            className="flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center transition hover:border-blue-400 hover:bg-blue-50/40"
          >
            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-blue-700 shadow-sm">
              <ImageIcon size={24} />
            </span>
            <span className="font-semibold text-slate-800">
              {selectedFile?.name || 'Choose a probe photograph'}
            </span>
            <span className="mt-1 text-xs text-slate-500">
              JPEG or PNG · Maximum 10 MB
            </span>
            <input
              id="probe"
              ref={file}
              type="file"
              accept="image/jpeg,image/png"
              className="sr-only"
              disabled={submitting}
              onChange={(e) => {
                setSelectedFile(e.target.files?.[0] ?? null);
                setMsg('');
              }}
            />
          </label>

          {selectedFile && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3">
              <div className="flex min-w-0 items-center gap-2 text-sm text-slate-700">
                <FileImage size={18} className="shrink-0 text-blue-700" />
                <span className="break-all">{selectedFile.name}</span>
                <span className="shrink-0 text-xs text-slate-400">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>
              <button
                type="button"
                className="text-sm font-semibold text-slate-500 hover:text-red-600"
                onClick={() => {
                  setSelectedFile(null);
                  if (file.current) file.current.value = '';
                }}
              >
                Remove
              </button>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <Btn type="submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Start match job'}
            </Btn>
            <span className="text-xs text-slate-500">
              Processing time depends on image quality and queue load.
            </span>
          </div>
        </form>

        {msg && (
          <div
            role="status"
            className={`mt-4 flex items-start gap-2 rounded-xl border p-3 text-sm ${
              msg.includes('successfully')
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-amber-200 bg-amber-50 text-amber-900'
            }`}
          >
            <AlertCircle size={17} className="mt-0.5 shrink-0" />
            <span>{msg}</span>
          </div>
        )}
      </Card>

      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-bold text-slate-950">
            Processing history
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Open a job to view detected faces and review its potential candidates.
          </p>
        </div>

        {loading && <Loading />}
        {error && <ErrorBox message={error} />}

        {data && data.items.length === 0 && !loading && (
          <Card>
            <Empty>
              <div className="flex flex-col items-center gap-2">
                <ScanFace size={30} />
                <span className="font-semibold">No match jobs yet</span>
                <span className="text-sm">
                  Submit a photograph to begin.
                </span>
              </div>
            </Empty>
          </Card>
        )}

        {data && data.items.length > 0 && (
          <Card className="!overflow-hidden !p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Created</th>
                    <th className="px-4 py-4 font-semibold">Job status</th>
                    <th className="px-4 py-4 font-semibold">Candidates</th>
                    <th className="px-4 py-4 font-semibold">Awaiting review</th>
                    <th className="px-5 py-4 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.items.map((job) => (
                    <tr
                      key={job.id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                        {fmt(job.createdAt)}
                      </td>
                      <td className="px-4 py-4">
                        <StatusPill value={job.status} />
                        {job.error && (
                          <p className="mt-2 max-w-xs break-words text-xs text-red-700">
                            {job.error}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-4 font-semibold text-slate-800">
                        {String(job.candidates)}
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex min-w-8 items-center justify-center rounded-lg bg-amber-50 px-2 py-1 font-bold text-amber-800">
                          {job.awaitingReview}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 font-semibold text-white transition hover:bg-blue-700"
                          to={`/matches/${job.id}`}
                        >
                          Open <ArrowLeft className="rotate-180" size={15} />
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
          </Card>
        )}
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <ShieldCheck size={21} className="mt-0.5 shrink-0 text-amber-800" />
        <div>
          <p className="font-semibold text-amber-950">
            Human review is required
          </p>
          <p className="mt-1 text-sm leading-6 text-amber-900">
            Similarity scores are not probabilities of identity. A candidate
            must be reviewed against independent evidence; the AI result alone
            must never confirm identity or close a missing-person case.
          </p>
        </div>
      </div>
    </div>
  );
}

function CandidateCard({
  c,
  onDone,
}: {
  c: Candidate;
  onDone: () => void;
}) {
  const [notes, setNotes] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const warnings: string[] = (() => {
    try {
      const parsed = JSON.parse(c.warnings ?? '[]');
      return Array.isArray(parsed)
        ? parsed.filter((item): item is string => typeof item === 'string')
        : [];
    } catch {
      return [];
    }
  })();

  const final = c.status === 'CONFIRMED' || c.status === 'REJECTED';

  const act = async (decision: string) => {
    if (notes.trim().length < 5) {
      setMsg('Reviewer notes must contain at least 5 characters.');
      return;
    }

    setBusy(true);
    setMsg('');

    try {
      await api(`/match-candidates/${c.id}/review`, {
        method: 'POST',
        body: { decision, notes: notes.trim() },
      });

      setNotes('');
      setMsg('Review submitted successfully.');
      onDone();
    } catch (err) {
      setMsg(
        err instanceof ApiError
          ? err.message
          : 'Unable to submit this review.',
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Candidate #{c.rank}
          </p>
          <h2 className="mt-1 text-lg font-bold text-slate-950">
            {c.fullName}
          </h2>
          <Link
            className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-900"
            to={`/cases/${c.caseId}`}
          >
            View case details
          </Link>
        </div>
        <StatusPill value={c.status} />
      </div>

      <div className="mt-4 grid gap-5 lg:grid-cols-2">
        <figure className="min-w-0">
          <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
            <img
              alt="Reference photograph associated with this case"
              src={imageUrl(c.caseId, c.photoId)}
              loading="lazy"
              className="h-full w-full object-contain"
            />
          </div>
          <figcaption className="mt-2 flex items-center gap-2 text-xs text-slate-500">
            <ImageIcon size={14} />
            Case reference photograph
          </figcaption>
        </figure>

        <div className="space-y-4">
          <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
            <p className="text-sm font-semibold text-slate-800">
              Cosine similarity
            </p>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-blue-800">
              {Number.isFinite(c.similarity)
                ? c.similarity.toFixed(3)
                : 'Unavailable'}
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-600">
              Threshold used: {String(c.thresholdUsed)}. This score measures
              embedding similarity; it is not a probability of identity.
            </p>
          </div>

          {warnings.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="flex items-center gap-2 font-semibold text-amber-950">
                <AlertCircle size={17} />
                Comparison warnings
              </p>
              <ul className="mt-2 space-y-2">
                {warnings.map((warning, index) => (
                  <li
                    key={`${warning}-${index}`}
                    className="text-sm leading-5 text-amber-900"
                  >
                    {warning.replace(/_/g, ' ')} — comparison may be unreliable.
                  </li>
                ))}
              </ul>
            </div>
          )}

          {c.reviews.length > 0 && (
            <div>
              <h3 className="font-semibold text-slate-900">Review history</h3>
              <div className="mt-2 space-y-3">
                {c.reviews.map((review, index) => (
                  <div
                    key={`${review.createdAt}-${index}`}
                    className="rounded-xl border border-slate-200 p-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs text-slate-500">
                        {fmt(review.createdAt)}
                      </span>
                      <StatusPill value={review.decision} />
                    </div>
                    <p className="mt-2 text-sm font-semibold text-slate-800">
                      {review.reviewer}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-5 text-slate-600">
                      {review.notes}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {!final && (
        <div className="mt-5 border-t border-slate-100 pt-5">
          <h3 className="font-bold text-slate-900">Independent review</h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Document the evidence you compared. Do not base a decision on the
            similarity score alone.
          </p>

          <div className="mt-4">
            <TextArea
              id={`rn-${c.id}`}
              label="Reviewer notes (minimum 5 characters)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <Btn disabled={busy} onClick={() => act('CONFIRM')}>
              <CheckCircle2 size={16} />
              {busy
                ? 'Submitting...'
                : c.status === 'CONFIRMED_FIRST'
                  ? 'Confirm second review'
                  : c.secondReviewRequired
                    ? 'Confirm first review'
                    : 'Confirm match'}
            </Btn>

            <Btn
              disabled={busy}
              variant="danger"
              onClick={() => act('REJECT')}
            >
              <XCircle size={16} />
              Reject
            </Btn>

            <Btn
              disabled={busy}
              variant="ghost"
              onClick={() => act('REQUEST_REVIEW')}
            >
              <ShieldCheck size={16} />
              Request additional review
            </Btn>
          </div>

          {msg && (
            <p
              role="status"
              className={`mt-3 rounded-xl border p-3 text-sm ${
                msg.includes('successfully')
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  : 'border-red-200 bg-red-50 text-red-800'
              }`}
            >
              {msg}
            </p>
          )}
        </div>
      )}

      {final && (
        <div className="mt-5 flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
          <ShieldCheck size={17} className="mt-0.5 shrink-0" />
          This candidate has a final review status. Any further change must
          follow the backend's review policy.
        </div>
      )}
    </Card>
  );
}

export function MatchDetail() {
  const { id } = useParams();

  const {
    data,
    error,
    loading,
    reload,
  } = useAsync(
    () => api<MatchJob>(`/match-jobs/${id}`),
    [id],
  );

  const [msg, setMsg] = useState('');
  const [selectingFace, setSelectingFace] = useState<number | null>(null);

  useEffect(() => {
    if (!data || !['PENDING', 'RUNNING'].includes(data.status)) return;

    const timer = setTimeout(() => {
      void reload();
    }, 3000);

    return () => clearTimeout(timer);
  }, [data, reload]);

  if (loading && !data) return <Loading />;
  if (error || !data) return <ErrorBox message={error ?? 'Not found'} />;

  const faces: {
    index: number;
    box: number[];
    detection_score: number;
    warnings: string[];
  }[] = (() => {
    try {
      const parsed = JSON.parse(data.faces ?? '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  })();

  const candidates = Array.isArray(data.candidates) ? data.candidates : [];

  const selectFace = async (faceIndex: number) => {
    setMsg('');
    setSelectingFace(faceIndex);

    try {
      await api(`/match-jobs/${data.id}/select-face`, {
        method: 'POST',
        body: { faceIndex },
      });

      setMsg('Face selection submitted.');
      await reload();
    } catch (err) {
      setMsg(
        err instanceof ApiError
          ? err.message
          : 'Unable to select this face.',
      );
    } finally {
      setSelectingFace(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Link
        to="/matches"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-blue-700"
      >
        <ArrowLeft size={16} />
        Back to match queue
      </Link>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
            <ScanFace size={15} />
            Match job details
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
            AI matching results
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Created {fmt(data.createdAt)}
          </p>
        </div>
        <StatusPill value={data.status} />
      </div>

      {data.error && (
        <ErrorBox message={data.error.replace(/_/g, ' ')} />
      )}

      {msg && (
        <div
          role="status"
          className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800"
        >
          {msg}
        </div>
      )}

      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <ShieldCheck size={21} className="mt-0.5 shrink-0 text-amber-800" />
        <div>
          <p className="font-semibold text-amber-950">
            Potential matches only
          </p>
          <p className="mt-1 text-sm leading-6 text-amber-900">
            AI similarity cannot establish identity. Independently verify
            relevant evidence and follow the required review process. A
            similarity result must not automatically close a case.
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <Card>
          <div className="mb-3 flex items-center gap-2">
            <ImageIcon size={19} className="text-blue-700" />
            <h2 className="font-bold text-slate-900">Probe photograph</h2>
          </div>
          <div className="flex min-h-56 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-2">
            <img
              alt="Uploaded probe photograph"
              src={probeUrl(data.id)}
              className="max-h-[420px] max-w-full rounded-lg object-contain"
            />
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            Access to this image should remain restricted to authorized users.
          </p>
        </Card>

        <Card>
          <div className="mb-4 flex items-center gap-2">
            <Activity size={19} className="text-blue-700" />
            <h2 className="font-bold text-slate-900">Processing status</h2>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <Clock3 size={20} />
            </div>
            <div>
              <p className="font-semibold text-slate-900">
                {data.status.replace(/_/g, ' ')}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {['PENDING', 'RUNNING'].includes(data.status)
                  ? 'Status refreshes automatically while processing.'
                  : data.status === 'NEEDS_FACE_SELECTION'
                    ? 'Select the relevant detected face to continue.'
                    : data.status === 'COMPLETED'
                      ? `${candidates.length} candidate(s) returned.`
                      : 'Processing is not currently running.'}
              </p>
            </div>
          </div>

          {['PENDING', 'RUNNING'].includes(data.status) && (
            <div className="mt-4">
              <Loading />
            </div>
          )}

          {data.status === 'NEEDS_FACE_SELECTION' && (
            <div className="mt-5">
              <h3 className="font-bold text-slate-900">
                Select a detected face
              </h3>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Multiple faces were detected. Review the probe image and
                select the intended face before proceeding.
              </p>

              {faces.length === 0 ? (
                <p className="mt-3 text-sm text-amber-800">
                  No face-selection data is available. Check the job or AI
                  service response.
                </p>
              ) : (
                <div className="mt-3 space-y-3">
                  {faces.map((face) => (
                    <div
                      key={face.index}
                      className="rounded-xl border border-slate-200 p-3"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-semibold text-slate-900">
                            Face {face.index}
                          </p>
                          <p className="mt-1 break-words font-mono text-xs text-slate-500">
                            Box: [{face.box.join(', ')}]
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Detection score: {face.detection_score}
                          </p>
                        </div>
                        <Btn
                          disabled={selectingFace !== null}
                          onClick={() => selectFace(face.index)}
                        >
                          {selectingFace === face.index
                            ? 'Selecting...'
                            : 'Use this face'}
                        </Btn>
                      </div>

                      {face.warnings?.length > 0 && (
                        <p className="mt-3 text-xs leading-5 text-amber-800">
                          {face.warnings.join(', ').replace(/_/g, ' ')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Card>
      </div>

      {data.status === 'COMPLETED' && candidates.length === 0 && (
        <Card>
          <Empty>
            <div className="flex flex-col items-center gap-2">
              <ScanFace size={30} />
              <span className="font-semibold">
                No candidates above the configured threshold
              </span>
              <span className="max-w-lg text-center text-sm leading-6">
                This result does not prove the person is absent from the
                system. Image quality, coverage and threshold settings can
                affect results.
              </span>
            </div>
          </Empty>
        </Card>
      )}

      {candidates.length > 0 && (
        <section className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-slate-950">
                Potential candidates
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {candidates.length} result(s) returned for human review.
              </p>
            </div>
            <span className="inline-flex items-center gap-2 self-start rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900">
              <ShieldCheck size={14} />
              Review required
            </span>
          </div>

          {candidates.map((candidate) => (
            <CandidateCard
              key={candidate.id}
              c={candidate}
              onDone={() => void reload()}
            />
          ))}
        </section>
      )}
    </div>
  );
}
