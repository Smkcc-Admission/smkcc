import { NextRequest, NextResponse } from "next/server";
import { uploadPublicFileToDrive } from "@/lib/drive";
import prisma from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    const program = await prisma.program.findUnique({ where: { id }});
    if (!program) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const driveFileName = `[POSTER]_${program.code}_${file.name}`;
    
    const driveFile = await uploadPublicFileToDrive(buffer, driveFileName, file.type);

    await prisma.program.update({
      where: { id },
      data: {
        posterFileId: driveFile.id,
        posterUrl: driveFile.webViewLink
      }
    });

    return NextResponse.json({ success: true, posterUrl: driveFile.webViewLink });
  } catch (error) {
    console.error("Error uploading poster:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
