
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../ui';

const features = [
  {
    icon: '⌕',
    title: 'Search approved cases',
    description:
      'Explore cases that administrators have reviewed and explicitly approved for public visibility.',
    link: '/search',
    linkText: 'Explore cases',
    color: 'blue',
  },
  {
    icon: '＋',
    title: 'Report a missing person',
    description:
      'Registered users can submit reports for authorized review before information is published.',
    link: '/cases/new',
    linkText: 'Start a report',
    color: 'violet',
  },
  {
    icon: '◉',
    title: 'Share a sighting',
    description:
      'Submit relevant information securely so authorized investigators can review it.',
    link: '/sightings/new',
    linkText: 'Share information',
    color: 'emerald',
  },
  {
    icon: '⌘',
    title: 'AI-assisted matching',
    description:
      'Help authorized investigators prioritize potential similarities for further human review.',
    link: '/responsible-use',
    linkText: 'Understand AI safety',
    color: 'amber',
  },
];

const steps = [
  {
    number: '01',
    title: 'Submit a report',
    description:
      'An authorized registered user submits a missing-person report with relevant information.',
  },
  {
    number: '02',
    title: 'Review and approval',
    description:
      'An administrator reviews the report and controls which approved details can be published.',
  },
  {
    number: '03',
    title: 'Share useful information',
    description:
      'Users can submit sightings that authorized investigators assess in context.',
  },
  {
    number: '04',
    title: 'Human-led assessment',
    description:
      'Investigators evaluate AI-assisted suggestions and evidence. Software never determines identity by itself.',
  },
];

const safetyItems = [
  {
    icon: '◇',
    title: 'Private by design',
    description:
      'Sensitive photos and records should remain protected behind server-side authorization.',
  },
  {
    icon: '◎',
    title: 'Human decision-making',
    description:
      'AI similarity scores are leads for review, not proof or probabilities of identity.',
  },
  {
    icon: '⌑',
    title: 'Accountable access',
    description:
      'Role-based permissions, review workflows and audit records help protect sensitive information.',
  },
];

const pages = {
  how: {
    eyebrow: 'THE PROCESS',
    title: 'How it works',
    intro:
      'A structured workflow designed to support responsible reporting and human-led investigation.',
    items: [
      'A registered user submits a missing-person report and confirms the required authorization.',
      'An administrator reviews the report. Only approved information is eligible for public display.',
      'Authorized investigators access case materials according to their permissions.',
      'The AI service can rank visually similar reference faces when configured and authorized.',
      'Investigators review the available evidence and record a decision with appropriate notes.',
      'Where policy requires it, a second reviewer independently reviews a proposed confirmation.',
      'A potential match never automatically identifies a person or closes a case.',
    ],
  },
  privacy: {
    eyebrow: 'YOUR INFORMATION',
    title: 'Privacy policy',
    intro:
      'Missing-person reports can contain highly sensitive personal and biometric information. Protecting it is essential.',
    items: [
      'Face images and face embeddings must be handled as highly sensitive biometric information.',
      'Photos and private case details must not be exposed through public pages or unauthenticated API endpoints.',
      'Only users with the required server-verified permissions should access private records.',
      'Public pages must contain only fields explicitly approved for publication.',
      'Retention and deletion rules must be documented, implemented and tested in the backend.',
      'Access to sensitive records should be audit-logged, with logs protected from unauthorized access.',
      'Operators must establish an appropriate lawful basis, consent process and retention schedule before deployment.',
      'Do not upload sensitive real-person photos to a development or demonstration environment without authorization.',
    ],
  },
  responsible: {
    eyebrow: 'SAFETY FIRST',
    title: 'Responsible use',
    intro:
      'Technology can support an investigation, but it cannot replace careful evidence assessment or human judgment.',
    items: [
      'AI output is a lead for investigation, not proof of identity.',
      'Never accuse, detain, expose or contact someone based only on an AI similarity score.',
      'Do not use the system for covert tracking, mass surveillance or scraping personal photographs.',
      'A low similarity score must not be treated as proof that two images depict different people.',
      'Image quality, camera angle, lighting, age and other factors can affect comparisons.',
      'Similarity scores are not identity probabilities unless independently calibrated and validated for that purpose.',
      'Evaluate accuracy, false matches, false non-matches and performance across relevant groups before operational use.',
      'Restrict access to authorized personnel, provide human review and maintain a documented escalation process.',
    ],
  },
} as const;

