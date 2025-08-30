import { NextResponse } from 'next/server';

export async function GET() {
  const testResults = {
    googlePlaces: false,
    collectApi: false,
    timestamp: new Date().toISOString()
  };

  // Test Google Places API
  try {
    const googleKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
    if (googleKey) {
      // Test with Manila coordinates
      const testUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=14.5995,120.9842&radius=1000&type=pharmacy&key=${googleKey}`;
      const response = await fetch(testUrl);
      const data = await response.json();
      testResults.googlePlaces = data.status === 'OK';
      testResults.googlePlacesDetails = {
        status: data.status,
        resultsCount: data.results?.length || 0
      };
    }
  } catch (error) {
    testResults.googlePlacesError = error.message;
  }

  // Test CollectAPI
  try {
    const collectKey = process.env.NEXT_PUBLIC_COLLECTAPI_KEY;
    if (collectKey) {
      const response = await fetch('https://api.collectapi.com/health/dutyPharmacy?il=Ankara', {
        headers: {
          'authorization': collectKey,
          'content-type': 'application/json'
        }
      });
      const data = await response.json();
      testResults.collectApi = data.success === true;
      testResults.collectApiDetails = {
        success: data.success,
        resultsCount: data.result?.length || 0
      };
    }
  } catch (error) {
    testResults.collectApiError = error.message;
  }

  return NextResponse.json(testResults);
}