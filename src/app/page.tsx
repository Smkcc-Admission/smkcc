import prisma from "@/lib/prisma";
import Link from "next/link";
import ChatWidget from "@/components/ChatWidget";
import HomeClient from "@/components/HomeClient";

export const revalidate = 60;

export default async function HomePage() {
  const programs = await prisma.program.findMany({
    orderBy: { code: "asc" }
  });

  const settings = await prisma.systemSettings.findUnique({
    where: { id: "1" }
  });
  const isGlobalOpen = settings ? settings.isGlobalAdmissionOpen : true;
  const currentTerm = settings?.currentTerm || "1";
  const currentAcademicYear = settings?.currentAcademicYear || String(new Date().getFullYear() + 543);

  return (
    <main className="min-h-screen flex flex-col relative font-sans">
      
      {/* Navbar - Fixed to top */}
      <header className="w-full py-4 px-6 md:px-12 flex items-center justify-between bg-white/95 backdrop-blur-md shadow-sm fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center gap-4">
          <div className="relative h-14 w-14">
            <img 
              src="/logo.png" 
              alt="SMKCC Logo" 
              className="object-contain w-full h-full"
              style={{ mixBlendMode: 'multiply' }}
            />
          </div>
          <div className="border-l-2 border-gray-200 pl-4 py-1">
            <h1 className="font-bold text-lg md:text-xl text-[#1e3a8a] leading-tight">
              วิทยาลัยชุมชนสมุทรสาคร
            </h1>
            <p className="text-xs md:text-sm text-gray-500 font-medium">SamutSakhon Community College</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Link href="/stats" className="text-sm font-medium text-gray-600 hover:text-[#1e3a8a] hidden sm:block transition-colors">
            สถิติผู้สมัคร
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
        {/* Softer dark blue gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1e3a8a]/60 via-[#1e3a8a]/40 to-[#0f2052]/70 backdrop-blur-[2px]"></div>
      </div>
      
      {/* Scrollable Interactive Client Component */}
      <HomeClient 
        programs={programs} 
        isGlobalOpen={isGlobalOpen} 
        currentTerm={currentTerm}
        currentAcademicYear={currentAcademicYear}
      />

      {/* Footer */}
      <footer className="w-full py-6 text-center text-xs text-gray-500 bg-white/95 backdrop-blur-sm border-t border-gray-200 mt-auto relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-center items-center gap-1 md:gap-3">
          <p>&copy; {new Date().getFullYear()} SamutSakhon Community College. All rights reserved.</p>
          <span className="hidden md:inline text-gray-300">|</span>
          <p>ออกแบบและพัฒนาโดย <span className="font-semibold text-[#1e3a8a]">งานเทคโนโลยีสารสนเทศ วิทยาลัยชุมชนสมุทรสาคร</span></p>
        </div>
      </footer>

      <ChatWidget />
    </main>
  );
}
