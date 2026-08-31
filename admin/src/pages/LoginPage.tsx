import { Lock, Mail } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@loukatech.com');
  const [password, setPassword] = useState('ChangeMe!2026');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(email.trim().toLowerCase(), password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connexion impossible.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-slate-950 lg:grid-cols-[1fr_520px]">
      <section className="hidden bg-[radial-gradient(circle_at_30%_20%,rgba(37,99,235,.35),transparent_30%),radial-gradient(circle_at_70%_70%,rgba(124,58,237,.3),transparent_34%)] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-lg bg-white text-slate-950 font-bold">LT</div>
          <div>
            <strong className="block text-xl">LoukaTech</strong>
            <span className="text-sm text-slate-300">Console de pilotage</span>
          </div>
        </div>
        <div className="max-w-xl">
          <h1 className="text-5xl font-bold leading-tight">Gerez le contenu, les services et les statistiques du site.</h1>
          <p className="mt-5 text-lg text-slate-300">
            Acces reserve a l'equipe LoukaTech avec roles, journal d'activite et routes protegees.
          </p>
        </div>
      </section>
      <section className="grid place-items-center bg-slate-50 p-6">
        <form className="panel w-full max-w-md p-6 md:p-8" onSubmit={handleSubmit}>
          <div className="mb-8">
            <p className="text-sm font-semibold text-loukaBlue">Connexion admin</p>
            <h2 className="mt-2 text-3xl font-bold">Bienvenue</h2>
            <p className="mt-2 text-sm text-slate-600">Connectez-vous pour acceder au tableau de bord.</p>
          </div>
          <label className="mb-4 block text-sm font-semibold text-slate-700">
            Email
            <span className="mt-2 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 focus-within:border-loukaBlue focus-within:ring-4 focus-within:ring-blue-100">
              <Mail size={18} className="text-slate-400" />
              <input className="w-full py-3 outline-none" value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
            </span>
          </label>
          <label className="mb-4 block text-sm font-semibold text-slate-700">
            Mot de passe
            <span className="mt-2 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 focus-within:border-loukaBlue focus-within:ring-4 focus-within:ring-blue-100">
              <Lock size={18} className="text-slate-400" />
              <input className="w-full py-3 outline-none" value={password} onChange={(event) => setPassword(event.target.value)} type="password" required />
            </span>
          </label>
          {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}
          <button className="btn-primary w-full py-3" disabled={submitting}>
            {submitting ? 'Verification...' : 'Connexion'}
          </button>
        </form>
      </section>
    </div>
  );
}
