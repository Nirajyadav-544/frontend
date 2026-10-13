
import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';

import { useAuth } from './auth';
import type { Role } from './api';
import { Loading } from './ui';

export function allowed(
  role: Role | undefined,
  roles?: Role[],
): boolean {
  if (!role) {
    return false;
  }

  if (!roles || roles.length === 0) {
    return true;
  }

  return roles.includes(role);
}

interface GuardProps {
  roles?: Role[];
  children: ReactNode;
}

export function Guard({
  roles,
  children,
}: GuardProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{
          from: `${location.pathname}${location.search}${location.hash}`,
        }}
        replace
      />
    );
  }

  if (!allowed(user.role, roles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
