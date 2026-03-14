import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { eventType, data } = body;

    logger.info('Roblox webhook received', { eventType });

    switch (eventType) {
      case 'RightToErasureRequest': {
        logger.info('Processing right to erasure request', { userId: data?.userId });
        // Handle GDPR/CCPA erasure requests
        break;
      }

      case 'SampleNotification': {
        logger.info('Sample notification received', { data });
        break;
      }

      default: {
        logger.warn('Unknown webhook event type', { eventType });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Roblox webhook error', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
