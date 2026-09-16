import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || ((session.user as any).role !== 'ADMIN' && (session.user as any).role !== 'STAFF')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const knowledgeList = await prisma.chatbotKnowledge.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(knowledgeList);
  } catch (error) {
    console.error("GET ChatbotKnowledge Error:", error);
    return NextResponse.json({ error: "Failed to fetch knowledge" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || ((session.user as any).role !== 'ADMIN' && (session.user as any).role !== 'STAFF')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { topic, content } = body;

    if (!topic || !content) {
       return NextResponse.json({ error: "Missing topic or content" }, { status: 400 });
    }

    const knowledge = await prisma.chatbotKnowledge.create({
      data: { topic, content }
    });

    return NextResponse.json(knowledge);
  } catch (error) {
    console.error("POST ChatbotKnowledge Error:", error);
    return NextResponse.json({ error: "Failed to create knowledge" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || ((session.user as any).role !== 'ADMIN' && (session.user as any).role !== 'STAFF')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, topic, content } = body;

    const knowledge = await prisma.chatbotKnowledge.update({
      where: { id },
      data: { topic, content }
    });

    return NextResponse.json(knowledge);
  } catch (error) {
    console.error("PUT ChatbotKnowledge Error:", error);
    return NextResponse.json({ error: "Failed to update knowledge" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || ((session.user as any).role !== 'ADMIN' && (session.user as any).role !== 'STAFF')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
       return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    await prisma.chatbotKnowledge.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE ChatbotKnowledge Error:", error);
    return NextResponse.json({ error: "Failed to delete knowledge" }, { status: 500 });
  }
}
