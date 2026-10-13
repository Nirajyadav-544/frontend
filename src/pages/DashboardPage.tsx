
import { useState, type ReactNode } from 'react';
import {
  Activity,
  CheckCircle2,
  Clock3,
  FileSearch,
  MapPinned,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import { api, Dashboard, qs } from '../api';
import { useAuth } from '../auth';
import {
  Badge,
  Btn,
  Card,
  Empty,
  ErrorBox,
  Field,
  Loading,
  fmt,
  useAsync,
} from '../ui';

function Stat({
  label,
  value,
  icon,
  color = 'blue',
  description,
}: {
  label: string;
  value: number;
  icon: ReactNode;
  color?: 'blue' | 'green' | 'amber' | 'violet';
  description?: string;
}) {
  const palette = {
    blue: 'bg-blue-50 text-blue-700 ring-blue-100',
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    amber: 'bg-amber-50 text-amber-700 ring-amber-100',
    violet: 'bg-violet-50 text-violet-700 ring-violet-100',
  };

  return (
    <Card className="group relative overflow-hidden !p-4 sm:!p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium leading-5 text-slate-500">
            {label}
          </p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
            {value.toLocaleString()}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ${palette[color]}`}
          aria-hidden="true"
        >
          {icon}
        </div>
      </div>

      {description && (
        <p className="mt-3 text-xs leading-5 text-slate-500">
          {description}
        </p>
      )}

      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-blue-600/50 to-transparent opacity-0 transition group-hover:opacity-100" />
    </Card>
  );
}

function SectionHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-4">
      <h2 className="text-base font-bold tracking-tight text-slate-900">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-1 text-sm leading-5 text-slate-500">{subtitle}</p>
      )}
    </div>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const [city, setCity] = useState('');
  const [from, setFrom] = useState('');
  const [applied, setApplied] = useState({ city: '', from: '' });

  const {
    data,
    error,
    loading,
    reload,
  } = useAsync(
    () => api<Dashboard>('/dashboard' + qs(applied)),
    [applied],
  );

  const staff = user?.role !== 'REGISTERED_USER';

  return (
    <div className="mx-auto max-w-[1440px] space-y-6">
      {/* Page heading */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
            <ShieldCheck size={15} />
            Operations overview
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
            Dashboard
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Monitor missing-person reports, review activity and investigation
            progress from one place.
          </p>
        </div>

        <Btn
          variant="ghost"
          onClick={reload}
          disabled={loading}
          className="self-start sm:self-auto"
        >
          <RefreshCw
            size={16}
            className={loading ? 'animate-spin' : ''}
          />
          Refresh data
        </Btn>
      </section>

      {/* Filters */}
      <Card className="!p-4 sm:!p-5">
        <form
          className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]"
          onSubmit={(e) => {
            e.preventDefault();
            setApplied({ city: city.trim(), from });
          }}
        >
          <Field
            id="f-city"
            label="Filter by city"
            placeholder="Enter city name"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />

          <Field
            id="f-from"
            label="Reports created since"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />

          <div className="mb-4 flex flex-wrap gap-2">
            <Btn type="submit">
              <FileSearch size={16} />
              Apply filters
            </Btn>

            <Btn
              variant="ghost"
              type="button"
              onClick={() => {
                setCity('');
                setFrom('');
                setApplied({ city: '', from: '' });
              }}
            >
              Reset
            </Btn>
          </div>
        </form>
      </Card>

      {loading && <Loading />}

      {error && <ErrorBox message={error} />}

      {data && (
        <>
          {/* Summary statistics */}
          <section>
            <SectionHeading
              title="Case overview"
              subtitle="Current totals returned by the system for your account."
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Stat
                label="Active cases"
                value={data.activeCases}
                icon={<Activity size={21} />}
                color="blue"
                description="Cases currently marked active"
              />

              <Stat
                label="Awaiting review"
                value={data.awaitingReview}
                icon={<Clock3 size={21} />}
                color="amber"
                description="Reports requiring review"
              />

              <Stat
                label="New reports · 7 days"
                value={data.newReports}
                icon={<TrendingUp size={21} />}
                color="violet"
                description="Recent incoming reports"
              />

              <Stat
                label="Sightings to review"
                value={data.sightingsAwaiting}
                icon={<MapPinned size={21} />}
                color="amber"
                description="Reported sightings awaiting review"
              />

              {staff && (
                <Stat
                  label="AI jobs in progress"
                  value={data.jobsInProgress}
                  icon={<RefreshCw size={21} />}
                  color="blue"
                  description="Image-processing jobs"
                />
              )}

              {staff && (
                <Stat
                  label="Potential matches"
                  value={data.candidatesAwaiting}
                  icon={<FileSearch size={21} />}
                  color="violet"
                  description="Awaiting human verification"
                />
              )}

              <Stat
                label="Resolved cases"
                value={data.resolved}
                icon={<CheckCircle2 size={21} />}
                color="green"
                description="Cases marked resolved"
              />
            </div>
          </section>

          {/* Charts */}
          <section className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-2">
            <Card>
              <SectionHeading
                title="Cases by status"
                subtitle="Distribution of case statuses in the current results."
              />

              {data.statusDistribution.length === 0 ? (
                <Empty>No case status data is available yet.</Empty>
              ) : (
                <div
                  className="h-[280px] w-full min-w-0"
                  role="img"
                  aria-label="Bar chart showing cases grouped by status"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.statusDistribution}
                      margin={{ top: 8, right: 8, left: -18, bottom: 8 }}
                    >
                      <CartesianGrid
                        stroke="#e9eef5"
                        strokeDasharray="4 4"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="status"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: '#64748b' }}
                        tickMargin={10}
                      />
                      <YAxis
                        allowDecimals={false}
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: '#64748b' }}
                      />
                      <Tooltip
                        cursor={{ fill: '#f1f5f9' }}
                        contentStyle={{
                          borderRadius: 12,
                          border: '1px solid #e2e8f0',
                          boxShadow: '0 8px 24px rgb(15 23 42 / 8%)',
                          fontSize: 12,
                        }}
                      />
                      <Bar
                        dataKey="count"
                        name="Cases"
                        fill="#2563eb"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={52}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>

            <Card>
              <SectionHeading
                title="Reporting activity"
                subtitle="New cases recorded over the last 30 days."
              />

              {data.trend.length === 0 ? (
                <Empty>No reporting trend data is available yet.</Empty>
              ) : (
                <div
                  className="h-[280px] w-full min-w-0"
                  role="img"
                  aria-label="Line chart showing new cases over time"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={data.trend}
                      margin={{ top: 8, right: 12, left: -18, bottom: 8 }}
                    >
                      <CartesianGrid
                        stroke="#e9eef5"
                        strokeDasharray="4 4"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="day"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: '#64748b' }}
                        minTickGap={20}
                      />
                      <YAxis
                        allowDecimals={false}
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: '#64748b' }}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 12,
                          border: '1px solid #e2e8f0',
                          boxShadow: '0 8px 24px rgb(15 23 42 / 8%)',
                          fontSize: 12,
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="count"
                        name="New cases"
                        stroke="#2563eb"
                        strokeWidth={3}
                        dot={{ r: 3, fill: '#2563eb', strokeWidth: 0 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>
          </section>

          {/* Sightings map */}
          <Card>
            <SectionHeading
              title="Reported sightings map"
              subtitle="Approximate reported locations, rounded to about 1 km. These are reports, not verified live positions."
            />

            {data.sightingPoints.length === 0 ? (
              <Empty>
                No sightings with coordinates are available for this view.
              </Empty>
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <MapContainer
                  key={`${data.sightingPoints[0].latitude}-${data.sightingPoints[0].longitude}-${data.sightingPoints.length}`}
                  center={[
                    data.sightingPoints[0].latitude,
                    data.sightingPoints[0].longitude,
                  ]}
                  zoom={5}
                  scrollWheelZoom={false}
                  style={{ height: 340, width: '100%' }}
                >
                  <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {data.sightingPoints.map((point, index) => (
                    <CircleMarker
                      key={`${point.latitude}-${point.longitude}-${index}`}
                      center={[point.latitude, point.longitude]}
                      radius={8}
                      pathOptions={{
                        color:
                          point.status === 'APPROVED'
                            ? '#15803d'
                            : '#b45309',
                        fillColor:
                          point.status === 'APPROVED'
                            ? '#22c55e'
                            : '#f59e0b',
                        fillOpacity: 0.65,
                        weight: 2,
                      }}
                    >
                      <Popup>
                        <div className="space-y-2 text-sm">
                          <p className="font-semibold">
                            {point.status === 'APPROVED'
                              ? 'Reviewed sighting'
                              : 'Unreviewed sighting'}
                          </p>
                          <Badge value={point.status} />
                          <p>{fmt(point.seenAt)}</p>
                          <p className="max-w-52 text-xs text-slate-500">
                            Approximate report location, not a verified
                            position.
                          </p>
                        </div>
                      </Popup>
                    </CircleMarker>
                  ))}
                </MapContainer>
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-green-600" />
                Reviewed
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                Awaiting review
              </span>
            </div>
          </Card>

          {/* Recent activity */}
          <Card>
            <SectionHeading
              title="Recent activity"
              subtitle="Latest activity entries available to your account."
            />

            {data.recentActivity.length === 0 ? (
              <Empty>No recent activity is available.</Empty>
            ) : (
              <ul className="divide-y divide-slate-100">
                {data.recentActivity.map((activity, index) => (
                  <li
                    key={`${activity.createdAt}-${activity.action}-${index}`}
                    className="flex items-start gap-3 py-4 first:pt-0 last:pb-0"
                  >
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                      <Activity size={17} />
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="break-words text-sm font-semibold text-slate-800">
                        {activity.action}
                      </p>

                      {activity.entityType && (
                        <p className="mt-1 text-xs text-slate-500">
                          {activity.entityType}
                        </p>
                      )}

                      <p className="mt-1 text-xs text-slate-400">
                        {fmt(activity.createdAt)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
