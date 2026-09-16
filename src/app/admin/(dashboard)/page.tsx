import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import DashboardCharts from "@/components/admin/DashboardCharts";
import AIDashboardSummary from "@/components/admin/AIDashboardSummary";
import YearFilterDropdown from "@/components/admin/YearFilterDropdown";
import { Button } from "@/components/ui/button";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function AdminDashboardPage({ searchParams }: { searchParams: Promise<{ programId?: string, status?: string, year?: string }> }) {
  const { programId, status, year } = await searchParams;
  const session = await getServerSession(authOptions);
  
  // Default academic year
  const currentYear = String(new Date().getFullYear() + 543);
  const selectedYear = year || currentYear;

  // Base filter for applicants
  const whereCondition: any = { academicYear: selectedYear };
  
  // If user is STAFF and has a specific program assigned, force it
  const userRole = (session?.user as any)?.role;
  const userProgramId = (session?.user as any)?.programId;

  if (userRole === 'STAFF' && userProgramId) {
    whereCondition.programId = userProgramId;
  } else if (programId) {
    whereCondition.programId = programId;
  }

  if (status) whereCondition.status = status;

  // Fetch distinct academic years for the dropdown
  const distinctYearsData = await prisma.applicant.findMany({
    distinct: ['academicYear'],
    select: { academicYear: true },
    orderBy: { academicYear: 'desc' }
  });
  let availableYears = distinctYearsData.map(d => d.academicYear);
  if (!availableYears.includes(currentYear)) {
    availableYears = [currentYear, ...availableYears];
  }

  const totalApplicants = await prisma.applicant.count({ where: whereCondition });
  const pendingApplicants = await prisma.applicant.count({ where: { ...whereCondition, status: 'PENDING' } });
  const docRequestedApplicants = await prisma.applicant.count({ where: { ...whereCondition, status: 'DOCUMENT_REQUESTED' } });
  const approvedApplicants = await prisma.applicant.count({ where: { ...whereCondition, status: 'APPROVED' } });
  const paidApplicants = await prisma.applicant.count({ where: { ...whereCondition, status: 'PAID' } });
  const rejectedApplicants = await prisma.applicant.count({ where: { ...whereCondition, status: 'REJECTED' } });

  const programQueryWhere: any = { isOpen: true };
  if (userRole === 'STAFF' && userProgramId) {
    programQueryWhere.id = userProgramId;
  }

  const programs = await prisma.program.findMany({
    where: programQueryWhere,
    include: {
      _count: {
        select: { applicants: { where: { academicYear: selectedYear, ...(status ? { status: status as any } : {}) } } } 
      }
    }
  });

  // Prepare data for charts
  const statusData = [
    { name: 'รอตรวจสอบ', value: pendingApplicants, status: 'PENDING' },
    { name: 'ขอเอกสารเพิ่ม', value: docRequestedApplicants, status: 'DOCUMENT_REQUESTED' },
    { name: 'อนุมัติแล้ว', value: approvedApplicants, status: 'APPROVED' },
    { name: 'ชำระเงินแล้ว', value: paidApplicants, status: 'PAID' },
    { name: 'ไม่ผ่าน', value: rejectedApplicants, status: 'REJECTED' },
  ].filter(item => item.value > 0); // Only show statuses that have applicants

  const programData = programs.map(p => ({
    id: p.id,
    name: p.name,
    value: p._count.applicants
  }));

  // Fetch trend dates
  const applicantsForTrend = await prisma.applicant.findMany({
    where: whereCondition,
    select: { createdAt: true },
    orderBy: { createdAt: 'asc' }
  });
  const trendDates = applicantsForTrend.map(a => a.createdAt.toISOString());

  let selectedProgramName = "";
  if (programId) {
    const p = programs.find(p => p.id === programId);
    if (p) selectedProgramName = p.name;
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">สรุปภาพรวม (Dashboard)</h2>
          <p className="text-muted-foreground">ข้อมูลสถิติผู้สมัครเรียน {selectedProgramName ? `(เฉพาะ: ${selectedProgramName})` : ''}</p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 font-medium">ปีการศึกษา:</span>
            <YearFilterDropdown 
              availableYears={availableYears} 
              selectedYear={selectedYear} 
              programId={programId} 
              status={status} 
            />
          </div>
          {(programId || status) && (
            <Link href={`/admin?year=${selectedYear}`}>
              <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">ล้างตัวกรองสาขา/สถานะ ✕</Button>
            </Link>
          )}
        </div>
      </div>

      <AIDashboardSummary />

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-6">
        <Link href={`/admin${programId ? `?programId=${programId}` : ''}`}>
          <Card className={`hover:shadow-md transition-shadow cursor-pointer h-full border-b-4 border-blue-600 ${!status ? 'bg-blue-50' : ''}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ทั้งหมด</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{totalApplicants}</div>
            </CardContent>
          </Card>
        </Link>
        <Link href={`/admin?status=PENDING${programId ? `&programId=${programId}` : ''}`}>
          <Card className={`hover:shadow-md transition-shadow cursor-pointer h-full border-b-4 border-yellow-500 ${status === 'PENDING' ? 'bg-yellow-50' : ''}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">รอตรวจสอบ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{pendingApplicants}</div>
            </CardContent>
          </Card>
        </Link>
        <Link href={`/admin?status=DOCUMENT_REQUESTED${programId ? `&programId=${programId}` : ''}`}>
          <Card className={`hover:shadow-md transition-shadow cursor-pointer h-full border-b-4 border-orange-500 ${status === 'DOCUMENT_REQUESTED' ? 'bg-orange-50' : ''}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ขอเอกสารเพิ่ม</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{docRequestedApplicants}</div>
            </CardContent>
          </Card>
        </Link>
        <Link href={`/admin?status=APPROVED${programId ? `&programId=${programId}` : ''}`}>
          <Card className={`hover:shadow-md transition-shadow cursor-pointer h-full border-b-4 border-green-500 ${status === 'APPROVED' ? 'bg-green-50' : ''}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">อนุมัติ ผ่าน</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{approvedApplicants}</div>
            </CardContent>
          </Card>
        </Link>
        <Link href={`/admin?status=PAID${programId ? `&programId=${programId}` : ''}`}>
          <Card className={`hover:shadow-md transition-shadow cursor-pointer h-full border-b-4 border-blue-800 ${status === 'PAID' ? 'bg-blue-100' : ''}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ชำระเงินแล้ว</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-800">{paidApplicants}</div>
            </CardContent>
          </Card>
        </Link>
        <Link href={`/admin?status=REJECTED${programId ? `&programId=${programId}` : ''}`}>
          <Card className={`hover:shadow-md transition-shadow cursor-pointer h-full border-b-4 border-red-500 ${status === 'REJECTED' ? 'bg-red-50' : ''}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ไม่ผ่าน/ยกเลิก</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{rejectedApplicants}</div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Charts Section */}
      <DashboardCharts 
        statusData={statusData} 
        programData={programData} 
        currentProgramId={programId} 
        currentStatus={status} 
      />

    </div>
  );
}
