# Simple Weather Viewer (Ocean Professional)

A modern, minimalist weather app to search a city and view current conditions. Built with React (CRA) and a custom Ocean Professional theme.

## Features

- Centered search bar with smooth interactions
- Current weather via OpenWeatherMap: city, country, temperature, feels like, condition, and icon
- Detailed metrics: humidity (%), wind speed with unit (m/s for metric, mph for imperial) and compass direction, sunrise/sunset in the searched city's local time
- 5-day forecast with daily min/max and representative condition/icon
- Unit toggle (°C/°F) with session persistence
- Dark Mode toggle (Light/Dark) with persistence
- Loading and friendly error states
- Ocean Professional theme with subtle gradient background, rounded corners, and shadows
- Graceful handling of missing API key with a dismissible banner

## Getting Started

1) Install dependencies:
```bash
npm install
```

2) Set your OpenWeatherMap API key:
- Copy `.env.example` to `.env` and set the value:
```bash
cp .env.example .env
# edit .env and set REACT_APP_WEATHER_API_KEY
```

This CRA project reads `REACT_APP_WEATHER_API_KEY`. The code also supports Vite (`VITE_WEATHER_API_KEY`) if you migrate in the future.

3) Run the app:
```bash
npm start
```
Open http://localhost:3000 in your browser.

## Environment Variables

- REACT_APP_WEATHER_API_KEY: Your OpenWeatherMap API key (required for real data)
- (Optional) VITE_WEATHER_API_KEY: Supported by the API client if using Vite

If the API key is missing, the UI will still render and show a setup banner. Searches will return a friendly error.

## Project Structure

- `src/api/weather.js` — API client and env key detection
- `src/components/SearchBar.jsx` — Search input and submit
- `src/components/WeatherCard.jsx` — Results card UI
- `src/theme.js` — Theme tokens
- `src/App.js` — Main app wiring
- `src/index.css` — Global and component styles

## Notes

- API (current): https://api.openweathermap.org/data/2.5/weather
- API (5-day forecast): https://api.openweathermap.org/data/2.5/forecast
- Units: metric (°C, m/s) or imperial (°F, mph)
- This app does not use accounts or save locations.

### Preferences
- The selected temperature unit (°C/°F) is persisted across reloads using localStorage.
- The selected theme mode (light/dark) is persisted across reloads using localStorage.
- On first load (or if nothing is saved), the app defaults to metric (°C) and light mode.

### Dark Mode
- Toggle the sun/moon icon in the top-right to switch between themes.
- The theme system uses CSS variables on the root with `[data-theme="dark"]` and smooth transitions.
- Dark variants are applied for background, surface, text, muted text, card borders, and gradients to maintain accessible contrast.
