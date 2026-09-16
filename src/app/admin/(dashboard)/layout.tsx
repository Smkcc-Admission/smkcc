import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/admin/login");
  }

  const userRole = (session.user as any).role || 'STAFF';

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r hidden md:flex flex-col">
        <div className="h-20 flex items-center justify-center px-6 border-b">
          <img src="/logo.png" alt="SMKCC Logo" className="h-12 w-auto object-contain" />
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link href="/admin">
            <Button variant="ghost" className="w-full justify-start font-medium text-gray-700 hover:text-blue-700 hover:bg-blue-50">
              หน้าหลัก (Dashboard)
            </Button>
          </Link>
          <Link href="/admin/applicants">
            <Button variant="ghost" className="w-full justify-start font-medium text-gray-700 hover:text-blue-700 hover:bg-blue-50">
              จัดการข้อมูลผู้สมัคร
            </Button>
          </Link>
          <Link href="/admin/programs">
            <Button variant="ghost" className="w-full justify-start font-medium text-gray-700 hover:text-blue-700 hover:bg-blue-50">
              จัดการสาขาวิชา
            </Button>
          </Link>
          <Link href="/admin/chatbot">
            <Button variant="ghost" className="w-full justify-start font-medium text-gray-700 hover:text-blue-700 hover:bg-blue-50">
              ฝึกฝน AI Chatbot
            </Button>
          </Link>
          {userRole === 'ADMIN' && (
            <>
              <Link href="/admin/admins">
                <Button variant="ghost" className="w-full justify-start font-medium text-gray-700 hover:text-blue-700 hover:bg-blue-50">
                  จัดการเจ้าหน้าที่
                </Button>
              </Link>
              <Link href="/admin/settings">
                <Button variant="ghost" className="w-full justify-start font-medium text-gray-700 hover:text-blue-700 hover:bg-blue-50">
                  ตั้งค่าระบบ (Settings)
                </Button>
              </Link>
            </>
          )}
        </nav>
        <div className="p-4 border-t">
          <p className="text-sm text-gray-500 mb-2 truncate">{session.user?.email}</p>
          <Link href="/api/auth/signout">
            <Button variant="destructive" className="w-full">ออกจากระบบ</Button>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="h-16 bg-white border-b md:hidden flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="SMKCC Logo" className="h-8 w-auto" />
            <div className="font-bold text-blue-900">Admin</div>
          </div>
          <Link href="/api/auth/signout">
            <Button variant="outline" size="sm">ออก</Button>
          </Link>
        </header>
        <main className="flex-1 p-6 md:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
