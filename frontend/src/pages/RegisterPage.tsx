import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const RegisterPage = () => {
  const { user, register, isLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      await register({ email, password, firstName, lastName });
      setEmail('');
      setPassword('');
      setFirstName('');
      setLastName('');
    } catch (err) {
      console.error(err);
      setError('Unable to register. Email may already be in use.');
    }
  };

  if (user) {
    return null;
  }

  return (
    <section style={{ maxWidth: 360, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <header>
        <h1 style={{ fontSize: 28, marginBottom: 4, color: '#c2415c' }}>Create Account</h1>
        <p>Join Flora Tailor to save your cart and track orders.</p>
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
            minLength={6}
            style={{ marginTop: 4, padding: '6px 8px', width: '100%' }}
          />
        </label>
        <label style={{ fontSize: 14 }}>
          First Name (optional)
          <input
            type="text"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            style={{ marginTop: 4, padding: '6px 8px', width: '100%' }}
          />
        </label>
        <label style={{ fontSize: 14 }}>
          Last Name (optional)
          <input
            type="text"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            style={{ marginTop: 4, padding: '6px 8px', width: '100%' }}
          />
        </label>
        {error && <p style={{ color: '#c2415c' }}>{error}</p>}
        <button
          type="submit"
          disabled={isLoading}
          style={{ background: '#c2415c', color: '#fff', padding: '8px 16px', border: 'none', cursor: 'pointer', opacity: isLoading ? 0.6 : 1 }}
        >
          {isLoading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>
      <p style={{ fontSize: 14, textAlign: 'center' }}>
        Already have an account?{' '}
        <Link to="/profile" style={{ color: '#c2415c', textDecoration: 'none' }}>
          Sign in
        </Link>
      </p>
    </section>
  );
};
