"use client";

import { useState } from "react";
import { updateSystemSettings } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SettingsClient({ 
  initialIsOpen, 
  initialTerm, 
  initialAcademicYear 
}: { 
  initialIsOpen: boolean;
  initialTerm: string;
  initialAcademicYear: string;
}) {
  const [isOpen, setIsOpen] = useState(initialIsOpen);
  const [term, setTerm] = useState(initialTerm);
  const [academicYear, setAcademicYear] = useState(initialAcademicYear);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleToggle = async (newState: boolean) => {
    setLoading(true);
    setError("");
    setSaveSuccess(false);
    const res = await updateSystemSettings(newState, term, academicYear);
    if (res.error) {
      setError(res.error);
    } else {
      setIsOpen(newState);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
    setLoading(false);
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    setError("");
    setSaveSuccess(false);
    const res = await updateSystemSettings(isOpen, term, academicYear);
    if (res.error) {
      setError(res.error);
    } else {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-md border shadow-sm max-w-xl space-y-6">
      <div>
        <h3 className="text-lg font-medium">สวิตช์ควบคุมระบบรับสมัคร (Master Switch)</h3>
        <p className="text-sm text-gray-500 mt-1">
          การตั้งค่านี้จะควบคุมการเปิด-ปิดฟอร์มรับสมัครเรียนทั้งระบบของวิทยาลัย 
          หากปิดระบบ ผู้สมัครจะไม่สามารถกรอกฟอร์มใดๆ ได้เลย
        </p>
      </div>

      <div className="p-4 border rounded-md space-y-4">
        <h4 className="font-semibold text-gray-900">รอบการรับสมัครปัจจุบัน</h4>
        <p className="text-sm text-gray-500">
          ตั้งค่าเทอมและปีการศึกษาปัจจุบัน เมื่อมีผู้สมัครใหม่เข้ามา ระบบจะบันทึกให้อัตโนมัติว่าเป็นผู้สมัครของเทอมและปีการศึกษานี้
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">เทอม (Term)</label>
            <select 
              className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
            >
              <option value="1">เทอม 1</option>
              <option value="2">เทอม 2</option>
              <option value="3">เทอม 3 (ฤดูร้อน)</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">ปีการศึกษา (Academic Year)</label>
            <Input 
              placeholder="เช่น 2569" 
              value={academicYear} 
              onChange={(e) => setAcademicYear(e.target.value)} 
            />
          </div>
        </div>
        
        <div className="pt-2 flex items-center gap-4">
          <Button onClick={handleSaveSettings} disabled={loading}>
            {loading ? "กำลังบันทึก..." : "บันทึกรอบการรับสมัคร"}
          </Button>
          {saveSuccess && <span className="text-sm text-green-600 font-medium">✓ บันทึกสำเร็จ</span>}
        </div>
      </div>

      {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-200">{error}</div>}

      <div className="flex items-center justify-between p-4 border rounded-md">
        <div>
          <p className="font-semibold">{isOpen ? "กำลังเปิดรับสมัคร" : "ปิดรับสมัครแล้ว"}</p>
          <p className="text-sm text-gray-500">
            {isOpen 
              ? "หน้าเว็บหลักจะแสดงฟอร์มรับสมัครตามปกติ" 
              : "หน้าเว็บหลักจะซ่อนฟอร์มและแสดงประกาศปิดรับสมัคร"}
          </p>
        </div>
        <div>
          {isOpen ? (
            <Button 
              variant="destructive" 
              onClick={() => handleToggle(false)} 
              disabled={loading}
            >
              {loading ? "กำลังบันทึก..." : "กดเพื่อปิดระบบ"}
            </Button>
          ) : (
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white" 
              onClick={() => handleToggle(true)}
              disabled={loading}
            >
              {loading ? "กำลังบันทึก..." : "กดเพื่อเปิดระบบ"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
