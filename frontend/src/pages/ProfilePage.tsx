import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoginForm } from '../components/LoginForm';

export const ProfilePage = () => {
  const { user, login, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleLogin = async (email: string, password: string) => {
    setError(null);
    try {
      await login({ email, password });
    } catch (err) {
      console.error(err);
      setError('Email or Password incorrect');
    }
  };

  if (user) {
    return (
      <section className="min-h-screen flex items-center justify-center px-4 bg-background">
        <div className="w-full max-w-md bg-card/70 backdrop-blur-lg border border-foreground/15 rounded-2xl p-8 shadow-[0_8px_32px_rgba(180,80,100,0.10)] flex flex-col gap-3">
          <p className="text-foreground" style={{ fontFamily: "'Cormorant Garamond', serif" }}>You are signed in as {user.email}</p>
          <p className="text-sm text-muted-foreground">Current role: {user.role}</p>
          {user.role === 'owner' && (
            <p className="text-xs text-error">
              Store owners have full catalog control but cannot place orders from this storefront.
            </p>
          )}
          <button
            type="button"
            onClick={logout}
            className="px-4 py-2 rounded-full border border-border text-muted-foreground text-sm font-medium hover:bg-error/10 hover:text-error transition-all duration-200"
          >
            Sign out
          </button>
        </div>
      </section>
    );
  }

  return <LoginForm onSubmit={handleLogin} isLoading={isLoading} error={error} />;
};
