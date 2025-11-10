import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RegisterForm } from '../components/RegisterForm';

export const RegisterPage = () => {
  const { user, register, isLoading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleRegister = async (data: { email: string; password: string; firstName?: string; lastName?: string }) => {
    setError(null);

    if (data.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      await register(data);
    } catch (err) {
      console.error(err);
      setError('Unable to register. Email may already be in use.');
    }
  };

  if (user) {
    return null;
  }

  return <RegisterForm onSubmit={handleRegister} isLoading={isLoading} error={error} />;
};
