/**
 * Geocoding utility using OpenStreetMap Nominatim (free, no API key required)
 * https://nominatim.org/release-docs/develop/api/Search/
 */

export interface GeocodingResult {
  address: string;
  lat: number;
  lon: number;
  displayName: string;
}

/**
 * Look up an address from a location name using OpenStreetMap Nominatim
 * Free API - just need to follow usage policy (1 req/sec, include User-Agent)
 */
export async function geocodeLocation(
  locationName: string,
  hint?: string // Optional city/state hint to improve accuracy
): Promise<GeocodingResult | null> {
  const query = hint ? `${locationName}, ${hint}` : locationName;
  const encodedQuery = encodeURIComponent(query);

  const url = `https://nominatim.openstreetmap.org/search?q=${encodedQuery}&format=json&addressdetails=1&limit=1`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "SummerCampPlanner/1.0 (camp planning app)",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      console.error(`[Geocoder] HTTP error: ${response.status}`);
      return null;
    }

    const results = await response.json();

    if (!results || results.length === 0) {
      console.log(`[Geocoder] No results for: ${query}`);
      return null;
    }

    const result = results[0];
    const addr = result.address || {};

    // Build a clean address string
    const addressParts = [
      addr.house_number,
      addr.road,
      addr.city || addr.town || addr.village,
      addr.state,
      addr.postcode,
    ].filter(Boolean);

    return {
      address: addressParts.join(", ") || result.display_name,
      lat: parseFloat(result.lat),
      lon: parseFloat(result.lon),
      displayName: result.display_name,
    };
  } catch (error) {
    console.error(`[Geocoder] Error:`, error);
    return null;
  }
}

/**
 * Enhance camp data with geocoded address
 */
export async function enhanceWithAddress(
  locationName: string,
  existingAddress?: string
): Promise<string | undefined> {
  // If we already have a proper address (with numbers), keep it
  if (existingAddress && /\d+/.test(existingAddress) && existingAddress.length < 100) {
    return existingAddress;
  }

  // Try to geocode the location name
  const result = await geocodeLocation(locationName);
  if (result) {
    console.log(`[Geocoder] Found address for "${locationName}": ${result.address}`);
    return result.address;
  }

  return existingAddress;
}
