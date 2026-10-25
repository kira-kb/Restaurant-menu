'use client';

import React, { useTransition } from 'react';
import { LogOut, Loader2 } from 'lucide-react';
import { logoutAction } from '@/lib/auth/actions';

export function SignOutButton() {
  const [isPending, startTransition] = useTransition();

  const handleSignOut = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isPending}
      className="inline-flex items-center gap-1.5 text-xs text-[#9E958C] hover:text-[#F5F0EB] bg-[#1E1A17] hover:bg-[#2A2420] border border-[#2E2824] px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50 cursor-pointer font-medium"
      title="Sign out of account"
    >
      {isPending ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span className="hidden sm:inline">Signing out...</span>
        </>
      ) : (
        <>
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sign out</span>
        </>
      )}
    </button>
  );
}

export default SignOutButton;

