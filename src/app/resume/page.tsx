"use client";

import { useEffect, useState, Suspense } from "react";
import { verifyApplicant, verifyMagicToken } from "@/app/actions";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

function ResumeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setLoading(true);
      verifyMagicToken(token).then((res) => {
        if (res.success && res.id) {
          router.push(`/applicant/${res.id}`);
        } else {
          setError(res.error || "ลิงก์หมดอายุหรือไม่ถูกต้อง");
          setLoading(false);
        }
      });
    }
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      applicationId: formData.get("applicationId") as string,
      nationalId: formData.get("nationalId") as string,
    };

    const res = await verifyApplicant(data);
    
    if (res.success && res.id) {
      router.push(`/applicant/${res.id}`);
    } else {
      setError(res.error || "รหัสไม่ถูกต้อง");
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-2xl border-0">
      <CardHeader className="space-y-1 bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-t-xl p-6 text-center">
        <CardTitle className="text-2xl font-bold">เข้าสู่ระบบผู้สมัคร</CardTitle>
        <CardDescription className="text-blue-100">
          เพื่ออัปโหลดเอกสาร หรือตรวจสอบสถานะการสมัคร
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-6 p-6">
          {error && <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm text-center font-medium">{error}</div>}
          
          <div className="space-y-2">
            <Label htmlFor="applicationId">รหัสการสมัคร (Application ID)</Label>
            <Input id="applicationId" name="applicationId" placeholder="เช่น SMKCC25690001" required disabled={loading} />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="nationalId">เลขบัตรประจำตัวประชาชน</Label>
            <Input id="nationalId" name="nationalId" placeholder="13 หลัก" required pattern="\d{13}" maxLength={13} disabled={loading} />
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50 p-6 rounded-b-xl flex flex-col gap-3 border-t">
          <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg h-12">
            {loading ? "กำลังตรวจสอบ..." : "เข้าสู่ระบบ"}
          </Button>
          <Link href="/" className="text-sm text-blue-600 hover:underline text-center w-full">
            กลับไปหน้าฟอร์มแสดงความจำนง
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function ResumeApplicationPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center p-4">
      <Suspense fallback={<div className="text-blue-600 animate-pulse">กำลังโหลดข้อมูล...</div>}>
        <ResumeForm />
      </Suspense>
    </main>
  );
}
