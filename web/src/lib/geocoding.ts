import { GeocodeCacheDocument, ImportIssueDocument } from '@/types';
import { getCollection } from './mongodb';

interface GoogleGeocodingResult {
  results: Array<{
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
      location_type: 'ROOFTOP' | 'RANGE_INTERPOLATED' | 'GEOMETRIC_CENTER' | 'APPROXIMATE';
    };
    place_id: string;
  }>;
  status: 'OK' | 'ZERO_RESULTS' | 'OVER_QUERY_LIMIT' | 'REQUEST_DENIED' | 'INVALID_REQUEST';
}

interface GeocodeResult {
  lat?: number;
  lng?: number;
  placeId?: string;
  confidence: 'high' | 'medium' | 'low' | 'failed';
  geocodedAt: Date;
}

// Map Google location_type to our confidence levels
function mapLocationTypeToConfidence(locationType: string): 'high' | 'medium' | 'low' {
  switch (locationType) {
    case 'ROOFTOP':
      return 'high';
    case 'RANGE_INTERPOLATED':
      return 'medium';
    case 'GEOMETRIC_CENTER':
    case 'APPROXIMATE':
      return 'low';
    default:
      return 'low';
  }
}

// Check geocode cache for existing result
export async function getGeocodeCacheResult(formattedAddress: string): Promise<GeocodeResult | null> {
  try {
    const collection = await getCollection<GeocodeCacheDocument>('geocodeCache');
    const cached = await collection.findOne({ formattedAddress });
    
    if (cached) {
      return {
        lat: cached.lat,
        lng: cached.lng,
        placeId: cached.placeId,
        confidence: cached.confidence as 'high' | 'medium' | 'low' | 'failed',
        geocodedAt: cached.cachedAt
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error checking geocode cache:', error);
    return null;
  }
}

// Save result to geocode cache
export async function saveGeocodeCacheResult(
  formattedAddress: string, 
  result: GeocodeResult
): Promise<void> {
  try {
    const collection = await getCollection<GeocodeCacheDocument>('geocodeCache');
    
    await collection.updateOne(
      { formattedAddress },
      {
        $set: {
          formattedAddress,
          lat: result.lat || 0,
          lng: result.lng || 0,
          placeId: result.placeId || '',
          confidence: result.confidence,
          cachedAt: result.geocodedAt
        }
      },
      { upsert: true }
    );
  } catch (error) {
    console.error('Error saving to geocode cache:', error);
  }
}

// Call Google Geocoding API
async function callGoogleGeocodingAPI(address: string): Promise<GeocodeResult> {
  const apiKey = process.env.GOOGLE_GEOCODING_API_KEY;
  if (!apiKey) {
    throw new Error('Google Geocoding API key not found');
  }

  // Append ", Australia" if not already present
  const searchAddress = address.includes('Australia') ? address : `${address}, Australia`;
  
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchAddress)}&key=${apiKey}`;
    const response = await fetch(url);
    const data: GoogleGeocodingResult = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const result = data.results[0];
      const confidence = mapLocationTypeToConfidence(result.geometry.location_type);
      
      return {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        placeId: result.place_id,
        confidence,
        geocodedAt: new Date()
      };
    } else {
      // No results or API error
      return {
        confidence: 'failed',
        geocodedAt: new Date()
      };
    }
  } catch (error) {
    console.error('Google Geocoding API error:', error);
    return {
      confidence: 'failed',
      geocodedAt: new Date()
    };
  }
}

// Rate-limited geocoding with batch processing
export async function geocodeAddressBatch(addresses: string[]): Promise<GeocodeResult[]> {
  const results: GeocodeResult[] = [];
  
  // Process in batches of 10 with 100ms delay between batches
  const batchSize = 10;
  const batchDelay = 100; // ms
  
  for (let i = 0; i < addresses.length; i += batchSize) {
    const batch = addresses.slice(i, i + batchSize);
    console.log(`Processing geocoding batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(addresses.length / batchSize)}`);
    
    // Process batch concurrently
    const batchPromises = batch.map(async (address) => {
      // Check cache first
      const cached = await getGeocodeCacheResult(address);
      if (cached) {
        return cached;
      }
      
      // Not in cache, call API
      const result = await callGoogleGeocodingAPI(address);
      
      // Save to cache
      await saveGeocodeCacheResult(address, result);
      
      return result;
    });
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    
    // Delay before next batch (except for last batch)
    if (i + batchSize < addresses.length) {
      await new Promise(resolve => setTimeout(resolve, batchDelay));
    }
  }
  
  return results;
}

// Single address geocoding (checks cache first)
export async function geocodeAddress(formattedAddress: string): Promise<GeocodeResult> {
  // Check cache first
  const cached = await getGeocodeCacheResult(formattedAddress);
  if (cached) {
    return cached;
  }
  
  // Not in cache, call API
  const result = await callGoogleGeocodingAPI(formattedAddress);
  
  // Save to cache
  await saveGeocodeCacheResult(formattedAddress, result);
  
  return result;
}

// Log geocoding issues
export async function logGeocodingIssue(
  importBatch: string,
  rowNumber: number,
  rawAddress: string,
  issueType: 'geocode_failed' | 'geocode_low_confidence',
  detail: string
): Promise<void> {
  try {
    const collection = await getCollection<ImportIssueDocument>('importIssues');
    
    await collection.insertOne({
      importBatch,
      rowNumber,
      rawAddress,
      issueType,
      detail
    });
  } catch (error) {
    console.error('Error logging geocoding issue:', error);
  }
}