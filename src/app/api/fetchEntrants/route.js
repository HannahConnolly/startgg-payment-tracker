import { NextResponse } from 'next/server';
import { fetchEventEntrants } from '@/lib/startgg';

export async function POST(request) {
  try {
    const { apiKey, eventSlug } = await request.json();

    if (!apiKey || !eventSlug) {
      return NextResponse.json({ error: 'Missing apiKey or eventSlug' }, { status: 400 });
    }

    const eventData = await fetchEventEntrants(apiKey, eventSlug, 1, 500);

    return NextResponse.json({ event: eventData }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message || 'Failed to fetch from Start.gg API' }, { status: 500 });
  }
}
