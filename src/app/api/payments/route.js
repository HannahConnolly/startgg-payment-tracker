import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

// Standard singleton to avoid exhaustion in dev mode
const globalForPrisma = global;
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Fetch all payments for a specific event
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get('eventId');

  if (!eventId) {
    return NextResponse.json({ error: 'Missing eventId' }, { status: 400 });
  }

  try {
    const payments = await prisma.payment.findMany({
      where: { eventId }
    });
    return NextResponse.json(payments, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
  }
}

// Upsert a payment status (toggle paid/unpaid)
export async function POST(request) {
  try {
    const body = await request.json();
    const { entrantId, eventId, isPaid } = body;

    if (!entrantId || !eventId || typeof isPaid !== 'boolean') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const payment = await prisma.payment.upsert({
      where: {
        entrantId_eventId: {
          entrantId,
          eventId
        }
      },
      update: {
        isPaid
      },
      create: {
        entrantId,
        eventId,
        isPaid
      }
    });

    return NextResponse.json(payment, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Database write failed' }, { status: 500 });
  }
}
