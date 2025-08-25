import { getUserRole } from '@/lib/authUtils';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  const userRole = await getUserRole();
  if (userRole === 'SUPERADMIN') {
    redirect('/dashboard/overview');
  } else if (userRole === 'OWNER') {
    redirect('/dashboard/locations');
  }
}
