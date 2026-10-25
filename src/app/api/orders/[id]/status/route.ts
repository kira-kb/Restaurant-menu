import { NextRequest, NextResponse } from 'next/server';
import { getPublicOrderStatus } from '@/lib/orders';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  _req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    if (!id || id === 'undefined') {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    const order = await getPublicOrderStatus(id);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, order });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch order status';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
