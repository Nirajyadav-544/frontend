
const BASE: string =
  (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/+$/, '') ||
  '/api/v1';

export class ApiError extends Error {
  status: number;
  fields?: Record<string, string>;

  constructor(
    status: number,
    message: string,
    fields?: Record<string, string>,
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fields = fields;
  }
}

interface Opts {
  method?: string;
  body?: unknown;
  form?: FormData;
}

interface ApiErrorResponse {
  message?: string;
  fields?: Record<string, string>;
}

export async function api<T = unknown>(
  path: string,
  opts: Opts = {},
): Promise<T> {
  const headers = new Headers();

  let body: BodyInit | undefined;

  if (opts.form !== undefined) {
    body = opts.form;
  } else if (opts.body !== undefined) {
    body = JSON.stringify(opts.body);
    headers.set('Content-Type', 'application/json');
  }

  const init: RequestInit = {
    method: opts.method ?? (body ? 'POST' : 'GET'),
    credentials: 'include',
    headers,
    body,
  };

  let response: Response;

  try {
    response = await fetch(`${BASE}${path}`, init);
  } catch {
    throw new ApiError(
      0,
      'Network error: the server could not be reached.',
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const responseText = await response.text();

  let data: unknown = null;

  if (responseText.trim()) {
    try {
      data = JSON.parse(responseText);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const errorData = data as ApiErrorResponse | null;

    const message =
      errorData?.message ||
      response.statusText ||
      'Request failed';

    throw new ApiError(
      response.status,
      message,
      errorData?.fields,
    );
  }

  return data as T;
}

export const imageUrl = (
  caseId: string,
  photoId: string,
): string =>
  `${BASE}/cases/${encodeURIComponent(caseId)}/photos/${encodeURIComponent(photoId)}/image`;

export const probeUrl = (jobId: string): string =>
  `${BASE}/match-jobs/${encodeURIComponent(jobId)}/probe`;

export type Role =
  | 'REGISTERED_USER'
  | 'INVESTIGATOR'
  | 'ADMIN';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: Role;
  status: string;
}

export interface Page<T> {
  items: T[];
  page: number;
  size: number;
  total: number;
}

export interface Photo {
  id: string;
  primary: boolean;
  width: number;
  height: number;
  indexed: boolean;
}

export interface CaseRow {
  id: string;
  fullName: string;
  aliases?: string;
  age?: number;
  gender?: string;
  description?: string;
  lastSeenAt: string;
  lastSeenLocation: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  circumstances?: string;
  contactInfo?: string;
  priority: string;
  status: string;
  publicVisible: boolean;
  consentConfirmed: boolean;
  consentNote?: string;
  reporterId: string;
  assignedInvestigatorId?: string;
  createdAt: string;
  allowedTransitions?: string[];
  canManage?: boolean;
  photos?: Photo[];
}

export interface PublicCase {
  id: string;
  fullName: string;
  age?: number;
  gender?: string;
  city?: string;
  country?: string;
  lastSeenAt: string;
  description?: string;
}

export interface Sighting {
  id: string;
  caseId: string;
  caseName: string;
  seenAt: string;
  locationDescription: string;
  latitude?: number;
  longitude?: number;
  source?: string;
  description: string;
  status: string;
  reviewNotes?: string;
  canReview: boolean;
}

export interface Candidate {
  id: string;
  caseId: string;
  photoId: string;
  fullName: string;
  similarity: number;
  thresholdUsed: number;
  rank: number;
  status: string;
  warnings?: string;
  secondReviewRequired: boolean;
  reviews: {
    decision: string;
    notes: string;
    createdAt: string;
    reviewer: string;
  }[];
}

export interface MatchJob {
  id: string;
  status: string;
  error?: string;
  faces?: string;
  createdAt: string;
  candidates?: Candidate[] | number;
  awaitingReview?: number;
}

export interface Dashboard {
  activeCases: number;
  awaitingReview: number;
  newReports: number;
  resolved: number;
  sightingsAwaiting: number;
  jobsInProgress: number;
  candidatesAwaiting: number;
  statusDistribution: {
    status: string;
    count: number;
  }[];
  trend: {
    day: string;
    count: number;
  }[];
  sightingPoints: {
    latitude: number;
    longitude: number;
    seenAt: string;
    status: string;
  }[];
  recentActivity: {
    action: string;
    entityType?: string;
    createdAt: string;
  }[];
}

export const qs = (
  values: Record<string, string | number | undefined>,
): string => {
  const params = new URLSearchParams();

  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.set(key, String(value));
    }
  });

  const query = params.toString();

  return query ? `?${query}` : '';
};
