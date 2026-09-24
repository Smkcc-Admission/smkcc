"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { submitLeadCapture } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, MessageCircle, Users, BookOpen } from "lucide-react";
import { FaLine, FaFacebook, FaTiktok } from "react-icons/fa6";
import { QRCodeSVG } from "qrcode.react";

export default function LeadCaptureForm({ programs, initialProgramId }: { programs: any[], initialProgramId?: string | null }) {
  const searchParams = useSearchParams();
  
  const [loading, setLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [dbId, setDbId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedProgramId, setSelectedProgramId] = useState<string>("");

  useEffect(() => {
    // If passed via prop, use it directly (from the unified page interaction)
    if (initialProgramId && programs.some(p => p.id === initialProgramId)) {
      setSelectedProgramId(initialProgramId);
      return;
    }
    
    // Otherwise check URL params
    const pid = searchParams.get("programId");
    if (pid && programs.some(p => p.id === pid)) {
      setSelectedProgramId(pid);
    }
  }, [searchParams, programs, initialProgramId]);

  const selectedProgram = programs.find(p => p.id === selectedProgramId);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setIsAnimating(true);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      nationalId: formData.get("nationalId") as string,
      prefix: formData.get("prefix") as string,
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      programId: formData.get("programId") as string,
      studyLocation: formData.get("studyLocation") as string,
      pdpaConsent: formData.get("pdpaConsent") === "on",
    };

    const res = await submitLeadCapture(data);
    
    setTimeout(() => {
      setIsAnimating(false);
      if (res.success) {
        setSuccessId(res.applicationId || null);
          setDbId(res.id || null);
      } else {
        setError(res.error || "Something went wrong.");
      }
      setLoading(false);
    }, 1500);
  };

  if (successId) {
    return (
      <div className="w-full max-w-lg mx-auto py-8 text-center">
        <h2 className="text-2xl font-bold text-[#1e3a8a] mb-2">จองสิทธิ์รับสมัครสำเร็จ!</h2>
        <p className="text-gray-500 mb-8">คุณสามารถนำรหัสนี้ไปใช้ในการเข้าสู่ระบบเพื่อแนบเอกสารภายหลังได้</p>
        
        <div className="bg-blue-50 text-blue-900 px-8 py-6 rounded-xl text-4xl font-bold tracking-widest border border-blue-200 inline-block mb-4">
          {successId}
        </div>
        
        {/* Dynamic Contact Box in Success Page */}
        {selectedProgram && selectedProgram.lineOaUrl && (
          <div className="w-full bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-xl p-6 mt-4 mb-8 relative overflow-hidden flex flex-col md:flex-row items-center gap-6 text-left shadow-sm">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-200 rounded-full blur-3xl opacity-20 transform translate-x-10 -translate-y-10"></div>
            
            {/* QR Code Section (For Desktop Users) */}
            <div className="bg-white p-3 rounded-xl shadow-sm border border-green-100 shrink-0 relative z-10">
              <div className="w-24 h-24 bg-white flex items-center justify-center border border-gray-100 rounded">
                <QRCodeSVG value={selectedProgram.lineOaUrl} size={96} />
              </div>
            </div>

            <div className="flex-1 text-center md:text-left relative z-10">
              <h4 className="font-bold text-gray-900 mb-3 leading-snug text-xl">
                <span className="block text-green-700 mb-1 text-sm font-bold uppercase tracking-wider">ยินดีต้อนรับสู่</span>
                <span className="block">{selectedProgram.name} 🎉</span>
              </h4>
              <p className="text-sm text-gray-600 mt-2 mb-4 leading-relaxed">
                เพื่อไม่ให้พลาดข่าวสารการสอบสัมภาษณ์ กรุณาเพิ่มเพื่อน Line OA ของสาขาวิชา (สแกน QR Code หรือกดปุ่มด้านล่าง)
              </p>
              <a href={selectedProgram.lineOaUrl} target="_blank" rel="noreferrer">
                <Button className="bg-[#00B900] hover:bg-[#009900] text-white w-full sm:w-auto px-6 py-2 rounded-full shadow-md shadow-green-200">
                  <FaLine className="w-5 h-5 mr-2" />
                  เพิ่มเพื่อน Line สาขาวิชา
                </Button>
              </a>
            </div>
          </div>
        )}

        <p className="text-sm text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
          คุณสามารถเข้าสู่ระบบผ่านปุ่ม "เข้าสู่ระบบเพื่อแนบเอกสาร" (สำหรับผู้สมัคร) <br/> 
          เพื่ออัปโหลดสำเนาบัตรประชาชน รูปถ่าย และวุฒิการศึกษา
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
            {dbId && (
              <Link href={`/applicant/`}>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto px-8 py-2 rounded-full shadow-md">
                  อัปโหลดเอกสารทันที
                </Button>
              </Link>
            )}
            <Button variant="outline" className="border-[#1e3a8a] text-[#1e3a8a] hover:bg-blue-50 w-full sm:w-auto rounded-full px-8 py-2" onClick={() => window.location.reload()}>
              กลับหน้าแรก
            </Button>
          </div>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-none border-0 relative">
      <AnimatePresence>
        {isAnimating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-sm pointer-events-none"
          >
            {/* The Building */}
            <motion.img 
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              src="/building.png"
              alt="College Building"
              className="w-64 h-64 md:w-80 md:h-80 object-contain drop-shadow-2xl z-10"
            />
            
            {/* The Envelope Flying into the building */}
            <motion.img
              initial={{ opacity: 0, scale: 0.5, x: -300, y: 200, rotate: -20 }}
              animate={{ 
                opacity: [0, 1, 1, 0],
                scale: [0.5, 1.2, 0.5, 0],
                x: [-300, -100, 0, 0],
                y: [200, -50, -20, 20],
                rotate: [-20, 10, 0, 0]
              }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              src="/envelope.png"
              alt="Envelope"
              className="absolute w-32 h-32 md:w-40 md:h-40 drop-shadow-xl z-20"
            />
          </motion.div>
        )}
      </AnimatePresence>
      <form onSubmit={handleSubmit} className={isAnimating ? "opacity-50 pointer-events-none transition-opacity duration-300" : "transition-opacity duration-300"}>
        <CardContent className="grid gap-6 p-0 md:p-2">
          {error && <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nationalId">เลขบัตรประจำตัวประชาชน <span className="text-red-500">*</span></Label>
              <Input id="nationalId" name="nationalId" placeholder="1234567890123" required pattern="\d{13}" maxLength={13} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">เบอร์โทรศัพท์ <span className="text-red-500">*</span></Label>
              <Input id="phone" name="phone" placeholder="0891234567" required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prefix">คำนำหน้า <span className="text-red-500">*</span></Label>
              <select id="prefix" name="prefix" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" required>
                <option value="">เลือก</option>
                <option value="นาย">นาย</option>
                <option value="นาง">นาง</option>
                <option value="นางสาว">นางสาว</option>
              </select>
            </div>
            <div className="space-y-2 md:col-span-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">ชื่อ <span className="text-red-500">*</span></Label>
                  <Input id="firstName" name="firstName" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">นามสกุล <span className="text-red-500">*</span></Label>
                  <Input id="lastName" name="lastName" required />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">อีเมล (ถ้ามี)</Label>
            <Input id="email" name="email" type="email" placeholder="example@mail.com" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="programId">สาขาวิชาที่สนใจ <span className="text-red-500">*</span></Label>
            <select 
              id="programId" 
              name="programId" 
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" 
              required
              value={selectedProgramId}
              onChange={(e) => setSelectedProgramId(e.target.value)}
            >
              <option value="">-- เลือกสาขาวิชา --</option>
              {programs.length > 0 ? (
                programs.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))
              ) : (
                <option value="temp-id" disabled>กำลังปรับปรุงข้อมูล</option>
              )}
            </select>
          </div>

          {selectedProgram && selectedProgram.locations && selectedProgram.locations.length > 0 && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <Label htmlFor="studyLocation">สถานที่จัดการเรียนการสอน <span className="text-red-500">*</span></Label>
              <select 
                id="studyLocation" 
                name="studyLocation" 
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" 
                required
              >
                <option value="">-- เลือกสถานที่เรียน --</option>
                {selectedProgram.locations.map((loc: string) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          )}

          {/* Dynamic Contact Box */}
          {selectedProgram && (selectedProgram.contactPhone || selectedProgram.lineOaUrl || selectedProgram.facebookUrl || selectedProgram.tiktokUrl) && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mt-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-full text-blue-600 mt-0.5">
                  <FaLine className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900 text-sm">มีข้อสงสัยเกี่ยวกับ {selectedProgram.name} ?</h4>
                  <p className="text-sm text-blue-700 mt-1">สามารถติดต่อสอบถามอาจารย์ประจำสาขาได้โดยตรงครับ</p>
                  <div className="flex flex-wrap gap-4 mt-3">
                    {selectedProgram.contactPhone && (
                      <div className="flex items-center text-sm text-gray-700 font-medium">
                        <Phone className="w-4 h-4 mr-1.5 text-green-600" />
                        {selectedProgram.contactPhone} {selectedProgram.contactName && `(${selectedProgram.contactName})`}
                      </div>
                    )}
                    {selectedProgram.lineOaUrl && (
                      <a href={selectedProgram.lineOaUrl} target="_blank" rel="noreferrer" className="flex items-center text-sm text-gray-700 font-medium text-[#00B900] hover:underline">
                        <FaLine className="w-4 h-4 mr-1.5" />
                        คุยผ่าน Line OA
                      </a>
                    )}
                    {selectedProgram.facebookUrl && (
                      <a href={selectedProgram.facebookUrl} target="_blank" rel="noreferrer" className="flex items-center text-sm text-gray-700 font-medium text-[#1877F2] hover:underline">
                        <FaFacebook className="w-4 h-4 mr-1.5" />
                        Facebook Page
                      </a>
                    )}
                    {selectedProgram.tiktokUrl && (
                      <a href={selectedProgram.tiktokUrl} target="_blank" rel="noreferrer" className="flex items-center text-sm text-gray-700 font-medium text-black hover:underline">
                        <FaTiktok className="w-4 h-4 mr-1.5" />
                        Tiktok
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-start space-x-2 mt-4 p-4 bg-gray-50 rounded-lg border">
            <Checkbox id="pdpaConsent" name="pdpaConsent" required className="mt-1" />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="pdpaConsent" className="font-medium text-sm leading-relaxed">
                ข้าพเจ้ายินยอมให้วิทยาลัยชุมชนสมุทรสาคร เก็บรวบรวม ใช้ และเปิดเผยข้อมูลส่วนบุคคลของข้าพเจ้า เพื่อวัตถุประสงค์ในการรับสมัครเข้าศึกษาต่อ การจัดทำสถิติ และการติดต่อสื่อสารที่เกี่ยวข้อง
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                อ่าน <a href="#" className="text-blue-600 underline">นโยบายความเป็นส่วนตัว (Privacy Policy)</a>
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50 p-6 rounded-b-xl flex justify-end items-center border-t">
          
          <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-8">
            {loading ? "กำลังบันทึก..." : "ยืนยันและรับรหัสการสมัคร"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}




