"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProgram, deleteProgram } from "@/app/admin/(dashboard)/programs/actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Program } from "@prisma/client";

import { buttonVariants } from "@/components/ui/button";

export default function EditProgramDialog({ program }: { program: Program }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(program.name);
  const [lineOaUrl, setLineOaUrl] = useState(program.lineOaUrl || "");
  const [facebookUrl, setFacebookUrl] = useState(program.facebookUrl || "");
  const [tiktokUrl, setTiktokUrl] = useState(program.tiktokUrl || "");
  const [contactName, setContactName] = useState(program.contactName || "");
  const [contactPhone, setContactPhone] = useState(program.contactPhone || "");
  const [isOpen, setIsOpen] = useState(program.isOpen);
  const [locations, setLocations] = useState<string[]>(program.locations || []);
  const [newLocation, setNewLocation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [posterUrl, setPosterUrl] = useState(program.posterUrl || "");
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const addLocation = (e: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent<HTMLButtonElement>) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    if (newLocation.trim() && !locations.includes(newLocation.trim())) {
      setLocations([...locations, newLocation.trim()]);
      setNewLocation("");
    }
  };

  const removeLocation = (locToRemove: string) => {
    setLocations(locations.filter(loc => loc !== locToRemove));
  };

  const handleUploadPoster = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`/api/admin/programs/${program.id}/poster`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setPosterUrl(data.posterUrl);
        // We could also revalidate or refresh to show the new link immediately
      } else {
        setError(data.error || "อัปโหลดไม่สำเร็จ");
      }
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const res = await updateProgram(program.id, {
      name,
      lineOaUrl: lineOaUrl.trim() || null,
      facebookUrl: facebookUrl.trim() || null,
      tiktokUrl: tiktokUrl.trim() || null,
      contactName: contactName.trim() || null,
      contactPhone: contactPhone.trim() || null,
      isOpen,
      locations
    });

    if (res.success) {
      setOpen(false);
    } else {
      setError(res.error || "Something went wrong.");
    }
    setIsLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this program?")) return;
    
    setIsDeleting(true);
    setError("");

    const res = await deleteProgram(program.id);

    if (res.success) {
      setOpen(false);
    } else {
      setError(res.error || "Failed to delete.");
    }
    setIsDeleting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={buttonVariants({ variant: "outline", size: "sm" })}>
        แก้ไข / ลบ
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>จัดการสาขาวิชา</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4 max-h-[80vh] overflow-y-auto px-2">
          {error && <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</div>}
          
          <div className="space-y-2 pb-4 border-b">
            <Label>โปสเตอร์สาขาวิชา (PDF หรือ รูปภาพ)</Label>
            <div className="flex items-center gap-4">
              <Input 
                type="file" 
                accept=".pdf,image/*" 
                onChange={handleUploadPoster}
                disabled={isUploading}
                className="max-w-[250px]"
              />
              {isUploading && <span className="text-sm text-blue-600">กำลังอัปโหลด...</span>}
            </div>
            {posterUrl && (
              <p className="text-sm mt-2">
                <a href={posterUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                  ดูโปสเตอร์ปัจจุบัน
                </a>
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name">ชื่อสาขาวิชา</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lineOaUrl">ลิงก์ Line OA สาขา (URL)</Label>
            <Input 
              id="lineOaUrl" 
              type="text"
              placeholder="https://lin.ee/..."
              value={lineOaUrl} 
              onChange={(e) => setLineOaUrl(e.target.value)} 
            />
            <p className="text-xs text-gray-500">ใส่ URL ของ Line OA เช่น https://lin.ee/xxxxxx</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="facebookUrl">ลิงก์ Facebook Page สาขา (URL)</Label>
            <Input 
              id="facebookUrl" 
              type="text"
              placeholder="https://facebook.com/..."
              value={facebookUrl} 
              onChange={(e) => setFacebookUrl(e.target.value)} 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tiktokUrl">ลิงก์ Tiktok สาขา (URL)</Label>
            <Input 
              id="tiktokUrl" 
              type="text"
              placeholder="https://tiktok.com/@..."
              value={tiktokUrl} 
              onChange={(e) => setTiktokUrl(e.target.value)} 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactName">ชื่อผู้ติดต่อ / อาจารย์ประจำสาขา (ถ้ามี)</Label>
            <Input 
              id="contactName" 
              placeholder="เช่น อ.สมหญิง"
              value={contactName} 
              onChange={(e) => setContactName(e.target.value)} 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPhone">เบอร์โทรศัพท์ติดต่อ (อาจารย์ประจำสาขา)</Label>
            <Input 
              id="contactPhone" 
              placeholder="เช่น 081-234-5678"
              value={contactPhone} 
              onChange={(e) => setContactPhone(e.target.value)} 
            />
          </div>

          <div className="space-y-2">
            <Label>สถานที่จัดการเรียนการสอน (พิมพ์แล้วกด Enter)</Label>
            <div className="flex gap-2">
              <Input 
                placeholder="เช่น วิทยาลัยชุมชนสมุทรสาคร"
                value={newLocation} 
                onChange={(e) => setNewLocation(e.target.value)}
                onKeyDown={addLocation}
              />
              <Button type="button" onClick={addLocation} variant="secondary">เพิ่ม</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {locations.map((loc) => (
                <span key={loc} className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full flex items-center gap-1">
                  {loc}
                  <button type="button" onClick={() => removeLocation(loc)} className="text-blue-500 hover:text-blue-700 focus:outline-none">
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2 py-2">
            <input 
              type="checkbox" 
              id="isOpen" 
              checked={isOpen}
              onChange={(e) => setIsOpen(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <Label htmlFor="isOpen" className="font-semibold cursor-pointer">
              เปิดรับสมัครสาขานี้
            </Label>
          </div>

          <div className="pt-4 flex justify-between gap-2">
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={isLoading || isDeleting}>
              {isDeleting ? "กำลังลบ..." : "ลบสาขานี้"}
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading || isDeleting}>
                ยกเลิก
              </Button>
              <Button type="submit" disabled={isLoading || isDeleting}>
                {isLoading ? "กำลังบันทึก..." : "บันทึก"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
