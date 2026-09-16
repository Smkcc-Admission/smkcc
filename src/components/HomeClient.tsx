"use client";
import React, { useState, useRef } from "react";
import Link from "next/link";
import { Suspense } from "react";
import LeadCaptureForm from "@/components/LeadCaptureForm";
import ProgramsCarousel from "@/components/ProgramsCarousel";

export default function HomeClient({ 
  programs, 
  isGlobalOpen,
  currentTerm,
  currentAcademicYear
}: { 
  programs: any[], 
  isGlobalOpen: boolean,
  currentTerm?: string,
  currentAcademicYear?: string
}) {
  const [showForm, setShowForm] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const formRef = useRef<HTMLElement>(null);

  const handleApplyClick = (programId: string) => {
    if (!isGlobalOpen) return;
    
    setSelectedProgramId(programId);
    setShowForm(true);
    
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const termText = currentTerm && currentTerm !== "all" 
    ? (currentTerm === "3" ? "ฤดูร้อน" : currentTerm)
    : "";
  const subtitleAddon = currentAcademicYear && termText 
    ? ` ภาคเรียนที่ ${termText}/${currentAcademicYear}` 
    : "";

  return (
    <div className="relative z-10 pt-24 w-full flex flex-col items-center">
      
      {/* Section 1: Catalog Carousel */}
      <section id="programs" className="flex flex-col items-center justify-center min-h-screen py-10 w-full">
        <div className="w-full flex flex-col items-center">
          <div className="text-center mb-0 md:mt-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-md tracking-wide">
              วิทยาลัยชุมชนสมุทรสาคร
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto drop-shadow mt-4 px-4 font-medium">
              เปิดรับสมัครนักศึกษา ระดับอนุปริญญา{subtitleAddon}
            </p>
            <p className="text-base text-blue-100/80 max-w-2xl mx-auto drop-shadow mt-2 px-4">
              เลือกหลักสูตรที่ใช่สำหรับคุณ เตรียมพร้อมสำหรับอนาคต เพื่อเพิ่มโอกาสในสายอาชีพ
            </p>
          </div>

          <div className="w-full -mt-4">
            <ProgramsCarousel 
              programs={programs} 
              onApplyClick={handleApplyClick} 
              isGlobalOpen={isGlobalOpen}
            />
          </div>
        </div>
      </section>

      {/* Section 2: Registration Form (Initially Hidden) */}
      <div 
        className={`w-full transition-all duration-1000 ease-in-out ${(!isGlobalOpen || showForm) ? 'opacity-100 max-h-[2000px] mb-20' : 'opacity-0 max-h-0 overflow-hidden mb-0'}`}
      >
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-10"></div>
        
        <section ref={formRef} className="flex flex-col items-center justify-center py-10 px-4 w-full">
          <div className="w-full max-w-3xl">
            {!isGlobalOpen ? (
              <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-gray-100 p-12 text-center">
                <h2 className="text-3xl font-bold text-red-600 mb-4">ปิดรับสมัครนักศึกษาแล้ว</h2>
                <p className="text-gray-600 text-lg">
                  ระบบปิดรับสมัครนักศึกษาประจำปีการศึกษานี้แล้ว 
                  กรุณาติดตามข่าวสารการเปิดรับสมัครรอบถัดไปทาง Facebook Page ของวิทยาลัย หรือสอบถามข้อมูลเพิ่มเติมผ่านแชท
                </p>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg tracking-wide">
                    เปิดรับสมัครนักศึกษาใหม่
                  </h1>
                  <p className="text-lg text-blue-50 max-w-2xl mx-auto drop-shadow-md font-medium">
                    กรอกข้อมูลด้านล่างเพื่อดำเนินการสมัครเรียน
                  </p>
                </div>

                <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_30px_80px_rgba(0,0,0,0.4)] overflow-hidden border border-white/20 transform transition-transform hover:scale-[1.01] duration-500">
                  <div className="bg-[#1e3a8a]/90 backdrop-blur-md px-6 py-5 md:px-8 md:py-6 text-center border-b border-[#152c6b]/50 relative">
                    <button 
                      onClick={() => {
                        setShowForm(false);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white text-sm flex items-center"
                    >
                      ← ยกเลิก
                    </button>
                    <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide drop-shadow-sm">กรอกข้อมูลการรับสมัคร</h2>
                    <p className="text-blue-100 text-sm mt-1 opacity-90">SamutSakhon Community College</p>
                  </div>
                  <div className="p-4 sm:p-6 md:p-10 bg-white">
                    <Suspense fallback={<div className="text-center py-10"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div></div>}>
                      <LeadCaptureForm programs={programs.filter(p => p.isOpen)} initialProgramId={selectedProgramId} />
                    </Suspense>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </div>

    </div>
  );
}
