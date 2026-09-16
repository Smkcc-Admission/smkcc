"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createApplicantAdmin } from "@/app/admin/(dashboard)/applicants/actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Program } from "@prisma/client";

import { buttonVariants } from "@/components/ui/button";

export default function AddApplicantDialog({ programs }: { programs: Program[] }) {
  const [open, setOpen] = useState(false);
  const [nationalId, setNationalId] = useState("");
  const [prefix, setPrefix] = useState("นาย");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [programId, setProgramId] = useState("");
  const [status, setStatus] = useState("APPROVED");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!programId) {
      setError("กรุณาเลือกสาขาวิชา");
      setIsLoading(false);
      return;
    }

    const res = await createApplicantAdmin({
      nationalId: nationalId.trim(),
      prefix,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      programId,
      status
    });

    if (res.success) {
      setOpen(false);
      // Reset form
      setNationalId("");
      setFirstName("");
      setLastName("");
      setPhone("");
      setEmail("");
      setProgramId("");
    } else {
      setError(res.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={buttonVariants({ variant: "default" })}>
        ➕ เพิ่มผู้สมัคร (On-site)
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>เพิ่มผู้สมัครด้วยตนเอง (สำหรับ Walk-in / On-site)</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {error && <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</div>}
          
          <div className="space-y-2">
            <Label htmlFor="nationalId">เลขบัตรประจำตัวประชาชน</Label>
            <Input 
              id="nationalId" 
              value={nationalId} 
              onChange={(e) => setNationalId(e.target.value)} 
              placeholder="13 หลัก"
              required
              maxLength={13}
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-2">
              <Label htmlFor="prefix">คำนำหน้า</Label>
              <select 
                id="prefix"
                className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
              >
                <option value="นาย">นาย</option>
                <option value="นาง">นาง</option>
                <option value="นางสาว">นางสาว</option>
              </select>
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="firstName">ชื่อ</Label>
              <Input 
                id="firstName" 
                value={firstName} 
                onChange={(e) => setFirstName(e.target.value)} 
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">นามสกุล</Label>
            <Input 
              id="lastName" 
              value={lastName} 
              onChange={(e) => setLastName(e.target.value)} 
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
              <Input 
                id="phone" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">อีเมล (ถ้ามี)</Label>
              <Input 
                id="email" 
                type="email"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="programId">สาขาวิชา</Label>
            <select 
              id="programId"
              className="w-full border rounded-md px-3 py-2 text-sm bg-white"
              value={programId}
              onChange={(e) => setProgramId(e.target.value)}
              required
            >
              <option value="">-- เลือกสาขาวิชา --</option>
              {programs.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">สถานะเริ่มต้น</Label>
            <select 
              id="status"
              className="w-full border rounded-md px-3 py-2 text-sm bg-white"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="APPROVED">อนุมัติแล้ว (มาสมัครด้วยตนเองพร้อมเอกสารครบ)</option>
              <option value="PAID">ชำระเงินแล้ว</option>
              <option value="PENDING">รอตรวจสอบเอกสาร</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              ยกเลิก
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "กำลังบันทึก..." : "บันทึกผู้สมัคร"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
