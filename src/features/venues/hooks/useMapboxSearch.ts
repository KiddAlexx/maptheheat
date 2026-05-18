import { useRef, useState } from 'react';
import toast from 'react-hot-toast';

export interface MapboxFeature {
  place_name: string;
  place_type: string[]; // e.g. ['poi'] or ['address'] — used to detect business vs street result
  text: string;
  address?: string;
  geometry: { coordinates: [number, number] }; // [lon, lat] — GeoJSON order, reversed from our { lat, lon } Coords type
  context?: Array<{ id: string; text: string }>;
  properties?: { tel?: string };
}

export function useMapboxSearch() {
  const [suggestions, setSuggestions] = useState<MapboxFeature[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  // Ref holds the debounce timer so it persists across renders without triggering re-renders
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>();
  const token = import.meta.env.VITE_MAPBOX_TOKEN;

  // Waits 200ms after the user stops typing before fetching — avoids hammering the API
  // on every keystroke. Minimum 3 chars to avoid overly broad results.
  // Old suggestions stay visible while waiting so the dropdown doesn't flash empty.
  function search(query: string) {
    clearTimeout(debounceTimer.current);
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }
    debounceTimer.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json` +
            `?access_token=${token}&types=poi,address&autocomplete=true&limit=5&language=en`
        );
        if (!res.ok) throw new Error();
        const data = await res.json();
        setSuggestions(data.features ?? []);
      } catch {
        toast.error('Address search unavailable — please try again or enter the address manually');
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 200);
  }

  // Address features don't carry city-level geometry — a separate call with types=place
  // is needed to get a city center point for the unique_cities table.
  async function fetchCityCoords(
    city: string,
    country: string
  ): Promise<{ lat: number; lon: number }> {
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(`${city},${country}`)}.json` +
        `?access_token=${token}&types=place&limit=1&language=en`
    );
    const data = await res.json();
    const [lon, lat] = data.features?.[0]?.geometry?.coordinates ?? [0, 0];
    return { lat, lon };
  }

  return { suggestions, isLoading, search, fetchCityCoords };
}
