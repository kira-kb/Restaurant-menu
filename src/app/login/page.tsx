import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth/session';
import LoginForm from '@/components/auth/LoginForm';

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
      <LoginForm />
    </div>
  );
}
