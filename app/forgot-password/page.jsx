'use client';

import { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { ArrowLeft, Mail, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError('');

    try {
      await axios.post('/api/auth/forgot-password', { email });
      setMessage('Reset link sent! Please check your inbox.');
    } catch (err) {
      setError('Unable to send reset link. Please verify your email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      {/* Left Side: Brand Visuals */}
      <div className="hidden bg-slate-900 lg:flex flex-col justify-between relative overflow-hidden text-white p-12">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=2070&auto=format&fit=crop')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-slate-900/50" />

        {/* Content over image */}
        <div className="relative z-10">
            <div className="flex items-center gap-2">
                {/* Simple Logo Placeholder */}
                <div className="h-8 w-8 rounded bg-amber-500 flex items-center justify-center font-bold text-slate-900">C</div>
                <h2 className="text-xl font-bold tracking-tight">Classic Painters</h2>
            </div>
        </div>

        <div className="relative z-10 max-w-lg">
            <blockquote className="space-y-2">
                <p className="text-lg font-medium leading-relaxed text-slate-200">
                "Manage your projects, quotes, and gallery with our premium admin dashboard. Keeping New Zealand beautiful, one coat at a time."
                </p>
                <footer className="text-sm text-slate-400">
                &mdash; Admin CMS System
                </footer>
            </blockquote>
        </div>
      </div>

      {/* Right Side: The Form */}
      <div className="flex items-center justify-center bg-white px-8 py-12 md:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-[400px] space-y-8">
            
          {/* Header */}
          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Forgot Password?
            </h1>
            <p className="text-slate-500">
              No worries, we'll send you reset instructions.
            </p>
          </div>

          {/* Alert Messages */}
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700">
                Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Mail className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="admin@classicpainters.co.nz"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex h-11 w-full rounded-md border border-slate-300 bg-transparent text-black px-3 py-2 pl-10 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                />
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
                  Sending link...
                </>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>

          {/* Footer Link */}
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
      </div>
    </div>
  );
}