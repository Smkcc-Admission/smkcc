import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/admin");
  }

  let settings = await prisma.systemSettings.findUnique({
    where: { id: "1" }
  });

  if (!settings) {
    settings = await prisma.systemSettings.create({
      data: { id: "1", isGlobalAdmissionOpen: true }
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">ตั้งค่าระบบ (Settings)</h2>
        <p className="text-muted-foreground">จัดการตั้งค่าการรับสมัครและระบบต่างๆ</p>
      </div>

      <SettingsClient 
        initialIsOpen={settings.isGlobalAdmissionOpen} 
        initialTerm={settings.currentTerm}
        initialAcademicYear={settings.currentAcademicYear}
      />
    </div>
  );
}
