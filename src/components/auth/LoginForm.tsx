'use client';

import React, { useActionState } from 'react';
import { Coffee, Lock, Mail, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { loginAction, LoginState } from '@/lib/auth/actions';

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState<LoginState | null, FormData>(
    loginAction,
    null
  );

  return (
    <div className="w-full max-w-sm mx-auto bg-[#1E1A17] border border-[#2E2824] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
      <div className="text-center space-y-2">
        <div className="w-10 h-10 bg-[#2A2420] text-[#10B981] border border-[#2E2824] rounded-xl mx-auto flex items-center justify-center">
          <Coffee className="w-5 h-5" />
        </div>
        <h1 className="text-lg font-semibold text-[#F5F0EB]">Staff portal</h1>
        <p className="text-xs text-[#9E958C]">
          Sign in to access barista queue or administration
        </p>
      </div>

      {state?.error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{state.error}</span>
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#F5F0EB] block">
            Email address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7E756C]" />
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="barista@barchcoffee.com"
              className="w-full bg-[#241F1C] border border-[#2E2824] text-[#F5F0EB] placeholder-[#7E756C] text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-hidden focus:border-[#10B981] transition-colors"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#F5F0EB] block">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7E756C]" />
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              placeholder="••••••••••••"
              className="w-full bg-[#241F1C] border border-[#2E2824] text-[#F5F0EB] placeholder-[#7E756C] text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-hidden focus:border-[#10B981] transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-[#10B981] hover:bg-[#059669] disabled:opacity-50 text-[#141210] text-xs font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer mt-2"
        >
          {isPending ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <span>Sign in</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      <div className="border-t border-[#2E2824] pt-4 text-center">
        <p className="text-[11px] text-[#7E756C]">
          Authorized staff only. Public registration is disabled.
        </p>
      </div>
    </div>
  );
}
