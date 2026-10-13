
import { cleanup, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { api, ApiError } from '../api';
import { Guard, allowed } from '../guards';
import { validateRegister } from '../pages/AuthPages';
import { validateCase } from '../pages/Cases';
import { validateSighting } from '../pages/Sightings';

const state = vi.hoisted(() => ({ user: null as unknown }));

vi.mock('../auth', () => ({
  useAuth: () => ({
    user: state.user,
    loading: false,
  }),
  AuthProvider: ({ children }: { children: ReactNode }) => children,
}));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('form validation', () => {
  it('rejects short passwords and invalid emails', () => {
    const errors = validateRegister({
      email: 'nope',
      password: 'short',
      displayName: '',
    });

    expect(Object.keys(errors).sort()).toEqual([
      'displayName',
      'email',
      'password',
    ]);

    expect(
      validateRegister({
        email: 'a@b.co',
        password: 'longenough1',
        displayName: 'A',
      }),
    ).toEqual({});
  });

  it('requires consent and validates case coordinates', () => {
    const base = {
      fullName: 'Test Person',
      aliases: '',
      age: '',
      gender: '',
      description: '',
      lastSeenAt: '2025-01-01T10:00',
      lastSeenLocation: 'Somewhere',
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

    expect(validateCase(base).consentConfirmed).toBeDefined();

    expect(
      validateCase({
        ...base,
        consentConfirmed: true,
        latitude: '120',
      }).latitude,
    ).toBeDefined();

    expect(
      validateCase({
        ...base,
        consentConfirmed: true,
      }),
    ).toEqual({});
  });

  it('validates required sighting fields', () => {
    const errors = validateSighting({
      caseId: '',
      seenAt: '',
      locationDescription: '',
      description: '',
      latitude: '95',
      longitude: '',
      source: '',
    });

    expect(Object.keys(errors).sort()).toEqual([
      'caseId',
      'description',
      'latitude',
      'locationDescription',
      'seenAt',
    ]);
  });

  it('accepts valid sighting coordinates', () => {
    const valid = {
      caseId: 'case-123',
      seenAt: '2026-10-13T14:30',
      locationDescription: 'Near the public bus station',
      description: 'Observed someone matching the public case description.',
      latitude: '17.385',
      longitude: '78.4867',
      source: '',
    };

    expect(validateSighting(valid)).toEqual({});
  });

  it('rejects latitude outside the allowed range', () => {
    const base = {
      caseId: 'case-123',
      seenAt: '2026-10-13T14:30',
      locationDescription: 'Public bus station',
      description: 'A factual observation.',
      latitude: '-91',
      longitude: '78.4867',
      source: '',
    };

    expect(validateSighting(base).latitude).toBeDefined();

    expect(
      validateSighting({
        ...base,
        latitude: '91',
      }).latitude,
    ).toBeDefined();
  });

  it('rejects longitude outside the allowed range', () => {
    const base = {
      caseId: 'case-123',
      seenAt: '2026-10-13T14:30',
      locationDescription: 'Public bus station',
      description: 'A factual observation.',
      latitude: '17.385',
      longitude: '181',
      source: '',
    };

    expect(validateSighting(base).longitude).toBeDefined();

    expect(
      validateSighting({
        ...base,
        longitude: '-181',
      }).longitude,
    ).toBeDefined();
  });

  it('accepts coordinates at the valid boundaries', () => {
    const base = {
      caseId: 'case-123',
      seenAt: '2026-10-13T14:30',
      locationDescription: 'Public bus station',
      description: 'A factual observation.',
      latitude: '90',
      longitude: '180',
      source: '',
    };

    expect(validateSighting(base)).toEqual({});

    expect(
      validateSighting({
        ...base,
        latitude: '-90',
        longitude: '-180',
      }),
    ).toEqual({});
  });

  it('allows omitted optional coordinates', () => {
    const value = {
      caseId: 'case-123',
      seenAt: '2026-10-13T14:30',
      locationDescription: 'Public bus station',
      description: 'A factual observation.',
      latitude: '',
      longitude: '',
      source: '',
    };

    expect(validateSighting(value)).toEqual({});
  });
});

describe('route permissions', () => {
  const wrap = (
    user: unknown,
    roles?: ('ADMIN' | 'INVESTIGATOR' | 'REGISTERED_USER')[],
  ) => {
    state.user = user;

    return render(
      <MemoryRouter initialEntries={['/secret']}>
        <Routes>
          <Route
            path="/secret"
            element={
              <Guard roles={roles}>
                <div>secret</div>
              </Guard>
            }
          />

          <Route path="/login" element={<div>login page</div>} />

          <Route
            path="/dashboard"
            element={<div>dashboard page</div>}
          />
        </Routes>
      </MemoryRouter>,
    );
  };

  it('redirects anonymous users to login', () => {
    wrap(null);

    expect(screen.getByText('login page')).toBeTruthy();
  });

  it('redirects users who lack the required role', () => {
    wrap({ role: 'REGISTERED_USER' }, ['ADMIN']);

    expect(screen.getByText('dashboard page')).toBeTruthy();
  });

  it('allows users with a permitted role', () => {
    wrap({ role: 'ADMIN' }, ['ADMIN']);

    expect(screen.getByText('secret')).toBeTruthy();
  });

  it('allows the default permitted roles correctly', () => {
    expect(allowed('INVESTIGATOR', ['ADMIN'])).toBe(false);
    expect(allowed(undefined)).toBe(false);
    expect(allowed('ADMIN')).toBe(true);
  });
});

describe('API error handling', () => {
  it('maps server error messages and field errors', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            message: 'Validation failed',
            fields: {
              email: 'bad',
            },
          }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
            },
          },
        ),
      ),
    );

    await expect(api('/x')).rejects.toMatchObject({
      status: 400,
      message: 'Validation failed',
      fields: {
        email: 'bad',
      },
    });
  });

  it('reports network failures as ApiError', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new TypeError('down')),
    );

    const error: unknown = await api('/x').catch(
      (err: unknown) => err,
    );

    expect(error).toBeInstanceOf(ApiError);

    if (error instanceof ApiError) {
      expect(error.status).toBe(0);
    }
  });

  it('sends credentials and handles HTTP 204', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(null, { status: 204 }),
    );

    vi.stubGlobal('fetch', fetchMock);

    await expect(
      api('/auth/logout', { method: 'POST' }),
    ).resolves.toBeUndefined();

    expect(fetchMock).toHaveBeenCalled();

    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      credentials: 'include',
    });
  });
});
