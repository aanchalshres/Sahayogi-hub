'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Toaster, toast } from '@/app/components/ui/sonner';
import { User, Building2, ArrowRight, Loader2 } from 'lucide-react';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';

interface FormData {
  email: string;
  password: string;
  name?: string;
  phone?: string;
  role?: 'volunteer' | 'ngo';
}

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'volunteer' | 'ngo'>('volunteer');
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
    
    const submitData = isLogin ? data : { ...data, role: selectedRole };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(isLogin ? 'Welcome back!' : 'Account created successfully!');

        if (result.token) {
          localStorage.setItem('sahayogi_token', result.token);
          localStorage.setItem('user', JSON.stringify(result.user));
        }

        const userRole = (result.user?.role as 'volunteer' | 'ngo' | undefined) ?? selectedRole;
        const destination = userRole === 'volunteer' ? '/volunteer' : '/dashboard';

        setTimeout(() => router.push(destination), 1500);
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
    <>
      <Navbar />
      <div className="min-h-screen bg-linear-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
        <Toaster position="top-right" />

        <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <img
              src="/logo3.png"
              alt="Sahayogi Logo"
              className="w-32 h-32 mx-auto mb-4 object-contain"
            />
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Sahayogi</h1>
          <p className="text-gray-600 mt-2">Volunteer Response & Verification System</p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Tab Switcher */}
          <div className="flex rounded-xl bg-gray-100 p-1 mb-6">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                reset();
              }}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                isLogin
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                reset();
              }}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                !isLogin
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign Up
            </button>
          </div>

          {isLogin ? (
            /* Login Form */
            <>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B5BD6] focus:border-transparent outline-none transition"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B5BD6] focus:border-transparent outline-none transition"
                    placeholder="Enter your password"
                  />
                  {typeof errors.password?.message === 'string' && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#5B5BD6] focus:ring-[#5B5BD6]" />
                    <span className="text-sm text-gray-600">Remember me</span>
                  </label>
                  <a href="#" className="text-sm text-[#5B5BD6] hover:underline font-medium">
                    Forgot password?
                  </a>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-[#5B5BD6] text-white rounded-lg font-medium hover:bg-[#4a4ac4] disabled:opacity-50 transition flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-6 text-sm text-center text-gray-600">
                <p>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(false);
                      reset();
                    }}
                    className="text-[#5B5BD6] font-medium hover:underline cursor-pointer"
                  >
                    Sign Up
                  </button>
                </p>
              </div>
            </>
          ) : (
            /* Sign Up Form with Role Toggle */
            <>
              {/* Role Toggle - Enhanced Styling */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  I want to join as a <span className="text-[#5B5BD6]">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('volunteer')}
                    className={`p-5 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-3 group ${
                      selectedRole === 'volunteer'
                        ? 'border-[#5B5BD6] bg-[#5B5BD6]/5 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
                      selectedRole === 'volunteer'
                        ? 'bg-[#5B5BD6] text-white'
                        : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                    }`}>
                      <User className="w-7 h-7" />
                    </div>
                    <div className="text-center">
                      <span className={`font-semibold text-base block ${
                        selectedRole === 'volunteer' ? 'text-[#5B5BD6]' : 'text-gray-700'
                      }`}>
                        Volunteer
                      </span>
                      <span className="text-xs text-gray-500">Individual helper</span>
                    </div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setSelectedRole('ngo')}
                    className={`p-5 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-3 group ${
                      selectedRole === 'ngo'
                        ? 'border-[#5B5BD6] bg-[#5B5BD6]/5 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
                      selectedRole === 'ngo'
                        ? 'bg-[#5B5BD6] text-white'
                        : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                    }`}>
                      <Building2 className="w-7 h-7" />
                    </div>
                    <div className="text-center">
                      <span className={`font-semibold text-base block ${
                        selectedRole === 'ngo' ? 'text-[#5B5BD6]' : 'text-gray-700'
                      }`}>
                        NGO
                      </span>
                      <span className="text-xs text-gray-500">Organization</span>
                    </div>
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {selectedRole === 'ngo' ? 'Organization Name' : 'Full Name'}
                  </label>
                  <input
                    type="text"
                    {...register('name', { required: 'Name is required' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B5BD6] focus:border-transparent outline-none transition"
                    placeholder={selectedRole === 'ngo' ? 'Nepal Care Foundation' : 'Roshan Shrestha'}
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B5BD6] focus:border-transparent outline-none transition"
                    placeholder="+977-98XXXXXXXX"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B5BD6] focus:border-transparent outline-none transition"
                    placeholder={selectedRole === 'ngo' ? 'contact@nepalcare.org' : 'volunteer@example.com'}
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B5BD6] focus:border-transparent outline-none transition"
                    placeholder="Create a password"
                  />
                  {typeof errors.password?.message === 'string' && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>

                <div className="flex items-start gap-2">
                  <input type="checkbox" required className="mt-1 w-4 h-4 rounded border-gray-300 text-[#5B5BD6] focus:ring-[#5B5BD6]" />
                  <span className="text-sm text-gray-600">
                    I agree to the{' '}
                    <a href="#" className="text-[#5B5BD6] hover:underline">Terms of Service</a>
                    {' '}and{' '}
                    <a href="#" className="text-[#5B5BD6] hover:underline">Privacy Policy</a>
                  </span>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-[#5B5BD6] text-white rounded-lg font-medium hover:bg-[#4a4ac4] disabled:opacity-50 transition flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        Create {selectedRole === 'ngo' ? 'Organization' : 'Volunteer'} Account
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-6 text-sm text-center text-gray-600">
                <p>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setIsLogin(true)}
                    className="text-[#5B5BD6] font-medium hover:underline cursor-pointer"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </>
          )}
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-gray-500 hover:text-[#5B5BD6] transition-colors">
            ← Back to Home
          </Link>
        </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
