import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminListManager from "@/components/admin/AdminListManager";

export default async function AdminsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/admin/login");
  }

  // Double check if the current user is an ADMIN
  const currentUser = await prisma.adminUser.findUnique({
    where: { email: session.user.email }
  });

  if (!currentUser || currentUser.role !== 'ADMIN') {
    return (
      <div className="p-8 text-center bg-red-50 text-red-800 rounded-lg border border-red-200 mt-10 max-w-lg mx-auto">
        <h2 className="text-xl font-bold mb-2">Access Denied</h2>
        <p>คุณไม่มีสิทธิ์เข้าถึงหน้านี้ (เฉพาะสิทธิ์ระดับ ADMIN เท่านั้น)</p>
      </div>
    );
  }

  // Fetch all admins
  const admins = await prisma.adminUser.findMany({
    orderBy: { createdAt: 'desc' }
  });

  const programs = await prisma.program.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">จัดการผู้ดูแลระบบ</h1>
          <p className="text-gray-500 mt-1">เพิ่มหรือลบสิทธิ์การเข้าถึงระบบจัดการหลังบ้าน</p>
        </div>
      </div>

      <AdminListManager initialAdmins={admins} currentUserId={currentUser.id} programs={programs} />
    </div>
  );
}
