"use client";

import { useState } from "react";
import { AdminUser, Program } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addAdminUser, deleteAdminUser, updateAdminRole } from "@/app/admin/(dashboard)/admins/actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function AdminListManager({ 
  initialAdmins, 
  currentUserId,
  programs
}: { 
  initialAdmins: AdminUser[], 
  currentUserId: string,
  programs: Program[] 
}) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("STAFF");
  const [newProgramId, setNewProgramId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;
    setIsSubmitting(true);
    
    const res = await addAdminUser(newEmail, newRole, newProgramId || undefined);
    if (res.success) {
      setIsAddOpen(false);
      setNewEmail("");
      setNewRole("STAFF");
      setNewProgramId("");
      alert("เพิ่มผู้ดูแลระบบสำเร็จ");
    } else {
      alert(`ไม่สามารถเพิ่มได้: ${res.error}`);
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string, email: string) => {
    if (id === currentUserId) {
      alert("ไม่สามารถลบบัญชีตัวเองได้");
      return;
    }
    
    if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบบัญชี ${email}?`)) {
      const res = await deleteAdminUser(id);
      if (res.success) {
        alert("ลบบัญชีสำเร็จ");
      } else {
        alert(`เกิดข้อผิดพลาด: ${res.error}`);
      }
    }
  };

  const handleRoleChange = async (id: string, newRole: string) => {
    if (id === currentUserId && newRole !== 'ADMIN') {
      alert("ไม่สามารถลดสิทธิ์ตัวเองได้");
      return;
    }

    if (confirm(`คุณแน่ใจหรือไม่ที่จะเปลี่ยนสิทธิ์บัญชีนี้เป็น ${newRole}?`)) {
      const res = await updateAdminRole(id, newRole);
      if (res.success) {
        alert("อัปเดตสิทธิ์สำเร็จ");
      } else {
        alert(`เกิดข้อผิดพลาด: ${res.error}`);
      }
    }
  };

  const handleProgramChange = async (id: string, role: string, programId: string) => {
    if (confirm(`คุณแน่ใจหรือไม่ที่จะเปลี่ยนสาขาวิชาที่ดูแล?`)) {
      const res = await updateAdminRole(id, role, programId || undefined);
      if (res.success) {
        alert("อัปเดตสาขาวิชาสำเร็จ");
      } else {
        alert(`เกิดข้อผิดพลาด: ${res.error}`);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b flex justify-between items-center bg-gray-50">
        <h2 className="font-semibold text-gray-800">รายชื่อผู้ดูแลระบบทั้งหมด ({initialAdmins.length})</h2>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger>
            <span className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-primary-foreground hover:bg-blue-600/90 h-10 px-4 py-2">+ เพิ่มผู้ดูแลระบบ</span>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>เพิ่มผู้ดูแลระบบใหม่</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="email">Google Email (Gmail / Google Workspace)</Label>
                <Input 
                  id="email" 
                  type="email" 
                  required 
                  placeholder="name@gmail.com หรือ name@smkcc.ac.th"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">ระดับสิทธิ์</Label>
                <select 
                  id="role"
                  className="w-full border border-gray-300 rounded-md p-2"
                  value={newRole}
                  onChange={(e) => {
                    setNewRole(e.target.value);
                    if (e.target.value === 'ADMIN') setNewProgramId("");
                  }}
                >
                  <option value="STAFF">STAFF (เจ้าหน้าที่สาขาวิชา)</option>
                  <option value="ADMIN">ADMIN (ผู้ดูแลระบบสูงสุด)</option>
                </select>
              </div>

              {newRole === 'STAFF' && (
                <div className="space-y-2">
                  <Label htmlFor="programId">ดูแลสาขาวิชา (เว้นว่างถ้าดูแลทุกสาขา)</Label>
                  <select 
                    id="programId"
                    className="w-full border border-gray-300 rounded-md p-2"
                    value={newProgramId}
                    onChange={(e) => setNewProgramId(e.target.value)}
                  >
                    <option value="">-- ดูแลทุกสาขาวิชา --</option>
                    {programs.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "กำลังดำเนินการ..." : "เพิ่มผู้ใช้"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-900">อีเมล</th>
              <th className="px-6 py-4 font-semibold text-gray-900">ระดับสิทธิ์</th>
              <th className="px-6 py-4 font-semibold text-gray-900">สาขาวิชาที่ดูแล</th>
              <th className="px-6 py-4 font-semibold text-gray-900 text-right">การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {initialAdmins.map((admin) => (
              <tr key={admin.id} className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold uppercase">
                    {admin.email.charAt(0)}
                  </div>
                  {admin.email}
                  {admin.id === currentUserId && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full ml-2">บัญชีของคุณ</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <select
                    className={`border rounded-md px-2 py-1 text-xs font-bold ${
                      admin.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-gray-100 text-gray-700 border-gray-300'
                    }`}
                    value={admin.role}
                    onChange={(e) => handleRoleChange(admin.id, e.target.value)}
                    disabled={admin.id === currentUserId}
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="STAFF">STAFF</option>
                  </select>
                </td>
                <td className="px-6 py-4">
                  {admin.role === 'STAFF' ? (
                    <select
                      className="border rounded-md px-2 py-1 text-xs text-gray-700 border-gray-300 w-48"
                      value={admin.programId || ""}
                      onChange={(e) => handleProgramChange(admin.id, admin.role, e.target.value)}
                      disabled={admin.id === currentUserId}
                    >
                      <option value="">-- ดูแลทุกสาขาวิชา --</option>
                      {programs.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-gray-400 italic text-xs">ควบคุมทุกส่วน</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-600 hover:text-red-800 hover:bg-red-50"
                    disabled={admin.id === currentUserId}
                    onClick={() => handleDelete(admin.id, admin.email)}
                  >
                    ลบบัญชี
                  </Button>
                </td>
              </tr>
            ))}
            {initialAdmins.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  ไม่พบข้อมูลผู้ดูแลระบบ
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
