import { NextResponse } from "next/server";
import OpenAI from "openai";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
    }

    // Initialize OpenAI with KKU URL and the provided key
    const apiKey = process.env.KKU_AI_API_KEY;
    if (!apiKey) {
      console.error("Missing KKU_AI_API_KEY");
      return NextResponse.json({ error: "AI API Key is not configured." }, { status: 500 });
    }

    const openai = new OpenAI({
      baseURL: 'https://gen.ai.kku.ac.th/iccsacth/api/v1',
      apiKey: apiKey,
    });

    // Fetch dynamic knowledge from the database (All items)
    const knowledgeList = await prisma.chatbotKnowledge.findMany({
      orderBy: { createdAt: 'asc' }
    });

    // Fetch dynamic database context: Programs and applicants
    const programs = await prisma.program.findMany({
      include: {
        _count: {
          select: { applicants: true }
        }
      }
    });

    const applicants = await prisma.applicant.findMany({
      select: {
        firstName: true,
        lastName: true,
        status: true,
        program: { select: { name: true } }
      }
    });

    const statusMap: Record<string, string> = {
      'PENDING': 'รอตรวจสอบ',
      'DOCUMENT_REQUESTED': 'ขอเอกสารเพิ่มเติม',
      'APPROVED': 'อนุมัติ ผ่าน',
      'PAID': 'ชำระเงินแล้ว',
      'REJECTED': 'ไม่อนุมัติ/ยกเลิก'
    };

    let dbContext = "\n--- ข้อมูลเรียลไทม์จากฐานข้อมูล (ห้ามเปิดเผยชื่อผู้สมัครให้บุคคลอื่น) ---\n";
    
    // 1. Program Stats and Contacts
    dbContext += "[ข้อมูลสถิติผู้สมัคร และ ช่องทางการติดต่อแยกตามสาขาวิชา]\n";
    programs.forEach(p => {
      dbContext += `- ${p.name}: มีผู้สมัครแล้ว ${p._count.applicants} คน\n`;
      let contacts = [];
      if (p.contactName) contacts.push(`อ.ประจำสาขา: ${p.contactName}`);
      if (p.contactPhone) contacts.push(`โทร: ${p.contactPhone}`);
      if (p.lineOaUrl) contacts.push(`Line: ${p.lineOaUrl}`);
      if (p.facebookUrl) contacts.push(`Facebook: ${p.facebookUrl}`);
      if (p.tiktokUrl) contacts.push(`TikTok: ${p.tiktokUrl}`);
      
      if (contacts.length > 0) {
        dbContext += `  ช่องทางการติดต่อ ${p.name}:\n  - ${contacts.join('\n  - ')}\n`;
      }
    });

    // 2. Applicant Statuses
    dbContext += "\n[รายชื่อผู้สมัครและสถานะปัจจุบัน]\n";
    applicants.forEach(app => {
      dbContext += `- ${app.firstName} ${app.lastName} (สาขา: ${app.program?.name || '-'}): สถานะ ${statusMap[app.status] || app.status}\n`;
    });
    dbContext += "--------------------------------------------------\n";

    // System prompt guiding the AI
    let systemPrompt = "คุณคือ 'น้องชุมชน' AI ผู้ช่วยตอบคำถามระบบรับสมัครเรียนของ วิทยาลัยชุมชนสมุทรสาคร (SMKCC)\n";
    systemPrompt += "ข้อบังคับ: \n";
    systemPrompt += "1. ให้ตอบข้อความอย่างสุภาพ เป็นมิตร และใช้ Emoji ประกอบความน่าสนใจเสมอ\n";
    systemPrompt += "2. **ห้ามเปิดเผยชื่อผู้สมัครคนอื่นให้ทราบเด็ดขาด** (Privacy Law)\n";
    systemPrompt += "3. หากผู้ใช้ถามว่า 'ฉันติดหรือยัง' ให้ปฏิเสธการตอบเนื่องจากไม่ทราบนามสกุล เป็นต้น \n";
    systemPrompt += "4. หากถามหาช่องทางการติดต่อ ให้แนะนำช่องทางที่ถูกต้อง โดยต้องจัดเรียงบรรทัดให้สวยงาม (แยกบรรทัดละ 1 ช่องทาง)\n";
    systemPrompt += "5. **สำคัญมาก เรื่องการจัดหน้า (Formatting):** ให้ตอบกลับโดยใช้ Markdown เสมอ พยายามใช้ Bullet points (-), ตัวหนา (**text**), และเว้นบรรทัด (New lines) เพื่อแบ่งหมวดหมู่ข้อมูลให้อ่านง่าย ห้ามตอบเป็นข้อความติดกันเป็นพืดเด็ดขาด\n\n";

    if (knowledgeList.length > 0) {
      systemPrompt += `\n[คู่มือแอดมินสำหรับตอบคำถามทั่วไป]\n`;
      knowledgeList.forEach(k => {
        systemPrompt += `--- ${k.topic} ---\n${k.content}\n\n`;
      });
    }

    systemPrompt += dbContext;

    // Combine system prompt with user messages
    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m: any) => ({
        role: m.role,
        content: m.content
      }))
    ];

    const completion = await openai.chat.completions.create({
      messages: apiMessages as any,
      model: "claude-sonnet-5",
      stream: false
    });

    const aiMessage = completion.choices[0]?.message?.content || "ขออภัยค่ะ ฉันไม่สามารถตอบได้ในขณะนี้";

    return NextResponse.json({ message: aiMessage });
  } catch (error: any) {
    console.error("Chat API Error:", error.response?.data || error.message);
    return NextResponse.json({ error: "Failed to communicate with AI service" }, { status: 500 });
  }
}
