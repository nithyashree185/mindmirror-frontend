import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Brain, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const result = await login(email, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-[#e6e6fa] p-3 rounded-2xl">
            <Brain className="w-8 h-8 text-[#483d8b]" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-[#2f4f4f]">
          Welcome back
        </h2>
        <p className="mt-2 text-center text-sm text-[#64748b]">
          Understand your emotions, one reflection at a time.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-4 sm:rounded-2xl sm:px-10 border border-[#e5e7eb] shadow-sm">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-[#fef2f2] text-[#ef4444] p-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-[#2f4f4f] mb-1.5">
                Email address
              </label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="h-12"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2f4f4f] mb-1.5">
                Password
              </label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-12"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-base mt-2"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm">
            <span className="text-[#64748b]">Don't have an account? </span>
            <Link to="/register" className="font-medium text-[#483d8b] hover:text-[#5e50a8] flex items-center justify-center gap-1 mt-1">
              Create an account <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
