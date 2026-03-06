import { redirect } from 'next/navigation';
import { getCurrentUser } from '../../src/lib/auth';

export default async function AdminPage() {
  const user = await getCurrentUser();
  
  if (user.role !== 'admin') {
    redirect('/priority-list');
  }

  return (
    <div>
      <h1 className="font-syne text-2xl text-[#f7f5ee] mb-2">Admin</h1>
      <p className="text-[#8a9bc4] text-sm">Admin — coming in Phase 2C</p>
      <div className="mt-8 p-12 bg-[#0a1a4a] border border-[#1a2d6b] rounded-xl text-center text-[#8a9bc4] text-sm">
        Data and UI will be built here in Phase 2C
      </div>
    </div>
  );
}