import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Bell, Search, ShieldCheck } from 'lucide-react';
import { useAuth } from './auth';

export default function Layout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const link = ({ isActive }: { isActive: boolean }) => `rounded px-2 py-1 text-sm ${isActive ? 'bg-brand-100 text-brand-900' : 'text-slate-700 hover:bg-slate-100'}`;
  return (
    <div className="min-h-screen">
      <a href="#main" className="sr-only focus:not-sr-only">Skip to content</a>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3">
          <Link to="/" className="mr-4 flex items-center gap-2 font-bold text-brand-900"><ShieldCheck size={20} aria-hidden /> MPAI</Link>
          <nav aria-label="Main" className="flex flex-wrap gap-1">
            <NavLink to="/search" className={link}><Search size={14} className="mr-1 inline" aria-hidden />Search</NavLink>
            <NavLink to="/how-it-works" className={link}>How it works</NavLink>
            {user && <NavLink to="/dashboard" className={link}>Dashboard</NavLink>}
            {user && <NavLink to="/cases" className={link}>{user.role === 'INVESTIGATOR' ? 'Assigned cases' : user.role === 'ADMIN' ? 'All cases' : 'My reports'}</NavLink>}
            {user && <NavLink to="/sightings" className={link}>Sightings</NavLink>}
            {(user?.role === 'INVESTIGATOR' || user?.role === 'ADMIN') && <NavLink to="/matches" className={link}>AI match queue</NavLink>}
            {user?.role === 'ADMIN' && <NavLink to="/admin/users" className={link}>Users</NavLink>}
            {user?.role === 'ADMIN' && <NavLink to="/admin/audit" className={link}>Audit</NavLink>}
            {user?.role === 'ADMIN' && <NavLink to="/admin/system" className={link}>System</NavLink>}
          </nav>
          <div className="ml-auto flex items-center gap-2 text-sm">
            {user ? (
              <>
                <NavLink to="/notifications" className={link} aria-label="Notifications"><Bell size={16} /></NavLink>
                <NavLink to="/profile" className={link}>{user.displayName}</NavLink>
                <button className="rounded border px-2 py-1" onClick={async () => { await logout(); nav('/'); }}>Log out</button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={link}>Log in</NavLink>
                <NavLink to="/register" className="rounded bg-brand-600 px-3 py-1 text-white">Register</NavLink>
              </>
            )}
          </div>
        </div>
      </header>
      <main id="main" className="mx-auto max-w-6xl px-4 py-6"><Outlet /></main>
      <footer className="border-t bg-white py-4 text-center text-xs text-slate-500">
        AI results are potential matches only and always require independent human review. <Link className="underline" to="/privacy">Privacy</Link> Â· <Link className="underline" to="/responsible-use">Responsible use</Link>
      </footer>
    </div>
  );
}