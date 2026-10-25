'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Coffee,
  LayoutDashboard,
  Utensils,
  FolderTree,
  QrCode,
  Users,
  Receipt,
  Settings,
  ExternalLink,
  Activity,
  Sparkles,
} from 'lucide-react';
import { LanguageProvider, useLanguage } from '@/lib/i18n/context';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { SignOutButton } from '@/components/auth/SignOutButton';

interface AdminLayoutClientProps {
  children: ReactNode;
  user: {
    name: string;
    email: string;
  };
}

function AdminLayoutContent({ children, user }: AdminLayoutClientProps) {
  const { dict } = useLanguage();
  const pathname = usePathname();

  const navItems = [
    { href: '/admin', label: dict.adminOverview, icon: LayoutDashboard },
    { href: '/admin/audit', label: dict.adminAudit, icon: Activity },
    { href: '/admin/menu', label: dict.adminMenu, icon: Utensils },
    { href: '/admin/categories', label: dict.adminCategories, icon: FolderTree },
    { href: '/admin/addons', label: dict.adminAddons, icon: Sparkles },
    { href: '/admin/tables', label: dict.adminTables, icon: QrCode },
    { href: '/admin/staff', label: dict.adminStaff, icon: Users },
    { href: '/admin/orders', label: dict.adminOrders, icon: Receipt },
    { href: '/admin/settings', label: dict.adminSettings, icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#141210] text-[#F5F0EB]">
      {/* Desktop Sidebar / Mobile Header */}
      <aside className="w-full md:w-64 bg-[#1E1A17] border-b md:border-b-0 md:border-r border-[#2E2824] flex flex-col justify-between shrink-0">
        <div>
          {/* Logo / Header */}
          <div className="p-4 sm:p-5 border-b border-[#2E2824] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-[#241F1C] border border-[#2E2824] text-[#10B981] flex items-center justify-center shrink-0">
                <Coffee className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="font-semibold text-sm text-[#F5F0EB] block leading-tight truncate">
                  {dict.adminPortalTitle}
                </span>
                <span className="text-[11px] text-[#9E958C] truncate block">
                  {dict.adminPortalSubtitle}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <LanguageSwitcher showIcon={false} />

              <Link
                href="/barista/orders"
                className="md:hidden text-xs text-[#9E958C] hover:text-[#F5F0EB] border border-[#2E2824] bg-[#241F1C] px-2.5 py-1 rounded-xl transition-colors"
                title="Switch to barista counter"
              >
                {dict.baristaCounter}
              </Link>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-2 sm:p-3 flex md:flex-col overflow-x-auto gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-[#10B981]/15 text-[#10B981] font-semibold border border-[#10B981]/30'
                      : 'text-[#9E958C] hover:text-[#F5F0EB] hover:bg-[#241F1C]'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-[#10B981]' : 'text-[#7E756C]'
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Area */}
        <div className="p-3 sm:p-4 border-t border-[#2E2824] space-y-2 hidden md:block">
          <Link
            href="/barista/orders"
            className="w-full flex items-center justify-between text-xs text-[#F5F0EB] bg-[#241F1C] hover:bg-[#2A2420] border border-[#2E2824] px-3 py-2 rounded-xl font-medium transition-colors"
          >
            <span>{dict.baristaCounter}</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#9E958C]" />
          </Link>

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs truncate pr-2">
              <span className="font-medium text-[#F5F0EB] block truncate">
                {user.name}
              </span>
              <span className="text-[10px] text-[#9E958C]">Administrator</span>
            </div>

            <SignOutButton />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}

export default function AdminLayoutClient(props: AdminLayoutClientProps) {
  return (
    <LanguageProvider defaultLanguage="en" storageKey="barch_staff_lang">
      <AdminLayoutContent {...props} />
    </LanguageProvider>
  );
}
