export const revalidate = 0;

import { NextResponse } from 'next/server';

const buildQuery = (lat, lng, radius) => `
[out:json][timeout:25];
(
  node["amenity"="pharmacy"](around:${radius},${lat},${lng});
  way["amenity"="pharmacy"](around:${radius},${lat},${lng});
  relation["amenity"="pharmacy"](around:${radius},${lat},${lng});
);
out tags center;
`;

async function fetchOverpass(query, endpoint) {
  return fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain; charset=UTF-8',
      'User-Agent': 'medicine-checker/1.0 (https://example.com)'
    },
    body: query
  });
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = parseFloat(searchParams.get('lat'));
    const lng = parseFloat(searchParams.get('lng'));
    const radius = parseInt(searchParams.get('radius') || '2000', 10); // meters

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return NextResponse.json({ error: 'Invalid lat/lng' }, { status: 400 });
    }

    const query = buildQuery(lat, lng, Math.min(Math.max(radius, 500), 5000)); // clamp 500–5000m

    // Try main endpoint, then fallback
    const endpoints = [
      'https://overpass-api.de/api/interpreter',
      'https://overpass.kumi.systems/api/interpreter'
    ];

    let res, data;
    for (const ep of endpoints) {
      res = await fetchOverpass(query, ep);
      if (res.ok) {
        data = await res.json();
        break;
      }
    }

    if (!res || !res.ok) {
      return NextResponse.json({ error: 'Overpass API error' }, { status: 502 });
    }

    const elements = Array.isArray(data?.elements) ? data.elements : [];
    const results = elements
      .map((e) => {
        const tags = e.tags || {};
        const lat = e.type === 'node' ? e.lat : e.center?.lat;
        const lng = e.type === 'node' ? e.lon : e.center?.lon;

        const parts = [
          tags['addr:housenumber'],
          tags['addr:street'],
          tags['addr:suburb'],
          tags['addr:city'],
          tags['addr:province'] || tags['addr:state'],
        ].filter(Boolean);

        return {
          id: `${e.type}/${e.id}`,
          name: tags.name || 'Pharmacy',
          address: parts.join(', ') || tags['addr:full'] || 'Address not available',
          phone: tags['contact:phone'] || tags['phone'] || 'Phone not available',
          opening_hours: tags['opening_hours'] || null,
          lat,
          lng
        };
      })
      .filter((r) => Number.isFinite(r.lat) && Number.isFinite(r.lng))
      .slice(0, 50);

    return NextResponse.json({ results }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}