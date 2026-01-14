'use client';

import { useActionState, useState } from 'react';
import { authenticate } from '../lib/actions'; // Ensure this path is correct
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [errorMessage, dispatch, isPending] = useActionState(
    authenticate,
    undefined
  );

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      
      {/* Left Side: Brand Visuals (Consistent with Forgot Password) */}
      <div className="hidden bg-slate-900 lg:flex flex-col justify-between relative overflow-hidden text-white p-12">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1562663474-6cbb3eaa4d14?q=80&w=1974&auto=format&fit=crop')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-slate-900/50" />

        {/* Brand Logo Area */}
        <div className="relative z-10">
            <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded bg-amber-500 flex items-center justify-center font-bold text-slate-900">C</div>
                <h2 className="text-xl font-bold tracking-tight">Classic Painters</h2>
            </div>
        </div>

        {/* Quote/Testimonial */}
        <div className="relative z-10 max-w-lg">
            <blockquote className="space-y-2">
                <p className="text-lg font-medium leading-relaxed text-slate-200">
                "Quality is not an act, it is a habit. Welcome back to the command center of New Zealand's finest finishes."
                </p>
                <footer className="text-sm text-slate-400">
                &mdash; Admin Portal
                </footer>
            </blockquote>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex items-center justify-center bg-white px-8 py-12 md:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-[400px] space-y-8">
            
          {/* Header */}
          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Welcome Back
            </h1>
            <p className="text-slate-500">
              Please sign in to access your dashboard.
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="flex items-center gap-3 rounded-md bg-red-50 p-4 text-sm text-red-700 border border-red-200 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p>{errorMessage}</p>
            </div>
          )}

          {/* Form */}
          <form action={dispatch} className="space-y-6">
            
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium leading-none text-slate-700">
                Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Mail className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="admin@classicpainters.co.nz"
                  className="flex h-11 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 pl-10 text-sm placeholder:text-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-sm font-medium leading-none text-slate-700">
                        Password
                    </label>
                </div>
              
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="flex h-11 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 pl-10 pr-10 text-sm placeholder:text-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end">
                <Link
                    href="/forgot-password"
                    className="text-sm font-medium text-amber-600 hover:text-amber-700 hover:underline transition-colors"
                >
                    Forgot password?
                </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex h-11 w-full items-center justify-center rounded-md bg-slate-900 px-8 text-sm font-medium text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50 shadow-md hover:shadow-lg gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                    Sign in
                    <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}