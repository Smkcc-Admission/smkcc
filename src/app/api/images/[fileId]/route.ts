import { getFileStream } from '@/lib/drive';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await params;
  
  try {
    const stream = await getFileStream(fileId);
    
    // Create a readable stream from the node stream
    const webStream = new ReadableStream({
      start(controller) {
        stream.on('data', (chunk: any) => controller.enqueue(chunk));
        stream.on('end', () => controller.close());
        stream.on('error', (err: any) => controller.error(err));
      }
    });

    return new NextResponse(webStream, {
      headers: {
        'Content-Type': 'image/jpeg', // Defaulting to jpeg, browser will usually sniff it correctly
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });
  } catch (error) {
    console.error("Error serving image from Drive API:", error);
    return new NextResponse("Error fetching image", { status: 500 });
  }
}
