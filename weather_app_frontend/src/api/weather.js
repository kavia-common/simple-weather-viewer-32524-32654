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
