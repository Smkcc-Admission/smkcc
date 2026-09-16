"use client";
import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Phone, X } from "lucide-react";
import { FaLine, FaFacebook, FaTiktok } from "react-icons/fa6";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogClose } from "@/components/ui/dialog";
import Link from "next/link";
import "./programs-carousel.css";

export default function ProgramsCarousel({ programs, onApplyClick, isGlobalOpen = true }: { programs: any[], onApplyClick?: (programId: string) => void, isGlobalOpen?: boolean }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // If there are exactly 5 or fewer items, we duplicate them so the carousel has enough items
  // to transition cards into the "hidden" background state smoothly without zipping across the screen.
  const displayPrograms = programs.length > 0 && programs.length <= 5 
    ? [...programs, ...programs, ...programs].slice(0, 10) 
    : programs;

  const updateCarousel = (newIndex: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((newIndex + displayPrograms.length) % displayPrograms.length);
    setTimeout(() => {
      setIsAnimating(false);
    }, 800);
  };

  const handlePrev = () => updateCarousel(currentIndex - 1);
  const handleNext = () => updateCarousel(currentIndex + 1);

  // Auto-play effect
  useEffect(() => {
    if (isPaused || programs.length <= 1) return;
    const interval = setInterval(() => {
      handleNext();
    }, 2000); // 2 seconds
    return () => clearInterval(interval);
  }, [currentIndex, isPaused, programs.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, isAnimating]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.changedTouches[0].screenX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].screenX;
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) handleNext();
      else handlePrev();
    }
  };

  if (displayPrograms.length === 0) return <div>No programs available</div>;

  const currentProgram = displayPrograms[currentIndex];

  return (
    <div 
      className="carousel-page-wrapper"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="carousel-container" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <button className="nav-arrow left" onClick={handlePrev}>
          <ChevronLeft className="w-8 h-8" />
        </button>
        
        <div className="carousel-track">
          {displayPrograms.map((program, i) => {
            const offset = (i - currentIndex + displayPrograms.length) % displayPrograms.length;
            let positionClass = "hidden";
            
            if (offset === 0) positionClass = "center";
            else if (offset === 1) positionClass = "right-1";
            else if (offset === 2) positionClass = "right-2";
            else if (offset === displayPrograms.length - 1) positionClass = "left-1";
            else if (offset === displayPrograms.length - 2) positionClass = "left-2";

            // Fallback image if no poster
            const imageUrl = program.posterFileId 
              ? `/api/images/${program.posterFileId}`
              : `https://ui-avatars.com/api/?name=${encodeURIComponent(program.name)}&background=1e3a8a&color=fff&size=400`;

            const isCenter = offset === 0;

            const isClosed = !isGlobalOpen || !program.isOpen;

            const cardContent = (
              <>
                <img src={imageUrl} alt={program.name} className={isClosed ? 'opacity-50' : ''} />
                
                {isClosed && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <span className="bg-red-600/90 text-white font-bold px-6 py-2 rounded-full text-lg shadow-xl backdrop-blur-sm border-2 border-white/20 transform -rotate-12">
                      ปิดรับสมัคร
                    </span>
                  </div>
                )}

                <div className={`absolute inset-2 rounded-lg bg-black/10 opacity-0 hover:opacity-100 transition-opacity ${isCenter ? 'flex items-center justify-center' : ''}`}>
                  {isCenter && (
                    <span className="text-white text-sm font-medium bg-black/70 px-4 py-2 rounded-full backdrop-blur-sm shadow-lg pointer-events-none">
                      🔍 คลิกเพื่อขยายโปสเตอร์
                    </span>
                  )}
                </div>
              </>
            );

            return (
              <div 
                key={`${program.id}-${i}`} 
                className={`card ${positionClass}`}
                onClick={() => {
                  if (!isCenter) updateCarousel(i);
                }}
              >
                {isCenter ? (
                  <Dialog>
                    <DialogTrigger className="w-full h-full text-left relative focus:outline-none block cursor-pointer">
                      {cardContent}
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl p-1 bg-transparent border-none shadow-none h-[90vh] flex flex-col justify-center items-center">
                      <DialogTitle className="sr-only">รูปภาพโปรสเตอร์ {program.name}</DialogTitle>
                      <div className="relative w-full h-full">
                        <DialogClose className="absolute -top-4 -right-4 z-50 rounded-full bg-white/10 hover:bg-white/20 p-2 text-white border border-white/20 backdrop-blur-md transition-colors">
                          <X className="w-6 h-6" />
                        </DialogClose>
                        <img 
                          src={imageUrl} 
                          alt={`Poster for ${program.name}`}
                          className="w-full h-full object-contain rounded-xl"
                        />
                      </div>
                    </DialogContent>
                  </Dialog>
                ) : (
                  cardContent
                )}
              </div>
            );
          })}
        </div>
        
        <button className="nav-arrow right" onClick={handleNext}>
          <ChevronRight className="w-8 h-8" />
        </button>
      </div>

      <div className="member-info flex flex-col items-center">
        <h2 className="member-name transition-opacity duration-300 font-heading">
          {currentProgram.name}
        </h2>
        
        {currentProgram.contactName && (
          <p className="inline-flex items-center text-[#1e3a8a] bg-blue-50 px-4 py-1.5 rounded-full font-bold mt-2 border border-blue-100 shadow-sm text-sm">
            อาจารย์ประจำสาขา: {currentProgram.contactName}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-center gap-4 mt-4 transition-opacity duration-300">
          {currentProgram.contactPhone && (
            <div className="flex items-center text-sm text-gray-700 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100">
              <Phone className="w-4 h-4 mr-2 text-gray-400" />
              {currentProgram.contactPhone}
            </div>
          )}
          {currentProgram.lineOaUrl && (
            <a href={currentProgram.lineOaUrl} target="_blank" rel="noreferrer" className="flex items-center text-sm text-[#00B900] bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100 hover:bg-green-50 transition-colors">
              <FaLine className="w-4 h-4 mr-2" />
              Line สาขา
            </a>
          )}
          {currentProgram.facebookUrl && (
            <a href={currentProgram.facebookUrl} target="_blank" rel="noreferrer" className="flex items-center text-sm text-[#1877F2] bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100 hover:bg-blue-50 transition-colors">
              <FaFacebook className="w-4 h-4 mr-2" />
              Facebook
            </a>
          )}
          {currentProgram.tiktokUrl && (
            <a href={currentProgram.tiktokUrl} target="_blank" rel="noreferrer" className="flex items-center text-sm text-black bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors">
              <FaTiktok className="w-4 h-4 mr-2" />
              TikTok
            </a>
          )}
        </div>

        <div className="member-role transition-opacity duration-300">
          {(!isGlobalOpen || !currentProgram.isOpen) ? (
            <button 
              disabled
              className="inline-block mt-6 px-8 py-3 bg-gray-300 text-gray-500 rounded-full text-sm font-extrabold cursor-not-allowed shadow-none border border-transparent"
            >
              ปิดรับสมัคร
            </button>
          ) : onApplyClick ? (
            <button 
              onClick={() => onApplyClick(currentProgram.id)}
              className="inline-block mt-6 px-8 py-3 bg-white text-[#1e3a8a] rounded-full text-sm font-extrabold hover:bg-blue-50 transition-all shadow-[0_4px_15px_rgba(255,255,255,0.2)] hover:shadow-[0_6px_20px_rgba(255,255,255,0.3)] transform hover:-translate-y-1 border border-white/50"
            >
              สมัครเรียนสาขานี้
            </button>
          ) : (
            <Link href={`/?programId=${currentProgram.id}`} className="inline-block mt-6 px-8 py-3 bg-white text-[#1e3a8a] rounded-full text-sm font-extrabold hover:bg-blue-50 transition-all shadow-[0_4px_15px_rgba(255,255,255,0.2)] hover:shadow-[0_6px_20px_rgba(255,255,255,0.3)] transform hover:-translate-y-1 border border-white/50">
              สมัครเรียนสาขานี้
            </Link>
          )}
        </div>
      </div>

      <div className="dots">
        {programs.map((_, i) => (
          <div 
            key={i} 
            className={`dot ${i === (currentIndex % programs.length) ? "active" : ""}`}
            onClick={() => updateCarousel(i)}
          ></div>
        ))}
      </div>
    </div>
  );
}
