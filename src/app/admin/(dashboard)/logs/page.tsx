import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { format } from "date-fns";
import { th } from "date-fns/locale";

export const revalidate = 0;

export default async function AuditLogsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    redirect("/admin");
  }

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100, // Show last 100 logs
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">ประวัติการทำงาน (Audit Logs)</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-700">วันเวลา</th>
                <th className="px-4 py-3 font-medium text-gray-700">เจ้าหน้าที่</th>
                <th className="px-4 py-3 font-medium text-gray-700">การกระทำ</th>
                <th className="px-4 py-3 font-medium text-gray-700">เป้าหมาย</th>
                <th className="px-4 py-3 font-medium text-gray-700">รายละเอียด</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                      {log.createdAt.toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}
                    </td>
                    <td className="px-4 py-3 text-gray-900">{log.adminEmail}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        log.action === 'LOGIN' ? 'bg-blue-100 text-blue-800' :
                        log.action === 'LOGOUT' ? 'bg-gray-100 text-gray-800' :
                        log.action === 'UPDATE_STATUS' ? 'bg-amber-100 text-amber-800' :
                        log.action === 'CREATE_APPLICANT' ? 'bg-green-100 text-green-800' :
                        log.action === 'DELETE_APPLICANT' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-900">{log.targetName || log.targetId || '-'}</td>
                    <td className="px-4 py-3 text-gray-500">{log.details || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    ไม่มีข้อมูลประวัติการทำงาน
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

