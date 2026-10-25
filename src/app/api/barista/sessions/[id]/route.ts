import { NextRequest, NextResponse } from 'next/server';
import { getSessionFinancialSummary, closeTableSession } from '@/lib/payments';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const summary = await getSessionFinancialSummary(id);
    return NextResponse.json({ success: true, summary });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch session';
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const body = await req.json().catch(() => ({}));
    const closed = await closeTableSession(id, body.notes);
    return NextResponse.json({ success: true, session: closed });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to close table session';
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}
