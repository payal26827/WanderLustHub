async function geocodeAddress(address) {
  if (!process.env.MAPBOX_TOKEN) {
    throw new Error("MAPBOX_TOKEN is missing");
  }

  const url =
    "https://api.mapbox.com/search/geocode/v6/forward" +
    `?q=${encodeURIComponent(address)}` +
    `&limit=1&access_token=${encodeURIComponent(process.env.MAPBOX_TOKEN)}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Mapbox geocoding request failed");
  }

  const data = await response.json();
  const feature = data.features?.[0];

  if (!feature) {
    throw new Error("Location could not be found. Try a more specific address.");
  }

  return {
    type: "Point",
    coordinates: feature.geometry.coordinates
  };
}

module.exports = { geocodeAddress };
