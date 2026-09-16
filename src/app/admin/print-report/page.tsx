import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import PrintButton from "@/components/admin/PrintButton";

export default async function PrintReportPage({ searchParams }: { searchParams: Promise<{ programId?: string, type?: string, year?: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/admin/login");
  }

  const { programId, type, year } = await searchParams;

  const currentYear = String(new Date().getFullYear() + 543);
  const selectedYear = year || currentYear;

  const userRole = (session?.user as any)?.role;
  const userProgramId = (session?.user as any)?.programId;

  let whereCondition: any = { academicYear: selectedYear };
  let reportTitle = `รายงานรายชื่อผู้สมัครทั้งหมด ปีการศึกษา ${selectedYear}`;

  const targetProgramId = (userRole === 'STAFF' && userProgramId) ? userProgramId : programId;

  if (targetProgramId) {
    whereCondition.programId = targetProgramId;
    const prog = await prisma.program.findUnique({ where: { id: targetProgramId } });
    if (prog) {
      reportTitle = `รายงานรายชื่อผู้สมัคร - ${prog.name} (ปีการศึกษา ${selectedYear})`;
    }
  }

  const applicants = await prisma.applicant.findMany({
    where: whereCondition,
    include: { program: true, documents: true },
    orderBy: [
      { programId: 'asc' },
      { createdAt: 'asc' }
    ]
  });

  return (
    <div className="min-h-screen p-8 print:p-0" style={{ backgroundColor: '#ffffff', color: '#000000' }}>
      <div className="w-full max-w-5xl mx-auto print:max-w-none print:w-full">
        <div className="flex justify-between items-start mb-6 print:hidden">
          <div>
            <h1 className="text-2xl font-bold">พิมพ์รายงาน</h1>
            <p className="text-sm" style={{ color: '#6b7280' }}>สามารถกด Print หรือ Ctrl+P เพื่อบันทึกเป็น PDF</p>
          </div>
          <div className="flex gap-2">
            <Link 
              href={`/admin/applicants${programId ? `?programId=${programId}` : ''}`}
              className="px-4 py-2 border rounded font-medium"
            >
              ย้อนกลับ
            </Link>
            <PrintButton />
          </div>
        </div>

        {/* Report Content - This is what gets printed */}
        <div className="print-content" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
            <thead style={{ display: 'table-header-group', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
              <tr>
                <td colSpan={7} style={{ paddingBottom: '16px', border: 'none', backgroundColor: '#ffffff' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <img src="/logo.png" alt="SMKCC Logo" style={{ height: '48px', width: 'auto' }} />
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: '#000000' }}>
                      {reportTitle}
                    </h2>
                  </div>
                </td>
              </tr>
              <tr style={{ backgroundColor: '#1e3a8a', color: '#ffffff' }}>
                <th style={{ padding: '8px 12px', textAlign: 'center', whiteSpace: 'nowrap' }}>ลำดับที่</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', whiteSpace: 'nowrap' }}>รหัสการสมัคร</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', whiteSpace: 'nowrap' }}>ชื่อ-นามสกุล</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', whiteSpace: 'nowrap' }}>เบอร์ติดต่อ</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', whiteSpace: 'nowrap' }}>สาขาวิชา</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', whiteSpace: 'nowrap' }}>เอกสาร</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', whiteSpace: 'nowrap' }}>สถานะ</th>
              </tr>
            </thead>
            
            <tfoot style={{ display: 'table-footer-group' }}>
              <tr>
                <td colSpan={7} style={{ border: 'none', backgroundColor: '#ffffff' }}>
                  {(() => {
                    const today = new Date();
                    const d = today.getDate();
                    const m = today.getMonth() + 1;
                    const y = today.getFullYear() + 543;
                    return (
                      <div style={{ textAlign: 'right', marginTop: '16px', padding: '8px 0', fontSize: '12px', fontWeight: 'bold', color: '#000000' }}>
                        วันที่พิมพ์: {d}/{m}/{y}
                      </div>
                    );
                  })()}
                </td>
              </tr>
            </tfoot>

            <tbody>
              {applicants.map((app, index) => {
                let statusText = "";
                switch(app.status) {
                  case 'PENDING': statusText = "รอตรวจสอบ"; break;
                  case 'DOCUMENT_REQUESTED': statusText = "ขอเอกสารเพิ่ม"; break;
                  case 'APPROVED': statusText = "อนุมัติ ผ่าน"; break;
                  case 'PAID': statusText = "ชำระเงินแล้ว"; break;
                  case 'REJECTED': statusText = "ไม่อนุมัติ/ยกเลิก"; break;
                }

                const docs = Array.isArray(app.documents) ? app.documents : [];
                const hasTranscript = docs.some((d: any) => d.type === 'TRANSCRIPT');
                const hasIdCard = docs.some((d: any) => d.type === 'ID_CARD');
                const hasHouseReg = docs.some((d: any) => d.type === 'HOUSE_REGISTRATION');
                const hasPhoto = docs.some((d: any) => d.type === 'PHOTO');

                let missingDocs = [];
                if (!hasTranscript) missingDocs.push("ผลการเรียน");
                if (!hasIdCard) missingDocs.push("บัตร ปชช.");
                if (!hasHouseReg) missingDocs.push("ทะเบียนบ้าน");
                if (!hasPhoto) missingDocs.push("รูปถ่าย");

                return (
                  <tr key={app.id} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', backgroundColor: index % 2 === 0 ? '#ffffff' : '#f3f4f6' }}>
                    <td style={{ padding: '8px 12px', textAlign: 'center', whiteSpace: 'nowrap' }}>{index + 1}</td>
                    <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>{app.applicationId}</td>
                    <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>{app.prefix}{app.firstName} {app.lastName}</td>
                    <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>{app.phone}</td>
                    <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>{app.program?.name || "-"}</td>
                    <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>
                      {missingDocs.length === 0 ? "ครบถ้วน" : `ขาด: ${missingDocs.join(', ')}`}
                    </td>
                    <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>{statusText}</td>
                  </tr>
                );
              })}
              {applicants.length === 0 && (
                <tr style={{ backgroundColor: '#ffffff' }}>
                  <td colSpan={7} style={{ padding: '32px 12px', textAlign: 'center', color: '#6b7280' }}>
                    ไม่พบข้อมูลผู้สมัคร
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Print Specific CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page {
            size: A4 landscape;
            margin: 10mm;
          }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            background-color: white !important;
          }
        }
      `}} />
    </div>
  );
}

