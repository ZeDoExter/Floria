import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { MailIcon, LockIcon, EyeIcon, EyeOffIcon } from './icons';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const LoginForm = ({ onSubmit, isLoading, error }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(email, password);
    setEmail('');
    setPassword('');
  };

  return (
    <div className="h-fit mt-6 inset-0 flex justify-center">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="p-8 text-center text-primary-foreground relative">
            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="opacity-90">Sign in to continue</p>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MailIcon />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-surface text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockIcon />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className="w-full pl-10 pr-12 py-3 rounded-lg border border-border bg-surface text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOffIcon />
                  ) : (
                    <EyeIcon />
                  )}
                </button>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="ml-2 text-sm text-muted-foreground">Remember me</span>
                </label>
                <a href="#" className="text-sm text-primary hover:opacity-90">
                  Forgot password?
                </a>
              </div>

              {/* Error Message */}
              {error && (
                <p className="text-sm text-error bg-error/20 border border-error rounded-md px-3 py-2">
                  {error}
                </p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-secondary text-secondary-foreground py-3 px-4 rounded-lg font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="ml-1 font-medium text-primary hover:opacity-90 focus:outline-none"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Terms */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};
