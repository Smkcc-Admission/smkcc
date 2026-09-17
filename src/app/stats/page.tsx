import prisma from "@/lib/prisma";
import { subDays, startOfDay, format } from "date-fns";
import StatCard from "@/components/admin/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import DashboardCharts from "@/components/admin/DashboardCharts";
import { Button } from "@/components/ui/button";
import StatsTermFilter from "@/components/admin/StatsTermFilter";

export const metadata = {
  title: "สถิติการรับสมัคร - วิทยาลัยชุมชนสมุทรสาคร",
  description: "ภาพรวมสถิติการรับสมัครนักศึกษาใหม่",
};

export const revalidate = 60; // Cache this page for 60 seconds (ISR) so the DB doesn't get hammered

export default async function PublicStatsPage({ searchParams }: { searchParams: Promise<{ programId?: string, status?: string, term?: string }> }) {
  const { programId, status, term } = await searchParams;

  // Base filter for applicants
  const whereCondition: any = {};
  if (programId) whereCondition.programId = programId;
  if (status) whereCondition.status = status;
  if (term && term !== "all") whereCondition.term = term;

  const totalApplicants = await prisma.applicant.count({ where: whereCondition });
  const pendingApplicants = await prisma.applicant.count({ where: { ...whereCondition, status: 'PENDING' } });
  const docRequestedApplicants = await prisma.applicant.count({ where: { ...whereCondition, status: 'DOCUMENT_REQUESTED' } });
  const approvedApplicants = await prisma.applicant.count({ where: { ...whereCondition, status: 'APPROVED' } });
  const paidApplicants = await prisma.applicant.count({ where: { ...whereCondition, status: 'PAID' } });
  const rejectedApplicants = await prisma.applicant.count({ where: { ...whereCondition, status: 'REJECTED' } });
  
  const onsiteApplicants = await prisma.applicant.count({ where: { ...whereCondition, remark: { contains: "เจ้าหน้าที่" } } });
  const onlineApplicants = totalApplicants - onsiteApplicants;

  // Get total applicants matching current status and term (ignoring programId filter)
  const totalAllProgramsWhere: any = {};
  if (status) totalAllProgramsWhere.status = status as any;
  if (term && term !== "all") totalAllProgramsWhere.term = term;

  const totalAllPrograms = await prisma.applicant.count({ 
    where: totalAllProgramsWhere 
  });

  const programs = await prisma.program.findMany({
    where: { isOpen: true },
    include: {
      _count: {
        select: { 
          applicants: { where: totalAllProgramsWhere }
        } 
      }
    }
  });

  // Calculate comparison data for all programs
  const applicantCountsByProgram = await prisma.applicant.groupBy({
    by: ['programId', 'status'],
    where: term && term !== "all" ? { term } : {},
    _count: { _all: true }
  });

  const programComparisonData = programs.map(p => {
    const countsForP = applicantCountsByProgram.filter(c => c.programId === p.id);
    const total = countsForP.reduce((sum, c) => sum + c._count._all, 0);
    const paid = countsForP.find(c => c.status === 'PAID')?._count._all || 0;
    return {
      id: p.id,
      name: p.name,
      total,
      paid
    };
  });

  // Prepare data for charts
  const statusData = [
    { name: 'รอตรวจสอบ', value: pendingApplicants, status: 'PENDING' },
    { name: 'ขอเอกสารเพิ่ม', value: docRequestedApplicants, status: 'DOCUMENT_REQUESTED' },
    { name: 'อนุมัติ ผ่าน', value: approvedApplicants, status: 'APPROVED' },
    { name: 'ชำระเงินแล้ว', value: paidApplicants, status: 'PAID' },
    { name: 'ไม่ผ่าน', value: rejectedApplicants, status: 'REJECTED' },
  ].filter(item => item.value > 0); 

  const programData = programs.map(p => ({
    id: p.id,
    name: p.name,
    value: p._count.applicants
  }));

  // Fetch trend dates for main chart
  const applicantsForTrend = await prisma.applicant.findMany({
    where: whereCondition,
    select: { createdAt: true },
    orderBy: { createdAt: 'asc' }
  });
  const trendDates = applicantsForTrend.map(a => a.createdAt.toISOString());

  // Fetch recent data for sparklines
  const sevenDaysAgo = startOfDay(subDays(new Date(), 7));
  const applicantsLast7Days = await prisma.applicant.findMany({
    where: {
      ...totalAllProgramsWhere,
      createdAt: { gte: sevenDaysAgo }
    },
    select: { createdAt: true, programId: true, status: true }
  });

  const buildSparkline = (filterFn: (a: any) => boolean) => {
    const filtered = applicantsLast7Days.filter(filterFn);
    const countsByDate = filtered.reduce((acc, a) => {
      const d = format(a.createdAt, 'yyyy-MM-dd');
      acc[d] = (acc[d] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = format(subDays(new Date(), i), 'yyyy-MM-dd');
      result.push({ date: d, count: countsByDate[d] || 0 });
    }
    const trendValue = result.reduce((sum, r) => sum + r.count, 0);
    return { sparklineData: result, trendValue };
  };

  const overallSparkline = buildSparkline(() => true);

  let selectedProgramName = "";
  if (programId) {
    const p = programs.find(p => p.id === programId);
    if (p) selectedProgramName = p.name;
  }

  return (
    <main className="min-h-screen flex flex-col relative font-sans">
      
      {/* Navbar - Fixed to top */}
      <header className="w-full py-4 px-6 md:px-12 flex items-center justify-between bg-white/95 backdrop-blur-md shadow-sm fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/" className="relative h-14 w-14 block">
            <img 
              src="/logo.png" 
              alt="SMKCC Logo" 
              className="object-contain w-full h-full"
              style={{ mixBlendMode: 'multiply' }}
            />
          </Link>
          <div className="border-l-2 border-gray-200 pl-4 py-1">
            <h1 className="font-bold text-lg md:text-xl text-[#1e3a8a] leading-tight">
              วิทยาลัยชุมชนสมุทรสาคร
            </h1>
            <p className="text-xs md:text-sm text-gray-500 font-medium">SamutSakhon Community College</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm font-medium text-gray-600 hover:text-[#1e3a8a] hidden sm:block transition-colors">
            หน้าหลัก
          </Link>
          <Link href="/admin/login" className="text-sm font-semibold text-white bg-[#1e3a8a] hover:bg-[#152c6b] px-5 py-2 rounded shadow-sm transition-all">
            สำหรับเจ้าหน้าที่
          </Link>
        </div>
      </header>

      {/* Global Fixed Background Image */}
      <div className="fixed inset-0 z-0 overflow-hidden bg-[#0f2052]">
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat animate-drone opacity-90"
          style={{ backgroundImage: "url('/campus-bg.png')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#1e3a8a]/60 via-[#1e3a8a]/40 to-[#0f2052]/70 backdrop-blur-[2px]"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 pt-28 pb-20 w-full flex-1 flex flex-col items-center">
        <div className="w-full px-4 sm:px-6 md:px-12 lg:px-16 xl:px-24">
          
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_30px_80px_rgba(0,0,0,0.4)] overflow-hidden border border-white/20 p-6 md:p-8 w-full space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[#1e3a8a]">สถิติผู้สมัครเรียน</h2>
                <p className="text-gray-600 font-medium mt-1">ข้อมูลจำนวนผู้สมัครแยกตามสถานะ และสาขาวิชาแบบเรียลไทม์ {selectedProgramName ? `(เฉพาะ: ${selectedProgramName})` : ''}</p>
              </div>
              <StatsTermFilter programId={programId} status={status} term={term} />
            </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 pb-4">
            <StatCard
              title="ภาพรวมทั้งหมด"
              value={totalAllPrograms}
              totalValue={totalAllPrograms}
              trendValue={overallSparkline.trendValue}
              sparklineData={overallSparkline.sparklineData}
              href={`/stats?${new URLSearchParams({ ...(status ? { status } : {}), ...(term && term !== 'all' ? { term } : {}) }).toString()}`}
              isActive={!programId}
              colorTheme="indigo"
            />
            
            {programs.map(p => {
              const spark = buildSparkline(a => a.programId === p.id);
              return (
                <StatCard
                  key={p.id}
                  title={p.name}
                  value={p._count.applicants}
                  totalValue={totalAllPrograms}
                  trendValue={spark.trendValue}
                  sparklineData={spark.sparklineData}
                  href={`/stats?${new URLSearchParams({ programId: p.id, ...(status ? { status } : {}), ...(term && term !== 'all' ? { term } : {}) }).toString()}`}
                  isActive={programId === p.id}
                  colorTheme="blue"
                />
              );
            })}
          </div>

          {/* Charts Section */}
          <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 border border-gray-200 mt-6">
             <DashboardCharts 
              statusData={statusData} 
              programData={programData} 
              programComparisonData={programComparisonData}
              trendDates={trendDates}
              currentProgramId={programId} 
              currentStatus={status} 
              basePath="/stats"
            />
          </div>

          {/* MOVED: Status Summary Cards */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-bold text-[#1e3a8a] mb-4 text-center md:text-left">สถานะการรับสมัคร</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 pb-4">
              <StatCard
                title="ทั้งหมด"
                value={totalApplicants}
                totalValue={totalApplicants}
                trendValue={buildSparkline(() => true).trendValue}
                sparklineData={buildSparkline(() => true).sparklineData}
                href={`/stats?${new URLSearchParams({ ...(programId ? { programId } : {}), ...(term && term !== 'all' ? { term } : {}) }).toString()}`}
                isActive={!status}
                colorTheme="indigo"
              />
              <StatCard
                title="รอตรวจสอบ"
                value={pendingApplicants}
                totalValue={totalApplicants}
                trendValue={buildSparkline(a => a.status === 'PENDING').trendValue}
                sparklineData={buildSparkline(a => a.status === 'PENDING').sparklineData}
                href={`/stats?${new URLSearchParams({ status: 'PENDING', ...(programId ? { programId } : {}), ...(term && term !== 'all' ? { term } : {}) }).toString()}`}
                isActive={status === 'PENDING'}
                colorTheme="yellow"
              />
              <StatCard
                title="ขอเอกสารเพิ่ม"
                value={docRequestedApplicants}
                totalValue={totalApplicants}
                trendValue={buildSparkline(a => a.status === 'DOCUMENT_REQUESTED').trendValue}
                sparklineData={buildSparkline(a => a.status === 'DOCUMENT_REQUESTED').sparklineData}
                href={`/stats?${new URLSearchParams({ status: 'DOCUMENT_REQUESTED', ...(programId ? { programId } : {}), ...(term && term !== 'all' ? { term } : {}) }).toString()}`}
                isActive={status === 'DOCUMENT_REQUESTED'}
                colorTheme="orange"
              />
              <StatCard
                title="ผ่าน/รอจ่ายเงิน"
                value={approvedApplicants}
                totalValue={totalApplicants}
                trendValue={buildSparkline(a => a.status === 'APPROVED').trendValue}
                sparklineData={buildSparkline(a => a.status === 'APPROVED').sparklineData}
                href={`/stats?${new URLSearchParams({ status: 'APPROVED', ...(programId ? { programId } : {}), ...(term && term !== 'all' ? { term } : {}) }).toString()}`}
                isActive={status === 'APPROVED'}
                colorTheme="green"
              />
              <StatCard
                title="ชำระเงินแล้ว"
                value={paidApplicants}
                totalValue={totalApplicants}
                trendValue={buildSparkline(a => a.status === 'PAID').trendValue}
                sparklineData={buildSparkline(a => a.status === 'PAID').sparklineData}
                href={`/stats?${new URLSearchParams({ status: 'PAID', ...(programId ? { programId } : {}), ...(term && term !== 'all' ? { term } : {}) }).toString()}`}
                isActive={status === 'PAID'}
                colorTheme="blue"
                moneyEstimate={paidApplicants * 1500}
              />
              <StatCard
                title="ไม่อนุมัติ"
                value={rejectedApplicants}
                totalValue={totalApplicants}
                trendValue={buildSparkline(a => a.status === 'REJECTED').trendValue}
                sparklineData={buildSparkline(a => a.status === 'REJECTED').sparklineData}
                href={`/stats?${new URLSearchParams({ status: 'REJECTED', ...(programId ? { programId } : {}), ...(term && term !== 'all' ? { term } : {}) }).toString()}`}
                isActive={status === 'REJECTED'}
                colorTheme="red"
              />
            </div>
          </div>

          {/* NEW: Application Source Cards */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-bold text-[#1e3a8a] mb-4 text-center md:text-left">ช่องทางการรับสมัคร</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-4">
              <StatCard
                title="สมัครด้วยตนเอง (ออนไลน์)"
                value={onlineApplicants}
                totalValue={totalApplicants}
                trendValue={buildSparkline(a => !a.remark?.includes("เจ้าหน้าที่")).trendValue}
                sparklineData={buildSparkline(a => !a.remark?.includes("เจ้าหน้าที่")).sparklineData}
                colorTheme="blue"
              />
              <StatCard
                title="เจ้าหน้าที่เพิ่มให้ (ออนไซต์)"
                value={onsiteApplicants}
                totalValue={totalApplicants}
                trendValue={buildSparkline(a => !!a.remark?.includes("เจ้าหน้าที่")).trendValue}
                sparklineData={buildSparkline(a => !!a.remark?.includes("เจ้าหน้าที่")).sparklineData}
                colorTheme="orange"
              />
            </div>
          </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="w-full py-6 text-center text-xs text-gray-500 bg-white/95 backdrop-blur-sm border-t border-gray-200 mt-auto relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-center items-center gap-1 md:gap-3">
          <p>&copy; {new Date().getFullYear()} SamutSakhon Community College. All rights reserved.</p>
          <span className="hidden md:inline text-gray-300">|</span>
          <p>ออกแบบและพัฒนาโดย <span className="font-semibold text-[#1e3a8a]">งานเทคโนโลยีสารสนเทศ วิทยาลัยชุมชนสมุทรสาคร</span></p>
        </div>
      </footer>
    </main>
  );
}
