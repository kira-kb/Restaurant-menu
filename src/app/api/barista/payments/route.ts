import { NextRequest, NextResponse } from 'next/server';
import { recordPayment } from '@/lib/payments';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const payment = await recordPayment(body);
    return NextResponse.json({ success: true, payment });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to record payment';
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}
