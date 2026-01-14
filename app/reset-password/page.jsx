'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, ArrowLeft, KeyRound } from 'lucide-react';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setMessage('');
    setError('');

    try {
      await axios.post('/api/auth/reset-password', { token, password });
      setMessage('Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // State: Missing Token
  if (!token) {
    return (
      <div className="text-center space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
           <AlertCircle size={24} />
        </div>
        <h3 className="text-lg font-medium text-slate-900">Invalid or Expired Link</h3>
        <p className="text-slate-500">
          The link you used is invalid or missing the reset token. Please request a new one.
        </p>
        <div className="pt-4">
            <Link 
                href="/forgot-password" 
                className="text-sm font-medium text-amber-600 hover:text-amber-700 hover:underline"
            >
              Request new link &rarr;
            </Link>
        </div>
      </div>
    );
  }

  // State: Form
  return (
    <div className="space-y-8">
        <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Reset Password
            </h1>
            <p className="text-slate-500">
              Please enter your new password below.
            </p>
        </div>

        {/* Alerts */}
        {message && (
            <div className="flex items-center gap-3 rounded-md bg-green-50 p-4 text-sm text-green-700 border border-green-200">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
              <p>{message}</p>
            </div>
        )}
        {error && (
            <div className="flex items-center gap-3 rounded-md bg-red-50 p-4 text-sm text-red-700 border border-red-200">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password */}
            <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium leading-none text-slate-700">
                    New Password
                </label>
                <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                        <Lock className="h-5 w-5" />
                    </div>
                    <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        placeholder="••••••••"
                        className="flex h-11 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium leading-none text-slate-700">
                    Confirm Password
                </label>
                <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                        <KeyRound className="h-5 w-5" />
                    </div>
                    <input
                        id="confirmPassword"
                        type={showConfirm ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                        placeholder="••••••••"
                        className="flex h-11 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="inline-flex h-11 w-full items-center justify-center rounded-md bg-slate-900 px-8 text-sm font-medium text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50 shadow-md hover:shadow-lg"
            >
                {isLoading ? (
                    <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting Password...
                    </>
                ) : (
                    'Set New Password'
                )}
            </button>
        </form>

        <div className="text-center text-sm">
            <Link 
                href="/login" 
                className="inline-flex items-center gap-2 font-medium text-slate-600 hover:text-amber-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>
        </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      {/* Left Side: Brand Visuals */}
      <div className="hidden bg-slate-900 lg:flex flex-col justify-between relative overflow-hidden text-white p-12">
        {/* Background Image - Fresh Paint / Renovation Theme */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1595846519845-68e298c2edd8?q=80&w=1974&auto=format&fit=crop')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-slate-900/50" />

        <div className="relative z-10">
            <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded bg-amber-500 flex items-center justify-center font-bold text-slate-900">C</div>
                <h2 className="text-xl font-bold tracking-tight">Classic Painters</h2>
            </div>
        </div>

        <div className="relative z-10 max-w-lg">
            <blockquote className="space-y-2">
                <p className="text-lg font-medium leading-relaxed text-slate-200">
                "Preparation is everything. Secure your account to keep your project management seamless and safe."
                </p>
                <footer className="text-sm text-slate-400">
                &mdash; System Security
                </footer>
            </blockquote>
        </div>
      </div>

      {/* Right Side: Form Container */}
      <div className="flex items-center justify-center bg-white px-8 py-12 md:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-[400px]">
             {/* Suspense is required when using useSearchParams in Next.js */}
            <Suspense fallback={
                <div className="flex items-center justify-center space-x-2 text-slate-500">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Loading...</span>
                </div>
            }>
                <ResetPasswordForm />
            </Suspense>
        </div>
      </div>
    </div>
  );
}