import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    if (!session || (userRole !== 'ADMIN' && userRole !== 'STAFF')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "File must be a PDF" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text from PDF using pdf-parse v1.1.1
    // Dynamically import to prevent Next.js build errors (ENOENT for test/data pdfs)
    const pdfParse = (await import("pdf-parse")).default;
    const data = await pdfParse(buffer);
    
    // Clean up the text a bit (remove excessive newlines)
    const cleanedText = data.text.replace(/\n\s*\n/g, '\n\n').trim();
    
    if (!cleanedText) {
      return NextResponse.json({ 
        text: "", 
        warning: "ไม่พบข้อความที่สามารถอ่านได้จาก PDF นี้ (อาจเป็นไฟล์รูปภาพที่แปลงมาเป็น PDF หรือถูกเข้ารหัส) กรุณาพิมพ์ข้อมูลเอง หรือใช้โปรแกรมอื่นคัดลอกข้อความ" 
      });
    }

    return NextResponse.json({ text: cleanedText });
  } catch (error) {
    console.error("PDF Extraction Error:", error);
    return NextResponse.json({ error: "Failed to extract text from PDF" }, { status: 500 });
  }
}
