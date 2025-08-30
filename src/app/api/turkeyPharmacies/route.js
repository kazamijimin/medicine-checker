import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');
  const district = searchParams.get('district');

  if (!city) {
    return NextResponse.json(
      { error: 'City is required' },
      { status: 400 }
    );
  }

  try {
    // Use CollectAPI for Turkish duty pharmacies
    const API_KEY = 'apikey_0QxuqeeFEmXzWToorTOvOr:5wOBBdySajAdeepXY4nud4';
    
    let url = `https://api.collectapi.com/health/dutyPharmacy?il=${encodeURIComponent(city)}`;
    
    if (district) {
      url += `&ilce=${encodeURIComponent(district)}`;
    }
    
    console.log('🇹🇷 Fetching from CollectAPI...');
    console.log('Request URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `apikey ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`CollectAPI error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log('CollectAPI Response:', {
      success: data.success,
      resultCount: data.result?.length || 0
    });
    
    if (data.success && data.result && data.result.length > 0) {
      // Transform the data to match expected format
      const transformedData = {
        success: true,
        result: data.result.map((pharmacy, index) => ({
          id: `tr_${index}`,
          name: pharmacy.name || pharmacy.pharmacyName || 'Eczane',
          address: pharmacy.address || pharmacy.fullAddress || `${district || 'Merkez'}, ${city}`,
          phone: pharmacy.phone || pharmacy.phoneNumber || 'Phone not available',
          district: pharmacy.district || pharmacy.ilce || district || 'Merkez',
          city: city
        }))
      };
      
      return NextResponse.json(transformedData);
    } else {
      // No results found
      return NextResponse.json({
        success: true,
        result: [],
        message: `No duty pharmacies found for ${city}${district ? `, ${district}` : ''}`
      });
    }
    
  } catch (error) {
    console.error('Turkey Pharmacies API Error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      result: []
    }, { status: 500 });
  }
}