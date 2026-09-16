import prisma from "@/lib/prisma";
import EditProgramDialog from "@/components/admin/EditProgramDialog";
import AddProgramDialog from "@/components/admin/AddProgramDialog";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminProgramsPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/admin");
  }

  const userRole = (session.user as any)?.role;
  const userProgramId = (session.user as any)?.programId;

  // STAFF can only see their own program
  const whereCondition = (userRole === 'STAFF' && userProgramId) 
    ? { id: userProgramId } 
    : {};

  const programs = await prisma.program.findMany({
    where: whereCondition,
    orderBy: { code: 'asc' }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">จัดการสาขาวิชา</h2>
          <p className="text-muted-foreground">แก้ไขข้อมูล ติดต่อ และสถานะการรับสมัคร</p>
        </div>
        {userRole === 'ADMIN' && <AddProgramDialog />}
      </div>

      <div className="bg-white rounded-md border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b text-gray-700 uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">ชื่อสาขาวิชา</th>
                <th className="px-6 py-4 font-medium">Social Links</th>
                <th className="px-6 py-4 font-medium">เบอร์ติดต่อ</th>
                <th className="px-6 py-4 font-medium text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {programs.map((program) => (
                <tr key={program.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{program.name}</td>
                  <td className="px-6 py-4 space-y-1">
                    {program.lineOaUrl ? (
                      <a href={program.lineOaUrl} target="_blank" rel="noreferrer" className="text-[#00B900] hover:underline flex items-center gap-1 text-sm font-medium">
                        💬 Line OA
                      </a>
                    ) : (
                      <div className="text-gray-300 text-sm">- Line -</div>
                    )}
                    {program.facebookUrl ? (
                      <a href={program.facebookUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 text-sm font-medium mt-1">
                        📘 Facebook
                      </a>
                    ) : (
                      <div className="text-gray-300 text-sm">- FB -</div>
                    )}
                    {program.tiktokUrl ? (
                      <a href={program.tiktokUrl} target="_blank" rel="noreferrer" className="text-black hover:underline flex items-center gap-1 text-sm font-medium mt-1">
                        🎵 Tiktok
                      </a>
                    ) : (
                      <div className="text-gray-300 text-sm">- Tiktok -</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span>{program.contactPhone || "-"}</span>
                      {program.contactName && <span className="text-xs text-gray-500">{program.contactName}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <EditProgramDialog program={program} />
                  </td>
                </tr>
              ))}
              
              {programs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    ไม่พบข้อมูลสาขาวิชา
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
