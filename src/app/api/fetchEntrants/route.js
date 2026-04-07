import { NextResponse } from 'next/server';
import { fetchEventEntrants } from '@/lib/startgg';

export async function POST(request) {
  try {
    const { eventSlug } = await request.json();
    const apiKey = process.env.STARTGG_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Missing STARTGG_API_KEY environment variable. Please configure it in .env' }, { status: 500 });
    }

    if (!eventSlug) {
      return NextResponse.json({ error: 'Missing eventSlug' }, { status: 400 });
    }

    const eventData = await fetchEventEntrants(apiKey, eventSlug, 1, 500);

    return NextResponse.json({ event: eventData }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message || 'Failed to fetch from Start.gg API' }, { status: 500 });
  }
}
