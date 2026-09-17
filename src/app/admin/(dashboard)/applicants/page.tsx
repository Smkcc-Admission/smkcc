import prisma from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import AddApplicantDialog from "@/components/admin/AddApplicantDialog";
import DownloadPdfButton from "@/components/admin/DownloadPdfButton";
import YearFilterDropdown from "@/components/admin/YearFilterDropdown";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function AdminApplicantsPage({ searchParams }: { searchParams: Promise<{ status?: string, q?: string, programId?: string, year?: string, term?: string }> }) {
  const { status, q, programId, year, term } = await searchParams;
  const session = await getServerSession(authOptions);

  const currentYear = String(new Date().getFullYear() + 543);
  const selectedYear = year || currentYear;

  const userRole = (session?.user as any)?.role;
  const userProgramId = (session?.user as any)?.programId;

  const whereCondition: any = { academicYear: selectedYear };
  
  if (term && term !== "all") {
    whereCondition.term = term;
  }
  
  if (userRole === 'STAFF' && userProgramId) {
    whereCondition.programId = userProgramId;
  } else if (programId) {
    whereCondition.programId = programId;
  }

  if (status) {
    whereCondition.status = status;
  }
  if (q) {
    whereCondition.OR = [
      { firstName: { contains: q, mode: 'insensitive' } },
      { lastName: { contains: q, mode: 'insensitive' } },
      { nationalId: { contains: q } },
      { applicationId: { contains: q } },
      { phone: { contains: q } }
    ];
  }

  const applicants = await prisma.applicant.findMany({
    where: whereCondition,
    include: { program: true, documents: true },
    orderBy: { createdAt: 'desc' }
  });

  const programQueryWhere: any = { isOpen: true };
  if (userRole === 'STAFF' && userProgramId) {
    programQueryWhere.id = userProgramId;
  }

  const programs = await prisma.program.findMany({
    where: programQueryWhere,
    orderBy: { name: 'asc' }
  });

  const distinctYearsData = await prisma.applicant.findMany({
    distinct: ['academicYear'],
    select: { academicYear: true },
    orderBy: { academicYear: 'desc' }
  });
  let availableYears = distinctYearsData.map(d => d.academicYear);
  if (!availableYears.includes(currentYear)) {
    availableYears = [currentYear, ...availableYears];
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-bold">รอตรวจสอบ</span>;
      case 'DOCUMENT_REQUESTED': return <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-bold">ขอเอกสารเพิ่มเติม</span>;
      case 'APPROVED': return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-bold">อนุมัติแล้ว</span>;
      case 'PAID': return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-bold">ชำระเงินแล้ว</span>;
      case 'REJECTED': return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-bold">ไม่ผ่านเงื่อนไข</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">รายชื่อผู้สมัครเรียน</h2>
          <p className="text-muted-foreground">จัดการข้อมูลผู้สมัคร ตรวจสอบเอกสาร</p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="flex items-center gap-2 mr-2">
            <span className="text-sm font-medium text-gray-500">ตัวกรอง:</span>
            <YearFilterDropdown 
              availableYears={availableYears} 
              selectedYear={selectedYear} 
              selectedTerm={term}
              programId={programId} 
              status={status} 
              q={q} 
            />
          </div>
          <DownloadPdfButton programId={programId} />
          <AddApplicantDialog programs={programs} />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center bg-white p-4 rounded-md border shadow-sm">
        <form className="flex flex-wrap gap-2 w-full lg:w-auto">
          <input type="hidden" name="year" value={selectedYear} />
          {term && term !== "all" && <input type="hidden" name="term" value={term} />}
          <input 
            type="text" 
            name="q" 
            defaultValue={q || ""}
            placeholder="ค้นหาชื่อ, เลขบัตร, รหัสสมัคร, เบอร์โทร..." 
            className="border rounded-md px-3 py-2 text-sm w-full md:w-64"
          />
          <select name="programId" defaultValue={programId || ""} className="border rounded-md px-3 py-2 text-sm bg-white max-w-[200px]">
            <option value="">ทุกสาขาวิชา</option>
            {programs.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <select name="status" defaultValue={status || ""} className="border rounded-md px-3 py-2 text-sm bg-white">
            <option value="">ทุกสถานะ</option>
            <option value="PENDING">รอตรวจสอบ</option>
            <option value="DOCUMENT_REQUESTED">ขอเอกสารเพิ่ม</option>
            <option value="APPROVED">อนุมัติแล้ว</option>
            <option value="PAID">ชำระเงินแล้ว</option>
            <option value="REJECTED">ไม่ผ่านเงื่อนไข</option>
          </select>
          <Button type="submit" variant="default" size="sm" className="h-9">🔍 ค้นหา</Button>
          {(q || status || programId) && (
            <Link href="/admin/applicants">
              <Button type="button" variant="ghost" size="sm" className="h-9">ล้าง</Button>
            </Link>
          )}
        </form>
        
        {/* Legend for missing documents */}
          <div className="flex items-center gap-3 text-xs bg-gray-50 px-3 py-2 rounded-md border">
            <span className="font-semibold mr-1">เอกสารที่ขาด:</span>
            <span className="flex items-center gap-1" title="สำเนาบัตรประชาชน"><span className="w-3 h-3 rounded-full bg-red-500"></span> บัตร ปชช.</span>
            <span className="flex items-center gap-1" title="สำเนาทะเบียนบ้าน"><span className="w-3 h-3 rounded-full bg-orange-400"></span> ทะเบียนบ้าน</span>
            <span className="flex items-center gap-1" title="ระเบียนแสดงผลการเรียน (Transcript)"><span className="w-3 h-3 rounded-full bg-yellow-400"></span> เกรด</span>
            <span className="flex items-center gap-1" title="รูปถ่าย"><span className="w-3 h-3 rounded-full bg-blue-500"></span> รูปถ่าย</span>
          </div>
      </div>

      <div className="bg-white rounded-md border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b text-gray-700">
              <tr>
                <th className="px-4 py-4 font-medium">เลขที่ผู้สมัคร</th>
                <th className="px-4 py-4 font-medium">ชื่อ-นามสกุล</th>
                <th className="px-4 py-4 font-medium">เบอร์โทรศัพท์</th>
                <th className="px-4 py-4 font-medium">สาขาวิชา</th>
                <th className="px-4 py-4 font-medium">เทอม</th>
                <th className="px-4 py-4 font-medium">สถานที่เรียน</th>
                <th className="px-4 py-4 font-medium">วันที่สมัคร</th>
                <th className="px-4 py-4 font-medium">สถานะ</th>
                <th className="px-4 py-4 font-medium text-center">เอกสารขาด</th>
                <th className="px-4 py-4 font-medium text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {applicants.map((app) => {
                const hasIdCard = app.documents.some(d => d.type === 'ID_CARD');
                const hasTranscript = app.documents.some(d => d.type === 'TRANSCRIPT');
                const hasHouseReg = app.documents.some(d => d.type === 'HOUSE_REGISTRATION');
                const hasPhoto = app.documents.some(d => d.type === 'PHOTO');
                
                return (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 font-medium text-blue-600">{app.applicationId}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span>{app.prefix}{app.firstName} {app.lastName}</span>
                        {app.remark?.includes("แอดมิน") && (
                          <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full border border-purple-200" title="เพิ่มโดยเจ้าหน้าที่">
                            Staff
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">{app.phone}</td>
                    <td className="px-4 py-4">{app.program?.name || "-"}</td>
                    <td className="px-4 py-4">{app.term}/{app.academicYear}</td>
                    <td className="px-4 py-4">{app.studyLocation || "-"}</td>
                    <td className="px-4 py-4">{app.createdAt.toLocaleDateString('th-TH')}</td>
                    <td className="px-4 py-4">{getStatusBadge(app.status)}</td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex justify-center gap-1">
                        {!hasIdCard && <span className="w-3 h-3 rounded-full bg-red-500 shadow-sm" title="ขาดสำเนาบัตรประชาชน"></span>}
                        {!hasHouseReg && <span className="w-3 h-3 rounded-full bg-orange-400 shadow-sm" title="ขาดสำเนาทะเบียนบ้าน"></span>}
                        {!hasTranscript && <span className="w-3 h-3 rounded-full bg-yellow-400 shadow-sm" title="ขาดระเบียนแสดงผลการเรียน"></span>}
                        {!hasPhoto && <span className="w-3 h-3 rounded-full bg-blue-500 shadow-sm" title="ขาดรูปถ่าย"></span>}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link href={`/admin/applicants/${app.id}`}>
                        <Button variant="outline" size="sm">📄 ตรวจเอกสาร</Button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
              
              {applicants.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    ไม่พบข้อมูลผู้สมัคร
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
