import { ReactNode } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
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
} from 'lucide-react';
import { getSessionUser } from '@/lib/auth/session';
import { Role } from '@prisma/client';
import { SignOutButton } from '@/components/auth/SignOutButton';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();
  if (!user || user.role !== Role.ADMIN) {
    redirect('/login');
  }

  const navItems = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/audit', label: 'Barista audit', icon: Activity },
    { href: '/admin/menu', label: 'Menu items', icon: Utensils },
    { href: '/admin/categories', label: 'Categories', icon: FolderTree },
    { href: '/admin/tables', label: 'Tables & QR', icon: QrCode },
    { href: '/admin/staff', label: 'Staff accounts', icon: Users },
    { href: '/admin/orders', label: 'Order history', icon: Receipt },
    { href: '/admin/settings', label: 'Cafe settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#141210] text-[#F5F0EB]">
      {/* Desktop Sidebar / Mobile Header */}
      <aside className="w-full md:w-64 bg-[#1E1A17] border-b md:border-b-0 md:border-r border-[#2E2824] flex flex-col justify-between shrink-0">
        <div>
          {/* Logo / Header */}
          <div className="p-4 sm:p-5 border-b border-[#2E2824] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#241F1C] border border-[#2E2824] text-[#10B981] flex items-center justify-center">
                <Coffee className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-sm text-[#F5F0EB] block leading-tight">
                  Barch Admin
                </span>
                <span className="text-[11px] text-[#9E958C]">
                  Management portal
                </span>
              </div>
            </div>

            <Link
              href="/barista/orders"
              className="md:hidden text-xs text-[#9E958C] hover:text-[#F5F0EB] border border-[#2E2824] bg-[#241F1C] px-2.5 py-1 rounded-xl transition-colors"
              title="Switch to barista counter"
            >
              Barista view
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-2 sm:p-3 flex md:flex-col overflow-x-auto gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#9E958C] hover:text-[#F5F0EB] hover:bg-[#241F1C] whitespace-nowrap transition-colors"
                >
                  <Icon className="w-4 h-4 text-[#7E756C] shrink-0" />
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
            <span>Barista counter</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#9E958C]" />
          </Link>

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs truncate">
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
