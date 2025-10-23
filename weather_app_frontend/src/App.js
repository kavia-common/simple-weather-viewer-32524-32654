import React, { useEffect, useMemo, useState } from 'react';
import './index.css';
import './App.css';
import { theme } from './theme';
import SearchBar from './components/SearchBar';
import WeatherCard from './components/WeatherCard';
import ForecastCard from './components/ForecastCard';
import { fetchCurrentWeather, fetchFiveDayForecast, getWeatherApiKey } from './api/weather';

// PUBLIC_INTERFACE
export default function App() {
  /**
   * Main app entrypoint. Renders a centered search bar and weather result card.
   * Handles loading, error, and missing API key states. Supports unit toggle °C/°F.
   */
  const [units, setUnits] = useState(() => {
    // Persist during session only
    return sessionStorage.getItem('units') || 'metric';
  });
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showKeyBanner, setShowKeyBanner] = useState(() => !getWeatherApiKey());

  useEffect(() => {
    sessionStorage.setItem('units', units);
  }, [units]);

  const gradientStyle = useMemo(
    () => ({
      background:
        'linear-gradient(180deg, rgba(59,130,246,0.10) 0%, rgba(249,250,251,1) 100%)',
      minHeight: '100vh',
    }),
    []
  );

  const handleSearch = async (city) => {
    setQuery(city);
    setLoading(true);
    setErrorMsg('');
    setResult(null);
    setForecast(null);

    // Fetch current and forecast in parallel
    const [currentRes, forecastRes] = await Promise.all([
      fetchCurrentWeather(city, units),
      fetchFiveDayForecast(city, units),
    ]);

    setLoading(false);

    if (!currentRes.ok) {
      setErrorMsg(currentRes.error || 'Something went wrong.');
      return;
    }
    setResult(currentRes.data);

    if (forecastRes.ok) {
      setForecast(forecastRes.data);
    } else {
      // Do not block; attach a soft message if useful
      // Optionally, we could show a compact warning in UI; for now, keep silent and log
      // console.warn('Forecast unavailable:', forecastRes.error);
    }
  };

  const toggleUnits = () => {
    setUnits((u) => (u === 'metric' ? 'imperial' : 'metric'));
    // if there is a current query, refetch
    if (query) {
      // fire and forget (not awaiting to keep UI snappy)
      handleSearch(query);
    }
  };

  return (
    <div className="app-root" style={gradientStyle}>
      <div className="container">
        <header className="topbar" role="banner">
          <h1 className="brand">
            <span className="brand-dot" />
            Ocean Weather
          </h1>
          <div className="actions">
            <button
              className="unit-toggle"
              onClick={toggleUnits}
              aria-label="Toggle units"
              title="Toggle units"
            >
              {units === 'metric' ? '°C / °F' : '°F / °C'}
            </button>
          </div>
        </header>

        {showKeyBanner && (
          <div className="banner banner--warn" role="alert">
            <div>
              Missing API key. Set REACT_APP_WEATHER_API_KEY (CRA) or VITE_WEATHER_API_KEY (Vite)
              in a .env file and restart the dev server.
            </div>
            <button
              className="banner__dismiss"
              onClick={() => setShowKeyBanner(false)}
              aria-label="Dismiss"
              title="Dismiss"
            >
              ✕
            </button>
          </div>
        )}

        <main className="main">
          <SearchBar onSearch={handleSearch} disabled={loading} />

          <section className="results">
            {loading && (
              <div className="loading">
                <div className="spinner" aria-hidden />
                <span>Fetching weather...</span>
              </div>
            )}

            {errorMsg && !loading && (
              <div className="error">
                <span role="img" aria-label="error">
                  ⚠️
                </span>{' '}
                {errorMsg}
              </div>
            )}

            {!loading && !errorMsg && result && (
              <>
                <WeatherCard data={result} units={units} />
                {forecast?.days?.length ? (
                  <div style={{ marginTop: 16 }}>
                    <ForecastCard days={forecast.days} units={units} />
                  </div>
                ) : null}
              </>
            )}
          </section>
        </main>

        <footer className="footer">
          <span className="hint">
            Powered by <a href="https://openweathermap.org/api" target="_blank" rel="noreferrer">OpenWeatherMap</a>
          </span>
        </footer>
      </div>
    </div>
  );
}
