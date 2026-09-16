"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <Card className="w-full max-w-sm shadow-xl">
      <CardHeader className="text-center space-y-2">
        <div className="mx-auto flex justify-center mb-4">
          <img src="/logo.png" alt="SMKCC Logo" className="h-20 w-auto" />
        </div>
        <CardTitle className="text-2xl font-bold">ระบบจัดการรับสมัครเรียน</CardTitle>
        <CardDescription>วิทยาลัยชุมชนสมุทรสาคร (สำหรับเจ้าหน้าที่เท่านั้น)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-4 pb-8">
        {error === "AccessDenied" && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm text-center border border-red-200">
            ปฏิเสธการเข้าถึง: อีเมลนี้ไม่ได้รับสิทธิ์ให้เข้าใช้งานระบบ
          </div>
        )}
        <Button 
          onClick={() => signIn("google", { callbackUrl: "/admin" })}
          className="w-full h-12 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 flex items-center gap-3 shadow-sm"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          เข้าสู่ระบบด้วย Google
        </Button>
      </CardContent>
    </Card>
  );
}

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Suspense fallback={<div className="w-full max-w-sm h-64 bg-white rounded-lg shadow-xl animate-pulse"></div>}>
        <LoginContent />
      </Suspense>
    </main>
  );
}
