import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import OpenAI from "openai";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const year = searchParams.get('year');
    const currentYear = String(new Date().getFullYear() + 543);
    const selectedYear = year || currentYear;

    const apiKey = process.env.KKU_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "AI API Key is not configured." }, { status: 500 });
    }

    const openai = new OpenAI({
      baseURL: 'https://gen.ai.kku.ac.th/iccsacth/api/v1',
      apiKey: apiKey,
    });

    // 1. Gather context from DB
    const userRole = (session.user as any).role;
    const userProgramId = (session.user as any).programId;

    const whereCondition: any = { academicYear: selectedYear };
    if (userRole === 'STAFF' && userProgramId) {
      whereCondition.programId = userProgramId;
    }

    const totalApplicants = await prisma.applicant.count({ where: whereCondition });
    const pendingApplicants = await prisma.applicant.count({ where: { ...whereCondition, status: 'PENDING' } });
    const docReqApplicants = await prisma.applicant.count({ where: { ...whereCondition, status: 'DOCUMENT_REQUESTED' } });
    const approvedApplicants = await prisma.applicant.count({ where: { ...whereCondition, status: 'APPROVED' } });
    const paidApplicants = await prisma.applicant.count({ where: { ...whereCondition, status: 'PAID' } });

    const programQueryWhere: any = { isOpen: true };
    if (userRole === 'STAFF' && userProgramId) {
      programQueryWhere.id = userProgramId;
    }

    const programs = await prisma.program.findMany({
      where: programQueryWhere,
      include: {
        _count: {
          select: { applicants: true }
        }
      }
    });

    // Prepare prompt
    let promptContext = `นี่คือข้อมูลสถิติผู้สมัครเรียนล่าสุดของวิทยาลัยชุมชนสมุทรสาคร:\n`;
    promptContext += `- ผู้สมัครทั้งหมด: ${totalApplicants} คน\n`;
    promptContext += `- รอตรวจสอบ: ${pendingApplicants} คน\n`;
    promptContext += `- ขอเอกสารเพิ่ม: ${docReqApplicants} คน\n`;
    promptContext += `- อนุมัติผ่านแล้ว: ${approvedApplicants} คน\n`;
    promptContext += `- ชำระเงินแล้ว: ${paidApplicants} คน\n\n`;

    promptContext += `แยกตามสาขาวิชา:\n`;
    programs.forEach(p => {
      promptContext += `- ${p.name}: ${p._count.applicants} คน\n`;
    });

    const systemPrompt = `คุณคือผู้ช่วย AI สำหรับผู้บริหารวิทยาลัยชุมชนสมุทรสาคร (SMKCC) 
หน้าที่ของคุณคือสรุปข้อมูลสถิติผู้สมัครเรียนประจำวันให้กระชับ อ่านง่าย และชี้ให้เห็นจุดที่ควรให้ความสนใจ 
เช่น สาขาที่มีคนสมัครเยอะที่สุด หรือจำนวนคนที่ค้างอยู่ในสถานะ 'รอตรวจสอบ' หรือ 'ขอเอกสารเพิ่ม' ที่เจ้าหน้าที่ควรเร่งจัดการ
ห้ามแต่งตัวเลขเอง ให้ใช้ตัวเลขจากข้อมูลที่ให้มาเท่านั้น 
ตอบเป็นภาษาไทย ความยาวไม่เกิน 4-5 บรรทัด หรือใช้ Bullet point ให้ดูสบายตา 
ใช้อิโมจิเพื่อความสวยงามได้แต่อย่าเยอะเกินไป`;

    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: promptContext }
      ],
      model: "claude-sonnet-5", // Assuming the KKU API supports this model string based on chat API
      stream: false
    });

    const aiMessage = completion.choices[0]?.message?.content || "ไม่สามารถสร้างสรุปข้อมูลได้ในขณะนี้";

    return NextResponse.json({ summary: aiMessage });

  } catch (error: any) {
    console.error("AI Summary API Error:", error.response?.data || error.message);
    return NextResponse.json({ error: "Failed to generate AI summary" }, { status: 500 });
  }
}
