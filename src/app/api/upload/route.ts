import { NextRequest, NextResponse } from "next/server";
import { uploadToGoogleDrive, getOrCreateApplicantFolder } from "@/lib/drive";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const applicantId = formData.get("applicantId") as string;
    const type = formData.get("type") as string;

    if (!file || !applicantId || !type) {
      return NextResponse.json({ error: "ข้อมูลไม่ครบถ้วน" }, { status: 400 });
    }

    const applicant = await prisma.applicant.findUnique({ where: { id: applicantId }});
    if (!applicant) {
      return NextResponse.json({ error: "ไม่พบผู้สมัคร" }, { status: 404 });
    }

    // สร้างหรือหาโฟลเดอร์สำหรับผู้สมัครคนนี้
    const folderName = `${applicant.applicationId} ${applicant.prefix}${applicant.firstName} ${applicant.lastName}`;
    const mainFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID!;
    const applicantFolderId = await getOrCreateApplicantFolder(folderName, mainFolderId);

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // อัปโหลดเข้าโฟลเดอร์ย่อยของผู้สมัคร
    const driveFileName = `[${type}]_${file.name}`;
    const driveFile = await uploadToGoogleDrive(buffer, driveFileName, file.type, applicantFolderId);
    
    // Save reference in DB
    await prisma.document.create({
      data: {
        applicantId,
        type: type as any,
        fileUrl: driveFile.webViewLink || "",
      }
    });

    return NextResponse.json({ success: true, file: driveFile });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการอัปโหลด: " + error.message }, { status: 500 });
  }
}
