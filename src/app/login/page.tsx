import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth/session';
import LoginForm from '@/components/auth/LoginForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) {
    if (user.role === 'ADMIN') {
      redirect('/admin');
    } else {
      redirect('/barista/orders');
    }
  }

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 py-12 bg-[#141210] min-h-screen">
      <div className="w-full max-w-sm mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-[#9E958C] hover:text-[#F5F0EB] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to cafe home</span>
        </Link>
      </div>

      <LoginForm />
    </div>
  );
}
