import React from 'react';

// PUBLIC_INTERFACE
export default function WeatherCard({ data, units }) {
  /**
   * WeatherCard displays city, country, temperature, feels like, condition, humidity, wind, and icon.
   * Props:
   * - data: OpenWeatherMap response object
   * - units: 'metric' | 'imperial'
   */
  if (!data) return null;

  const city = data.name;
  const country = data.sys?.country ?? '';
  const temp = Math.round(data.main?.temp);
  const feels = Math.round(data.main?.feels_like);
  const condition = data.weather?.[0]?.main ?? '';
  const description = data.weather?.[0]?.description ?? '';
  const humidity = data.main?.humidity;
  const wind = data.wind?.speed;
  const icon = data.weather?.[0]?.icon;

  const tempUnit = units === 'metric' ? '°C' : '°F';
  const windUnit = units === 'metric' ? 'm/s' : 'mph';

  const iconUrl = icon ? `https://openweathermap.org/img/wn/${icon}@2x.png` : '';

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
          <span className="value">{temp}</span>
          <span className="unit">{tempUnit}</span>
        </div>
        <div className="weather-card__meta">
          <div className="meta-item">
            <span className="label">Feels like</span>
            <span className="value">{feels}{tempUnit}</span>
          </div>
          <div className="meta-item">
            <span className="label">Condition</span>
            <span className="value">{condition}</span>
          </div>
          <div className="meta-item">
            <span className="label">Humidity</span>
            <span className="value">{humidity}%</span>
          </div>
          <div className="meta-item">
            <span className="label">Wind</span>
            <span className="value">{wind} {windUnit}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
