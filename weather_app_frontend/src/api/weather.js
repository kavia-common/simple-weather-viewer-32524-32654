//
// Weather API client for OpenWeatherMap
//

const VITE_KEY = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_WEATHER_API_KEY : undefined;
// CRA-style env var support
const CRA_KEY = process.env.REACT_APP_WEATHER_API_KEY;

// PUBLIC_INTERFACE
export function getWeatherApiKey() {
  /**
   * Return the API key from environment variables.
   * Prefer Vite-style VITE_WEATHER_API_KEY if available; otherwise use CRA-style REACT_APP_WEATHER_API_KEY.
   */
  return VITE_KEY || CRA_KEY || '';
}

/**
 * Internal: Summarize a day's worth of 3-hour forecast slices.
 * Computes min/max temps and picks a representative icon/condition by mode and midday preference.
 */
function summarizeDay(daySlices = []) {
  if (!daySlices.length) return null;
  const temps = daySlices.map((s) => s.main?.temp).filter((t) => typeof t === 'number');
  const min = Math.round(Math.min(...temps));
  const max = Math.round(Math.max(...temps));

  // Prefer a slice around 12:00-15:00 local; else pick the most frequent weather main
  const midday = daySlices.find((s) => {
    const h = new Date(s.dt * 1000).getHours();
    return h >= 12 && h <= 15;
  }) || daySlices[0];

  // Fallback to mode of main
  let rep = midday;
  if (!rep?.weather?.[0]) {
    const freq = {};
    daySlices.forEach((s) => {
      const k = s.weather?.[0]?.main || 'Unknown';
      freq[k] = (freq[k] || 0) + 1;
    });
    const top = Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown';
    rep = daySlices.find((s) => (s.weather?.[0]?.main || 'Unknown') === top) || daySlices[0];
  }

  const icon = rep?.weather?.[0]?.icon || '';
  const main = rep?.weather?.[0]?.main || '';
  const description = rep?.weather?.[0]?.description || '';

  // Day name from first slice
  const date = new Date(daySlices[0].dt * 1000);
  const dayName = date.toLocaleDateString(undefined, { weekday: 'short' });

  return { day: dayName, dateISO: date.toISOString().slice(0, 10), min, max, icon, main, description };
}

// PUBLIC_INTERFACE
export async function fetchCurrentWeather(city, units = 'metric') {
  /**
   * Fetch current weather by city name using OpenWeatherMap API.
   * Params:
   *  - city: string, required city name
   *  - units: 'metric' | 'imperial'
   * Returns:
   *  - { ok: boolean, data?: object, error?: string, status?: number }
   */
  const apiKey = getWeatherApiKey();

  if (!apiKey) {
    return {
      ok: false,
      status: 400,
      error:
        'Missing API key. Please set REACT_APP_WEATHER_API_KEY (CRA) or VITE_WEATHER_API_KEY (Vite) in your environment.',
    };
  }

  const params = new URLSearchParams({
    q: city,
    units,
    appid: apiKey,
  });

  const url = `https://api.openweathermap.org/data/2.5/weather?${params.toString()}`;

  try {
    const res = await fetch(url);
    const json = await res.json();
    if (!res.ok) {
      const message =
        json?.message ? `Error: ${json.message}` : 'Failed to fetch weather data.';
      return { ok: false, status: res.status, error: message };
    }
    return { ok: true, data: json };
  } catch (e) {
    return {
      ok: false,
      status: 0,
      error: 'Network error. Please check your connection and try again.',
    };
  }
}

// PUBLIC_INTERFACE
export async function fetchFiveDayForecast(city, units = 'metric') {
  /**
   * Fetch 5-day/3-hour forecast by city name and compute daily summaries (next 5 days).
   * Params:
   *  - city: string
   *  - units: 'metric' | 'imperial'
   * Returns:
   *  - { ok: boolean, data?: { city: object, days: Array<{day, dateISO, min, max, icon, main, description}> }, error?: string }
   */
  const apiKey = getWeatherApiKey();
  if (!apiKey) {
    return {
      ok: false,
      status: 400,
      error:
        'Missing API key. Please set REACT_APP_WEATHER_API_KEY (CRA) or VITE_WEATHER_API_KEY (Vite) in your environment.',
    };
  }

  const params = new URLSearchParams({
    q: city,
    units,
    appid: apiKey,
  });
  const url = `https://api.openweathermap.org/data/2.5/forecast?${params.toString()}`;

  try {
    const res = await fetch(url);
    const json = await res.json();
    if (!res.ok) {
      const message = json?.message ? `Error: ${json.message}` : 'Failed to fetch forecast.';
      return { ok: false, status: res.status, error: message };
    }

    // Group by date (local timestamps returned by API include dt + city.timezone for correct local grouping if needed).
    const byDate = {};
    (json.list || []).forEach((item) => {
      const d = new Date(item.dt * 1000);
      const key = d.toISOString().slice(0, 10); // ISO date (UTC); acceptable approximation for UI summary
      if (!byDate[key]) byDate[key] = [];
      byDate[key].push(item);
    });

    const summaries = Object.keys(byDate)
      .sort()
      .map((k) => summarizeDay(byDate[k]))
      .filter(Boolean)
      .slice(0, 5);

    return { ok: true, data: { city: json.city, days: summaries } };
  } catch (e) {
    return {
      ok: false,
      status: 0,
      error: 'Network error. Please check your connection and try again.',
    };
  }
}
