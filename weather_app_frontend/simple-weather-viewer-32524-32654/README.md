# simple-weather-viewer-32524-32654

This workspace contains the weather_app_frontend container (React CRA) for a simple weather viewer app using the Ocean Professional theme.

## Quick Start

1) Navigate to the frontend:
```bash
cd weather_app_frontend
```

2) Install dependencies:
```bash
npm install
```

3) Configure your OpenWeatherMap API key:
```bash
cp .env.example .env
# edit .env and set REACT_APP_WEATHER_API_KEY=your_key_here
```

4) Run the app:
```bash
npm start
```

Visit http://localhost:3000

## Notes
- The API client reads `REACT_APP_WEATHER_API_KEY` (CRA). It also supports `VITE_WEATHER_API_KEY` if you migrate to Vite.
- If the API key is missing, the app still renders and shows a dismissible setup banner; searches will return a friendly error.
