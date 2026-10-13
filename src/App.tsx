
import { Route, Routes } from 'react-router-dom';

import Layout from './Layout';
import { Guard } from './guards';

import { Landing, Info, NotFound } from './pages/Public';
import {
  PublicSearch,
  PublicCaseDetail,
} from './pages/PublicCases';
import {
  Login,
  Register,
} from './pages/AuthPages';

import { DashboardPage } from './pages/DashboardPage';
import {
  CaseList,
  CaseForm,
  CaseDetail,
} from './pages/Cases';
import {
  SightingForm,
  SightingList,
} from './pages/Sightings';
import {
  Notifications,
  Profile,
} from './pages/Account';
import {
  MatchQueue,
  MatchDetail,
} from './pages/Matches';
import {
  AdminUsers,
  AdminAudit,
  AdminSystem,
} from './pages/Admin';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public pages */}
        <Route path="/" element={<Landing />} />

        <Route
          path="/how-it-works"
          element={<Info kind="how" />}
        />

        <Route
          path="/privacy"
          element={<Info kind="privacy" />}
        />

        <Route
          path="/responsible-use"
          element={<Info kind="responsible" />}
        />

        <Route path="/search" element={<PublicSearch />} />

        <Route
          path="/search/:id"
          element={<PublicCaseDetail />}
        />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Authenticated user pages */}
        <Route
          path="/dashboard"
          element={
            <Guard>
              <DashboardPage />
            </Guard>
          }
        />

        <Route
          path="/cases"
          element={
            <Guard>
              <CaseList />
            </Guard>
          }
        />

        <Route
          path="/cases/new"
          element={
            <Guard>
              <CaseForm />
            </Guard>
          }
        />

        <Route
          path="/cases/:id"
          element={
            <Guard>
              <CaseDetail />
            </Guard>
          }
        />

        <Route
          path="/cases/:id/edit"
          element={
            <Guard>
              <CaseForm />
            </Guard>
          }
        />

        <Route
          path="/sightings"
          element={
            <Guard>
              <SightingList />
            </Guard>
          }
        />

        <Route
          path="/sightings/new"
          element={
            <Guard>
              <SightingForm />
            </Guard>
          }
        />

        <Route
          path="/notifications"
          element={
            <Guard>
              <Notifications />
            </Guard>
          }
        />

        <Route
          path="/profile"
          element={
            <Guard>
              <Profile />
            </Guard>
          }
        />

        {/* Investigator and Admin pages */}
        <Route
          path="/matches"
          element={
            <Guard roles={['INVESTIGATOR', 'ADMIN']}>
              <MatchQueue />
            </Guard>
          }
        />

        <Route
          path="/matches/:id"
          element={
            <Guard roles={['INVESTIGATOR', 'ADMIN']}>
              <MatchDetail />
            </Guard>
          }
        />

        {/* Admin-only pages */}
        <Route
          path="/admin/users"
          element={
            <Guard roles={['ADMIN']}>
              <AdminUsers />
            </Guard>
          }
        />

        <Route
          path="/admin/audit"
          element={
            <Guard roles={['ADMIN']}>
              <AdminAudit />
            </Guard>
          }
        />

        <Route
          path="/admin/system"
          element={
            <Guard roles={['ADMIN']}>
              <AdminSystem />
            </Guard>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
