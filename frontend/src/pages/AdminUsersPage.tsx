import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchDirectory, DirectoryUser } from '../api/users';

export const AdminUsersPage = () => {
  const { user } = useAuth();
  const [directory, setDirectory] = useState<DirectoryUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      setDirectory([]);
      return;
    }

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const users = await fetchDirectory(user.token);
        setDirectory(users);
      } catch (err) {
        console.error(err);
        setError('Unable to load the user directory.');
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [user?.token, user?.role]);

  if (!user) {
    return <p>Please sign in with an administrator account to view the user directory.</p>;
  }

  if (user.role !== 'admin') {
    return (
      <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h1 style={{ fontSize: 28, marginBottom: 4, color: '#c2415c' }}>User directory</h1>
        <p>Only administrator accounts can view the full list of test users.</p>
      </section>
    );
  }

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <header>
        <h1 style={{ fontSize: 28, marginBottom: 4, color: '#c2415c' }}>User directory</h1>
        <p>Review every seeded account available in the development environment.</p>
      </header>
      {isLoading && <p>Loading user directory…</p>}
      {error && <p style={{ color: '#c2415c' }}>{error}</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {directory.map((entry) => (
          <article key={entry.email} style={{ border: '1px solid #eee', background: '#fff', padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ fontSize: 18, marginBottom: 4 }}>{entry.displayName}</h2>
                <p style={{ margin: 0, fontSize: 14, color: '#555' }}>{entry.email}</p>
              </div>
              <span
                style={{
                  background: '#fde4ec',
                  borderRadius: 999,
                  padding: '4px 12px',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#c2415c'
                }}
              >
                {entry.role}
              </span>
            </div>
            <p style={{ marginTop: 8, fontSize: 14 }}>{entry.description}</p>
            {entry.capabilities.length > 0 && (
              <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                {entry.capabilities.map((capability) => (
                  <li key={capability} style={{ fontSize: 13, color: '#555' }}>
                    {capability}
                  </li>
                ))}
              </ul>
            )}
          </article>
        ))}
        {!isLoading && directory.length === 0 && !error && (
          <p style={{ fontSize: 14, color: '#555' }}>No directory entries are available.</p>
        )}
      </div>
    </section>
  );
};
