import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProfilePage = () => {
  const { user, login, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

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
      <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p>You are signed in as {user.email}</p>
        <button
          type="button"
          onClick={logout}
          style={{ width: 'fit-content', background: '#c2415c', color: '#fff', padding: '6px 12px', border: 'none', cursor: 'pointer' }}
        >
          Sign out
        </button>
      </section>
    );
  }

  return (
    <section style={{ maxWidth: 360, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <header>
        <h1 style={{ fontSize: 28, marginBottom: 4, color: '#c2415c' }}>Sign in</h1>
        <p>Access saved carts, checkout faster, and view your order history.</p>
      </header>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <label style={{ fontSize: 14 }}>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            style={{ marginTop: 4, padding: '6px 8px', width: '100%' }}
          />
        </label>
        <label style={{ fontSize: 14 }}>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            style={{ marginTop: 4, padding: '6px 8px', width: '100%' }}
          />
        </label>
        {error && <p style={{ color: '#c2415c' }}>{error}</p>}
        <button
          type="submit"
          disabled={isLoading}
          style={{ background: '#c2415c', color: '#fff', padding: '8px 16px', border: 'none', cursor: 'pointer', opacity: isLoading ? 0.6 : 1 }}
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </section>
  );
};
