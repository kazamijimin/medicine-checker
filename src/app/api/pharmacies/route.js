import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if (!lat || !lng) {
    return NextResponse.json(
      { error: 'Latitude and longitude are required' },
      { status: 400 }
    );
  }

  try {
    // Use your Google Places API key
    const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
    
    if (!API_KEY) {
      throw new Error('Google Places API key not configured');
    }

    const radius = 5000; // 5km radius
    const type = 'pharmacy';
    
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${API_KEY}`;
    
    console.log('🇵🇭 Fetching from Google Places API...');
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log(`Google API Status: ${data.status}, Results: ${data.results?.length || 0}`);
    
    if (data.status === 'OK' && data.results && data.results.length > 0) {
      // Get detailed info for each pharmacy
      const detailedResults = await Promise.all(
        data.results.slice(0, 15).map(async (place) => {
          try {
            // Get place details for phone numbers and hours
            const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=formatted_phone_number,opening_hours,website,rating&key=${API_KEY}`;
            const detailsResponse = await fetch(detailsUrl);
            
            if (detailsResponse.ok) {
              const detailsData = await detailsResponse.json();
              return {
                ...place,
                formatted_phone_number: detailsData.result?.formatted_phone_number || 'Contact pharmacy directly',
                opening_hours: detailsData.result?.opening_hours,
                website: detailsData.result?.website,
                rating: detailsData.result?.rating || place.rating
              };
            }
            return place;
          } catch (error) {
            console.error('Error fetching place details:', error);
            return place;
          }
        })
      );
      
      return NextResponse.json({
        status: 'OK',
        results: detailedResults,
        source: 'Google Places API'
      });
    } else if (data.status === 'ZERO_RESULTS') {
      // No pharmacies found - return empty results
      return NextResponse.json({
        status: 'OK',
        results: [],
        message: 'No pharmacies found in this area'
      });
    } else {
      throw new Error(`Google API returned: ${data.status} - ${data.error_message || 'Unknown error'}`);
    }
    
  } catch (error) {
    console.error('Philippines Pharmacies API Error:', error);
    
    return NextResponse.json({
      error: `Failed to fetch pharmacy data: ${error.message}`,
      results: [],
      fallback: true
    }, { status: 500 });
  }
}