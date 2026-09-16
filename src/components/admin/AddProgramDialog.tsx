"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createProgram } from "@/app/admin/(dashboard)/programs/actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { buttonVariants } from "@/components/ui/button";

export default function AddProgramDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [lineOaUrl, setLineOaUrl] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [tiktokUrl, setTiktokUrl] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [locations, setLocations] = useState<string[]>([]);
  const [newLocation, setNewLocation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const res = await createProgram({
      name,
      lineOaUrl: lineOaUrl.trim() || null,
      facebookUrl: facebookUrl.trim() || null,
      tiktokUrl: tiktokUrl.trim() || null,
      contactName: contactName.trim() || null,
      contactPhone: contactPhone.trim() || null,
      locations
    });

    if (res.success) {
      setOpen(false);
      setName("");
      setLineOaUrl("");
      setFacebookUrl("");
      setTiktokUrl("");
      setContactName("");
      setContactPhone("");
      setLocations([]);
    } else {
      setError(res.error || "Something went wrong.");
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={buttonVariants({ variant: "default" })}>
        ➕ เพิ่มสาขาวิชา
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>เพิ่มสาขาวิชาใหม่</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4 max-h-[80vh] overflow-y-auto px-2">
          {error && <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</div>}

          <div className="space-y-2">
            <Label htmlFor="name">ชื่อสาขาวิชา</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="เช่น สาขาวิชาการจัดการ"
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

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>ยกเลิก</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "กำลังบันทึก..." : "บันทึกสาขาวิชา"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