type InfoKind = keyof typeof pages;

function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(22px)',
        transition: `opacity 650ms ease ${delay}ms, transform 650ms ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

function Icon({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl ${className}`}
    >
      {children}
    </span>
  );
}

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-1">
      {diagonal ? '↗' : '→'}
    </span>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  light = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  light?: boolean;
}) {
  return (
    <div className="mx-auto mb-12 max-w-2xl text-center">
      <p
        className={`mb-3 text-xs font-bold uppercase tracking-[0.22em] ${
          light ? 'text-blue-200' : 'text-blue-700'
        }`}
      >
        {eyebrow}
      </p>
      <h2
        className={`text-3xl font-extrabold tracking-tight sm:text-4xl ${
          light ? 'text-white' : 'text-slate-950'
        }`}
      >
        {title}
      </h2>
      <p
        className={`mt-4 text-base leading-7 ${
          light ? 'text-slate-300' : 'text-slate-600'
        }`}
      >
        {description}
      </p>
    </div>
  );
}

export function Landing() {
  return (
    <main className="overflow-hidden bg-white text-slate-900">
      <style>{`
        @keyframes mpai-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes mpai-pulse {
          0%, 100% { opacity: .45; transform: scale(.96); }
          50% { opacity: 1; transform: scale(1.04); }
        }
        @keyframes mpai-shimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        .mpai-float { animation: mpai-float 5s ease-in-out infinite; }
        .mpai-pulse { animation: mpai-pulse 2.8s ease-in-out infinite; }
        .mpai-gradient {
          background-size: 200% 200%;
          animation: mpai-shimmer 12s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .mpai-float, .mpai-pulse, .mpai-gradient {
            animation: none !important;
          }
          * { scroll-behavior: auto !important; }
        }
      `}</style>

      {/* Hero */}
      <section className="relative isolate">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50 via-white to-indigo-50" />
        <div className="absolute -right-24 top-0 -z-10 h-80 w-80 rounded-full bg-blue-200/30 blur-3xl" />
        <div className="absolute -left-24 bottom-0 -z-10 h-72 w-72 rounded-full bg-violet-200/20 blur-3xl" />

        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-2 lg:gap-10 lg:px-10 lg:py-24">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-4 py-2 text-sm font-semibold text-blue-800 shadow-sm">
              <span className="mpai-pulse h-2 w-2 rounded-full bg-emerald-500" />
              AI-assisted. Human-reviewed.
            </div>

            <h1 className="max-w-2xl text-4xl font-black leading-[1.1] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Helping families and investigators{' '}
              <span className="bg-gradient-to-r from-blue-700 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                work together.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
              Report a missing person, share useful information, and help authorized
              investigators review potential matches. Every identification requires
              human judgment, never software alone.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/search"
                className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-blue-700 px-6 py-3 font-bold text-white shadow-lg shadow-blue-700/20 transition duration-200 hover:-translate-y-0.5 hover:bg-blue-800 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-300"
              >
                Search approved cases <Arrow />
              </Link>
              <Link
                to="/register"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white/80 px-6 py-3 font-bold text-slate-800 transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
              >
                Create an account <Arrow diagonal />
              </Link>
            </div>

            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-600">
              <span className="inline-flex items-center gap-2">
                <span className="font-bold text-emerald-600">✓</span>
                Human-led decisions
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="font-bold text-emerald-600">✓</span>
                Privacy-conscious workflow
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="font-bold text-emerald-600">✓</span>
                Controlled access
              </span>
            </div>
          </div>

          {/* Decorative product illustration: no real personal data */}
          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-5 rounded-[2rem] bg-gradient-to-br from-blue-300/30 to-violet-300/30 blur-2xl" />
            <div className="mpai-float relative rounded-[1.75rem] border border-white bg-white/90 p-4 shadow-2xl shadow-blue-900/10 backdrop-blur-xl sm:p-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-700 text-xl font-black text-white">
                    M
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Investigation workspace</p>
                    <p className="text-xs text-slate-500">Illustrative interface</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                  ● Protected
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-500">Workflow</p>
                  <p className="mt-2 text-lg font-extrabold text-slate-900">Case review</p>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-600" />
                    <span className="text-xs text-slate-600">Pending assessment</span>
                  </div>
                </div>
                <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                  <p className="text-xs font-medium text-blue-700">AI assistance</p>
                  <p className="mt-2 text-lg font-extrabold text-slate-900">Potential leads</p>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-violet-500" />
                    <span className="text-xs text-slate-600">Human review needed</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-100 p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-slate-900">Review workflow</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Example statuses, not live case data
                    </p>
                  </div>
                  <span className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700">
                    In review
                  </span>
                </div>

                <div className="mt-5 flex items-center justify-between gap-1">
                  {[
                    ['Report', 'bg-blue-600'],
                    ['Review', 'bg-blue-600'],
                    ['Assess', 'bg-violet-500'],
                    ['Decision', 'bg-slate-300'],
                  ].map(([label, color], index) => (
                    <div className="flex min-w-0 flex-1 flex-col items-center gap-2" key={label}>
                      <div className={`h-2 w-full rounded-full ${color}`} />
                      <span className="text-center text-[10px] font-semibold text-slate-500 sm:text-xs">
                        {label}
                      </span>
                      {index < 2 && <span className="sr-only">Completed stage</span>}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-start gap-3 rounded-2xl bg-slate-950 p-4 text-white">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-lg">
                  ◈
                </span>
                <div>
                  <p className="text-sm font-bold">People make the final decision</p>
                  <p className="mt-1 text-xs leading-5 text-slate-300">
                    Similarity scores are investigative leads, not proof of identity.
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute -left-4 top-1/3 hidden rounded-2xl border border-white bg-white p-3 shadow-xl sm:block">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  ✓
                </span>
                <div>
                  <p className="text-xs font-bold text-slate-800">Access controlled</p>
                  <p className="text-[10px] text-slate-500">Role-based workflow</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
        <SectionHeading
          eyebrow="One connected workflow"
          title="Every contribution can matter."
          description="Simple paths for reporting, sharing information and supporting a responsible review process."
        />

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {features.map((feature, index) => (
            <Reveal key={feature.title} delay={index * 90}>
              <article className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-950/5">
                <Icon
                  className={
                    feature.color === 'blue'
                      ? 'bg-blue-50 text-blue-700'
                      : feature.color === 'violet'
                        ? 'bg-violet-50 text-violet-700'
                        : feature.color === 'emerald'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                  }
                >
                  {feature.icon}
                </Icon>
                <h3 className="mt-5 text-lg font-extrabold text-slate-900">
                  {feature.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-7 text-slate-600">
                  {feature.description}
                </p>
                <Link
                  className="group mt-5 inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-900 focus:outline-none focus:underline"
                  to={feature.link}
                >
                  {feature.linkText} <Arrow />
                </Link>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Workflow */}
      <section className="border-y border-slate-200 bg-slate-50/80 px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="A clear process"
            title="From report to responsible review."
            description="Each stage has a purpose. Public visibility and sensitive access must be controlled by authorized people."
          />

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {steps.map((step, index) => (
              <Reveal key={step.number} delay={index * 100}>
                <div className="relative h-full rounded-2xl border border-slate-200 bg-white p-6 transition duration-300 hover:border-blue-200 hover:shadow-lg">
                  <span className="text-sm font-black tracking-widest text-blue-700">
                    STEP {step.number}
                  </span>
                  <h3 className="mt-4 text-lg font-extrabold text-slate-900">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {step.description}
                  </p>
                  {index < steps.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="absolute -right-3 top-8 z-10 hidden h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-blue-700 xl:flex"
                    >
                      →
                    </span>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Trust and privacy */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
        <SectionHeading
          eyebrow="Trust is essential"
          title="Designed around responsible use."
          description="A sensitive application needs more than a polished interface. It needs clear boundaries, controlled access and accountable decisions."
        />

        <div className="grid gap-6 md:grid-cols-3">
          {safetyItems.map((item, index) => (
            <Reveal key={item.title} delay={index * 100}>
              <div className="flex h-full gap-4 rounded-2xl border border-slate-200 p-6 transition duration-300 hover:border-blue-200 hover:bg-blue-50/30">
                <Icon className="bg-slate-100 text-slate-800">{item.icon}</Icon>
                <div>
                  <h3 className="font-extrabold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    {item.description}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-8">
          <div className="flex flex-col gap-5 rounded-3xl bg-slate-950 p-7 text-white sm:p-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
                Responsible AI
              </p>
              <h3 className="mt-3 text-2xl font-extrabold sm:text-3xl">
                AI can assist. People remain accountable.
              </h3>
              <p className="mt-3 leading-7 text-slate-300">
                Never treat a similarity score as confirmation. Every potential
                match requires careful review using appropriate evidence.
              </p>
            </div>
            <Link
              to="/responsible-use"
              className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-white/20 px-5 py-3 font-bold text-white transition hover:bg-white/10 focus:outline-none focus:ring-4 focus:ring-blue-400/40 lg:self-center"
            >
              Read safety guidelines <Arrow diagonal />
            </Link>
          </div>
        </Reveal>
      </section>

      {/* Final CTA */}
      <section className="px-5 pb-16 sm:px-8 sm:pb-20 lg:px-10">
        <Reveal>
          <div className="mpai-gradient relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-gradient-to-r from-blue-800 via-indigo-700 to-violet-800 px-6 py-12 text-center shadow-xl shadow-blue-900/15 sm:px-12 sm:py-16">
            <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full border border-white/10" />
            <div className="absolute -bottom-28 -left-12 h-72 w-72 rounded-full border border-white/10" />
            <div className="relative mx-auto max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-200">
                Take the next step
              </p>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
                Help information reach the right people.
              </h2>
              <p className="mt-4 leading-7 text-blue-100">
                Explore approved public cases or create an account to access the
                platform's authorized reporting workflow.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  to="/search"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-blue-900 transition hover:-translate-y-0.5 hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-white/40"
                >
                  Search cases <Arrow />
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center rounded-xl border border-white/40 px-6 py-3 font-bold text-white transition hover:bg-white/10 focus:outline-none focus:ring-4 focus:ring-white/40"
                >
                  Create an account
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <div className="border-t border-slate-200 bg-white px-5 py-6 text-center text-xs leading-6 text-slate-500 sm:px-8">
        AI-assisted suggestions are not proof of identity. Sensitive information
        should only be accessed by authorized users.
      </div>
    </main>
  );
}

export function Info({ kind }: { kind: InfoKind }) {
  const page = pages[kind];

  return (
    <main className="min-h-[65vh] bg-gradient-to-b from-blue-50/70 to-white px-5 py-12 sm:px-8 sm:py-16">
      <div className="mx-auto max-w-4xl">
        <Reveal>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-blue-700 transition hover:text-blue-900 focus:outline-none focus:underline"
          >
            <span aria-hidden="true">←</span> Back to home
          </Link>

          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
              {page.eyebrow}
            </p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              {page.title}
            </h1>
            <p className="mt-4 max-w-2xl leading-7 text-slate-600">
              {page.intro}
            </p>

            <div className="mt-8 space-y-4">
              {page.items.map((item, index) => (
                <div
                  className="flex gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 sm:p-5"
                  key={item}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-sm font-extrabold text-blue-800">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <p className="pt-1 text-sm leading-7 text-slate-700">{item}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <p className="font-bold text-amber-950">Important</p>
              <p className="mt-2 text-sm leading-6 text-amber-900">
                This page describes responsible-use principles. The actual
                protection of records, permissions, deletion and audit logging
                depends on the backend implementation and operational policy.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/search"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200"
              >
                Search approved cases <Arrow />
              </Link>
              <Link
                to="/responsible-use"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200"
              >
                Responsible use
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </main>
  );
}

export function NotFound() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center bg-gradient-to-b from-blue-50/70 to-white px-5 py-16">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 text-4xl font-black text-blue-700">
          404
        </div>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
          Page not found
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
          This page isn't available.
        </h1>
        <p className="mt-4 leading-7 text-slate-600">
          The link may be incorrect, or the page may have moved. Return to the
          homepage or browse approved public cases.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/"
            className="rounded-xl bg-blue-700 px-5 py-3 font-bold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200"
          >
            Back to home
          </Link>
          <Link
            to="/search"
            className="rounded-xl border border-slate-300 px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200"
          >
            Search cases
          </Link>
        </div>
      </div>
    </main>
  );
}
