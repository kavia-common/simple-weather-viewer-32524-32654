import React from 'react';

// Helper: convert degrees to compass direction (e.g., N, NE, E, ...)
function degToCompass(deg) {
  if (typeof deg !== 'number' || Number.isNaN(deg)) return '';
  const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
  const idx = Math.round(((deg % 360) / 22.5)) % 16;
  return dirs[idx];
}

// Helper: format unix seconds to local time for the searched city using timezone offset (seconds)
function formatLocalTime(unixSeconds, tzOffsetSec, locale = undefined) {
  if (!unixSeconds || typeof tzOffsetSec !== 'number') return '';
  // Compose a Date from utc ms + tz offset in ms, then format as time in that "shifted" date.
  const localMs = (unixSeconds + tzOffsetSec) * 1000;
  const d = new Date(localMs);
  return d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
}

// PUBLIC_INTERFACE
export default function WeatherCard({ data, units }) {
  /**
   * WeatherCard displays city, country, temperature, feels like, condition, and detailed metrics.
   * Detailed metrics:
   *  - Humidity (%)
   *  - Wind speed with unit (m/s for metric, mph for imperial) and direction (compass)
   *  - Sunrise/Sunset times formatted to the city's local time
   * Props:
   * - data: OpenWeatherMap response object
   * - units: 'metric' | 'imperial'
   */
  if (!data) return null;

  const city = data.name;
  const country = data.sys?.country ?? '';
  const temp = typeof data.main?.temp === 'number' ? Math.round(data.main.temp) : null;
  const feels = typeof data.main?.feels_like === 'number' ? Math.round(data.main.feels_like) : null;
  const condition = data.weather?.[0]?.main ?? '';
  const description = data.weather?.[0]?.description ?? '';
  const humidity = typeof data.main?.humidity === 'number' ? data.main.humidity : null;
  const windSpeed = typeof data.wind?.speed === 'number' ? data.wind.speed : null;
  const windDeg = typeof data.wind?.deg === 'number' ? data.wind.deg : null;
  const icon = data.weather?.[0]?.icon;

  const sunrise = data.sys?.sunrise; // unix seconds
  const sunset = data.sys?.sunset;   // unix seconds
  const tzOffsetSec = typeof data.timezone === 'number' ? data.timezone : 0; // seconds from UTC for the city

  const tempUnit = units === 'metric' ? '°C' : '°F';
  const windUnit = units === 'metric' ? 'm/s' : 'mph';

  const iconUrl = icon ? `https://openweathermap.org/img/wn/${icon}@2x.png` : '';

  const windDir = windDeg != null ? degToCompass(windDeg) : '';
  const sunriseText = sunrise ? formatLocalTime(sunrise, tzOffsetSec) : '';
  const sunsetText = sunset ? formatLocalTime(sunset, tzOffsetSec) : '';

  // Compose wind display with graceful fallbacks
  let windDisplay = '—';
  if (windSpeed != null) {
    const rounded = Math.round(windSpeed);
    windDisplay = `${rounded} ${windUnit}${windDir ? ` ${windDir}` : ''}`;
  }

  return (
    <div className="weather-card" role="region" aria-label="Weather result">
      <div className="weather-card__header">
        <div className="weather-card__title">
          <h2>{city}</h2>
          {country && <span className="weather-card__country">{country}</span>}
        </div>
        {iconUrl ? (
          <img className="weather-card__icon" src={iconUrl} alt={description || condition} />
        ) : null}
      </div>

      <div className="weather-card__content">
        <div className="weather-card__temp">
          <span className="value">{temp != null ? temp : '—'}</span>
          <span className="unit">{tempUnit}</span>
        </div>
        <div className="weather-card__meta">
          <div className="meta-item">
            <span className="label">Feels like</span>
            <span className="value">
              {feels != null ? `${feels}${tempUnit}` : '—'}
            </span>
          </div>
          <div className="meta-item">
            <span className="label">Condition</span>
            <span className="value">{condition || '—'}</span>
          </div>
          <div className="meta-item">
            <span className="label">Humidity</span>
            <span className="value">{humidity != null ? `${humidity}%` : '—'}</span>
          </div>
          <div className="meta-item">
            <span className="label">Wind</span>
            <span className="value">{windDisplay}</span>
          </div>

          {/* Details row: Sunrise / Sunset */}
          <div className="meta-item">
            <span className="label">Sunrise</span>
            <span className="value">{sunriseText || '—'}</span>
          </div>
          <div className="meta-item">
            <span className="label">Sunset</span>
            <span className="value">{sunsetText || '—'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
