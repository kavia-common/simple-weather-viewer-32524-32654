import React from 'react';

// PUBLIC_INTERFACE
export default function ForecastCard({ days, units }) {
  /**
   * ForecastCard renders a horizontal list of 5 daily forecast summaries.
   * Props:
   * - days: Array<{ day: string, dateISO: string, min: number, max: number, icon: string, main: string, description: string }>
   * - units: 'metric' | 'imperial'
   */
  if (!Array.isArray(days) || days.length === 0) return null;

  const tempUnit = units === 'metric' ? '°C' : '°F';

  return (
    <div className="forecast-card" role="region" aria-label="5-day forecast">
      <div className="forecast-card__header">
        <h3 className="forecast-card__title">5-Day Forecast</h3>
      </div>
      <div className="forecast-card__grid">
        {days.map((d) => {
          const iconUrl = d.icon ? `https://openweathermap.org/img/wn/${d.icon}@2x.png` : '';
          return (
            <div key={d.dateISO} className="forecast-item" aria-label={`${d.day} forecast`}>
              <div className="forecast-item__day">{d.day}</div>
              {iconUrl ? (
                <img className="forecast-item__icon" src={iconUrl} alt={d.description || d.main} />
              ) : (
                <div className="forecast-item__icon--placeholder" aria-hidden />
              )}
              <div className="forecast-item__temps">
                <span className="max">{d.max}{tempUnit}</span>
                <span className="min">{d.min}{tempUnit}</span>
              </div>
              <div className="forecast-item__cond" title={d.description || d.main}>
                {d.main}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
