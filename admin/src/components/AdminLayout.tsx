import {
  Activity,
  BrainCircuit,
  BarChart3,
  FileText,
  Image,
  Inbox,
  Bot,
  LayoutDashboard,
  LogOut,
  Menu,
  Shield,
  Users,
  Wrench
} from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../lib/auth';

const navItems = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard, permission: 'stats' },
  { label: 'Pages', path: '/pages', icon: FileText, permission: 'pages' },
  { label: 'Services', path: '/services', icon: Wrench, permission: 'services' },
  { label: 'Messages', path: '/messages', icon: Inbox, permission: 'messages' },
  { label: 'Visiteurs', path: '/visitors', icon: BarChart3, permission: 'stats' },
  { label: 'Medias', path: '/media', icon: Image, permission: 'media' },
  { label: 'Pilotage IA', path: '/ai-control', icon: BrainCircuit, permission: 'heaven' },
  { label: 'Heaven IA', path: '/heaven', icon: Bot, permission: 'heaven' },
  { label: 'Administrateurs', path: '/admins', icon: Users, permission: 'admins' },
  { label: 'Journal', path: '/activity', icon: Activity, permission: 'activity' }
] as const;

export function AdminLayout() {
  const { user, logout, can } = useAuth();
  const [open, setOpen] = useState(false);
  const visibleItems = navItems.filter((item) => can(item.permission));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 transform border-r border-slate-200 bg-slate-950 text-white transition lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-20 items-center gap-3 border-b border-white/10 px-6">
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-gradient-to-br from-loukaBlue to-loukaViolet font-bold">
            LT
          </div>
          <div>
            <strong className="block text-lg">LoukaTech</strong>
            <span className="text-xs text-slate-400">Administration</span>
          </div>
        </div>
        <nav className="space-y-1 p-4">
          {visibleItems.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                  isActive ? 'bg-white text-slate-950' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {open && <button className="fixed inset-0 z-30 bg-slate-950/50 lg:hidden" onClick={() => setOpen(false)} />}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <button className="btn-secondary lg:hidden" onClick={() => setOpen(true)} aria-label="Ouvrir le menu">
              <Menu size={18} />
            </button>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-loukaBlue">Espace securise</p>
              <h1 className="text-xl font-bold">Admin LoukaTech</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">{user?.name}</p>
              <p className="text-xs text-slate-500">{user?.role.replace('_', ' ')}</p>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-blue-50 text-loukaBlue">
              <Shield size={18} />
            </div>
            <button className="btn-secondary" onClick={logout}>
              <LogOut size={16} />
              <span className="hidden sm:inline">Sortir</span>
            </button>
          </div>
        </header>
        <main className="p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
