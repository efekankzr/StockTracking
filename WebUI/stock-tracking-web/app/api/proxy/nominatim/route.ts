import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
    }

    try {
        const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5&countrycodes=tr`;

        const response = await fetch(nominatimUrl, {
            headers: {
                'User-Agent': 'StockTrackingApp/1.0',
                'Accept-Language': 'tr',
                'Referer': 'http://localhost:3000'
            }
        });

        if (!response.ok) {
            throw new Error(`Nominatim API Error: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Nominatim Proxy Error:', error);
        return NextResponse.json({ error: 'Failed to fetch address data' }, { status: 500 });
    }
}
