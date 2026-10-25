import Link from 'next/link';
import { Coffee, ArrowRight, QrCode, Clock, MapPin } from 'lucide-react';
import prisma from '@/lib/prisma';
import { getPublicShopSettings } from '@/lib/menu';

export const revalidate = 3600;

export default async function HomePage() {
  const settings = await getPublicShopSettings();
  const tables = await prisma.cafeTable.findMany({
    where: { isActive: true },
    orderBy: { tableNumber: 'asc' },
    select: { id: true, tableNumber: true, displayName: true },
  });

  return (
    <div className="flex-1 flex flex-col justify-between max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-16 text-[#F5F0EB]">
      {/* Brand Header */}
      <header className="flex items-center justify-between border-b border-[#2E2824] pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1E1A17] border border-[#2E2824] text-[#10B981] flex items-center justify-center">
            <Coffee className="w-5 h-5" />
          </div>
          <div>
            <span className="font-semibold text-lg text-[#F5F0EB] block leading-tight">
              {settings.cafeName}
            </span>
            <span className="text-xs text-[#9E958C] block">
              {settings.tagline}
            </span>
          </div>
        </div>

        <Link
          href="/login"
          className="text-xs text-[#9E958C] hover:text-[#F5F0EB] bg-[#1E1A17] hover:bg-[#2A2420] border border-[#2E2824] px-3.5 py-1.5 rounded-xl transition-colors font-medium"
        >
          Staff login
        </Link>
      </header>

      {/* Hero Section */}
      <main className="my-10 sm:my-14 space-y-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-1.5 bg-[#1E1A17] border border-[#2E2824] text-[#10B981] text-xs px-3 py-1 rounded-full font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>Freshly roasted Ethiopian single origins</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-light text-[#F5F0EB] tracking-tight leading-tight">
            Order directly from your table.
          </h1>
          <p className="text-sm sm:text-base text-[#9E958C] max-w-xl leading-relaxed">
            Scan your table&apos;s QR code or select your table below to browse our seasonal harvest coffees, signature drinks, and fresh pastries.
          </p>
        </div>

        {/* Action Options */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-[#1E1A17] border border-[#2E2824] rounded-2xl p-6 flex flex-col justify-between space-y-5">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-[#241F1C] border border-[#2E2824] text-[#10B981] flex items-center justify-center">
                <Coffee className="w-4 h-4" />
              </div>
              <h2 className="text-base font-medium text-[#F5F0EB]">
                Browse the menu
              </h2>
              <p className="text-xs text-[#9E958C] leading-relaxed">
                Explore our full coffee lineup, brew methods, and bakery items. Select your table at checkout.
              </p>
            </div>
            <Link
              href="/menu"
              className="inline-flex items-center justify-center gap-2 bg-[#10B981] hover:bg-[#059669] text-[#141210] text-xs font-semibold py-2.5 px-4 rounded-xl transition-colors shadow-xs"
            >
              <span>Open digital menu</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-[#1E1A17] border border-[#2E2824] rounded-2xl p-6 flex flex-col justify-between space-y-5">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-[#241F1C] border border-[#2E2824] text-[#10B981] flex items-center justify-center">
                <QrCode className="w-4 h-4" />
              </div>
              <h2 className="text-base font-medium text-[#F5F0EB]">
                Quick table selection
              </h2>
              <p className="text-xs text-[#9E958C] leading-relaxed">
                Already seated? Jump directly into ordering with your table pre-selected.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {tables.slice(0, 6).map((t) => (
                <Link
                  key={t.id}
                  href={`/menu?table=${t.id}`}
                  className="text-center py-2 px-1 text-xs bg-[#241F1C] hover:bg-[#2A2420] border border-[#2E2824] hover:border-[#10B981] text-[#F5F0EB] rounded-xl font-medium transition-colors"
                >
                  {t.tableNumber}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Location & Details */}
        <div className="bg-[#1E1A17] border border-[#2E2824] rounded-2xl p-4 text-xs text-[#9E958C] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#10B981] shrink-0" />
            <span className="text-[#F5F0EB]">{settings.address}</span>
          </div>
          <div>
            <span>Tel: <span className="text-[#F5F0EB] font-medium">{settings.phone}</span></span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#2E2824] pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#9E958C] gap-3">
        <span>© {new Date().getFullYear()} {settings.cafeName}. All rights reserved.</span>
        <div className="flex items-center gap-4">
          <Link href="/menu" className="hover:text-[#F5F0EB] transition-colors">
            Menu
          </Link>
          <Link href="/login" className="hover:text-[#F5F0EB] transition-colors">
            Staff portal
          </Link>
        </div>
      </footer>
    </div>
  );
}
