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
   * Handles loading, error, and missing API key states. Supports unit toggle °C/°F and theme toggle light/dark.
   */
  const [units, setUnits] = useState(() => {
    // Initialize from localStorage to persist across reloads; default to 'metric'
    try {
      const saved = window.localStorage.getItem('units');
      return saved === 'imperial' ? 'imperial' : 'metric';
    } catch {
      return 'metric';
    }
  });

  const [themeMode, setThemeMode] = useState(() => {
    // Initialize theme from localStorage, default to 'light'
    try {
      const saved = window.localStorage.getItem('themeMode');
      return saved === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showKeyBanner, setShowKeyBanner] = useState(() => !getWeatherApiKey());

  useEffect(() => {
    // Persist unit changes across sessions
    try {
      window.localStorage.setItem('units', units);
    } catch {
      // ignore storage errors (e.g., privacy mode)
    }
  }, [units]);

  useEffect(() => {
    // Persist theme choice and reflect it on the root element for CSS variables
    try {
      window.localStorage.setItem('themeMode', themeMode);
    } catch {
      // ignore storage errors
    }
    // Apply to documentElement so all CSS can target [data-theme="dark"]
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', themeMode);
    }
  }, [themeMode]);

  const gradientStyle = useMemo(() => {
    // Use subtle gradients per theme
    const isDark = themeMode === 'dark';
    const bg = isDark
      ? 'linear-gradient(180deg, rgba(59,130,246,0.10) 0%, rgba(2,6,23,1) 100%)'
      : 'linear-gradient(180deg, rgba(59,130,246,0.10) 0%, rgba(249,250,251,1) 100%)';
    return {
      background: bg,
      minHeight: '100vh',
    };
  }, [themeMode]);

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
      // optional soft log
    }
  };

  const toggleUnits = () => {
    setUnits((u) => (u === 'metric' ? 'imperial' : 'metric'));
    if (query) {
      // refetch for current query
      handleSearch(query);
    }
  };

  const toggleTheme = () => {
    setThemeMode((m) => (m === 'light' ? 'dark' : 'light'));
  };

  const themeIcon = themeMode === 'dark' ? '☾' : '☀';
  const themeLabel = themeMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <div className="app-root" style={gradientStyle}>
      <div className="container">
        <header className="topbar" role="banner">
          <h1 className="brand">
            <span className="brand-dot" />
            Ocean Weather
          </h1>
          <div className="actions" style={{ display: 'flex', gap: 8 }}>
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={themeLabel}
              title={themeLabel}
            >
              {themeIcon}
            </button>
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
