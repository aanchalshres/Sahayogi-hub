'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import { Toaster, toast } from '@/app/components/ui/sonner';

interface FormData {
  email: string;
  password: string;
  name?: string;
  phone?: string;
}

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>();

  useEffect(() => {
    const mode = searchParams.get('mode');
    setIsLogin(mode !== 'signup');
    reset();
  }, [searchParams, reset]);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(isLogin ? 'Welcome back!' : 'Account created successfully!');

        if (result.token) {
          localStorage.setItem('sahayogi_token', result.token);
          localStorage.setItem('user', JSON.stringify(result.user));
        }

        setTimeout(() => router.push('/dashboard'), 1500);
      } else {
        toast.error(result.message || 'Authentication failed');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Toaster position="top-right" />

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img
            src="/logo3.png"
            alt="Sahayogi Logo"
            className="w-32 h-32 mx-auto mb-4 object-contain"
          />
          <h1 className="text-3xl font-bold text-gray-800">Sahayogi</h1>
          <p className="text-gray-600 mt-2">Volunteer Response & Verification System</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {isLogin ? (
            <>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                    placeholder="volunteer@example.com"
                  />
                  {typeof errors.email?.message === 'string' && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters',
                      },
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                    placeholder="********"
                  />
                  {typeof errors.password?.message === 'string' && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-[#4F46C8] text-white rounded-lg font-medium hover:bg-[#4338CA] disabled:opacity-50 transition"
                  >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </button>
                </div>
              </form>

              <div className="text-sm text-center text-gray-600">
                <p>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(false);
                      reset();
                    }}
                    className="text-[#4F46C8] font-medium hover:underline cursor-pointer"
                  >
                    Sign Up
                  </button>
                </p>
              </div>
            </>
          ) : (
            <>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    {...register('name', { required: 'Name is required' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                    placeholder="Roshan Shrestha"
                  />
                  {typeof errors.name?.message === 'string' && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    {...register('phone', { required: 'Phone is required' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                    placeholder="+977-98xxxxxxxx"
                  />
                  {typeof errors.phone?.message === 'string' && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                    placeholder="volunteer@example.com"
                  />
                  {typeof errors.email?.message === 'string' && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters',
                      },
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                    placeholder="********"
                  />
                  {typeof errors.password?.message === 'string' && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-[#4F46C8] text-white rounded-lg font-medium hover:bg-[#4338CA] disabled:opacity-50 transition"
                  >
                    {isLoading ? 'Signing up...' : 'Create Account'}
                  </button>
                </div>
              </form>

              <div className="text-sm text-center text-gray-600">
                <p>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setIsLogin(true)}
                    className="text-[#4F46C8] font-medium hover:underline cursor-pointer"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
