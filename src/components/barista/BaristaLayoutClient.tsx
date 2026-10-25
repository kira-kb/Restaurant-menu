'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { Coffee, Shield } from 'lucide-react';
import { Role } from '@prisma/client';
import { LanguageProvider, useLanguage } from '@/lib/i18n/context';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { SignOutButton } from '@/components/auth/SignOutButton';

interface BaristaLayoutClientProps {
  children: ReactNode;
  cafeName: string;
  user: {
    name: string;
    role: Role;
  };
}

function BaristaLayoutContent({
  children,
  cafeName,
  user,
}: BaristaLayoutClientProps) {
  const { dict } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-[#141210] text-[#F5F0EB]">
      {/* Top Barista Bar */}
      <header className="bg-[#141210]/95 backdrop-blur-md border-b border-[#2E2824] px-4 py-3 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#1E1A17] border border-[#2E2824] text-[#10B981] flex items-center justify-center shrink-0">
              <Coffee className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="font-semibold text-sm text-[#F5F0EB] block leading-tight truncate">
                {cafeName} • {dict.baristaBar}
              </span>
              <span className="text-[11px] text-[#9E958C] block truncate">
                {dict.loggedInAs} {user.name} ({user.role.toLowerCase()})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <LanguageSwitcher showIcon={false} />

            {user.role === Role.ADMIN && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 text-xs bg-[#1E1A17] hover:bg-[#2A2420] text-[#F5F0EB] border border-[#2E2824] px-3 py-1.5 rounded-xl transition-colors font-medium"
              >
                <Shield className="w-3.5 h-3.5 text-[#10B981]" />
                <span className="hidden sm:inline">{dict.adminPortal}</span>
              </Link>
            )}

            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6">
        {children}
      </main>
    </div>
  );
}

export default function BaristaLayoutClient(props: BaristaLayoutClientProps) {
  return (
    <LanguageProvider defaultLanguage="en" storageKey="barch_staff_lang">
      <BaristaLayoutContent {...props} />
    </LanguageProvider>
  );
}
