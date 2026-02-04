// Next.js API route: /api/places-search
// Receives a query string, calls Google Places API, returns top business suggestions


export async function GET(req: Request) {
  const { searchParams } = new URL(req.url!);
  const query = searchParams.get('q');
  if (!query) {
    return new Response(JSON.stringify({ error: 'Missing query' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Missing Google Places API key' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    // Log the full response for debugging
    console.log('Google Places API response:', JSON.stringify(data, null, 2));
    if (data.error_message) {
      console.error('Google Places API error:', data.error_message);
    }
    if (!data.results) {
      return new Response(JSON.stringify({ suggestions: [], debug: data }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    const suggestions = data.results.slice(0, 5).map((place: any) => ({
      name: place.name,
      address: place.formatted_address,
      place_id: place.place_id,
      types: place.types,
    }));
    return new Response(JSON.stringify({ suggestions, debug: data }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('Fetch error:', err);
    return new Response(JSON.stringify({ error: 'Failed to fetch from Google Places', debug: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
