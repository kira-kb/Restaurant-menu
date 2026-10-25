import { NextRequest, NextResponse } from 'next/server';
import { createCustomerOrder } from '@/lib/orders';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await createCustomerOrder(body);
    return NextResponse.json({
      success: true,
      orderId: result.orderId,
      order: result,
    });
  } catch (error: unknown) {
    console.error('Customer order creation error:', error);
    const message = error instanceof Error ? error.message : 'Failed to place order.';
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}
