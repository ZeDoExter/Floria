import { FormEvent, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const ProfilePage = () => {
  const { user, login, logout, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    try {
      await login({ email, password });
      setEmail('');
      setPassword('');
    } catch (err) {
      console.error(err);
      setError('Unable to log in with those credentials.');
    }
  };

  if (user) {
    return (
      <section className="space-y-4">
        <header>
          <h1 className="text-3xl font-bold text-rose-600">Welcome back, {user.displayName}</h1>
          <p className="text-slate-600">Manage your preferences and upcoming orders.</p>
        </header>
        <div className="rounded border border-rose-100 bg-white p-4">
          <p className="text-sm text-slate-600">Signed in as {user.email}</p>
          <button onClick={logout} className="mt-3 rounded bg-rose-500 px-4 py-2 text-sm font-semibold text-white">
            Sign out
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-sm space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-rose-600">Sign in</h1>
        <p className="text-slate-600">Access saved carts, checkout faster, and view your order history.</p>
      </header>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm">
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="mt-1 w-full rounded border border-rose-100 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="mt-1 w-full rounded border border-rose-100 px-3 py-2"
          />
        </label>
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <button type="submit" disabled={isLoading} className="w-full rounded bg-rose-500 px-6 py-2 font-semibold text-white">
          {isLoading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </section>
  );
};
