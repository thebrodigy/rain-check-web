'use client';

import { useState, useRef, useEffect } from 'react';
import { getPrediction, type PredictionResponse } from '@/lib/api';
import RainCanvas from './components/RainCanvas';

const SUGGESTIONS = ['Manila', 'Laguna', 'Cebu', 'Rizal', 'Quezon City', 'Batangas'];

type WeatherTheme = 'default' | 'clear' | 'overcast' | 'rainy' | 'storm';

interface ThemeInfo {
  key: WeatherTheme;
  label: string;
  icon: string;
  verdict: (willRain: boolean) => string;
  advice: string;
}

function getThemeInfo(chance: number, willRain: boolean): ThemeInfo {
    if (chance <= 5) return {
    key: 'clear',
    label: 'Very Low Chance of Rain',
    icon: '☀️',
    verdict: () => 'All Clear Today',
    advice: '☀️ Leave the umbrella at home — it\'s going to be a beautiful day.',
  };
  if (chance <= 20) return {
    key: 'clear',
    label: 'Low Chance of Rain',
    icon: '☀️',
    verdict: () => 'Mostly Dry Skies',
    advice: '☀️ Enjoy the sunshine while it lasts.',
  };
  if (chance <= 50) return {
    key: 'overcast',
    label: 'Clouds Rolling In',
    icon: '⛅',
    verdict: () => willRain ? 'Light Rain Possible' : 'Mostly Dry',
    advice: '⛅ Keep an umbrella handy, just in case — you might get a light drizzle later.',
  };
  if (chance <= 75) return {
    key: 'rainy',
    label: 'Rain Likely',
    icon: '🌧️',
    verdict: () => 'Bring an Umbrella',
    advice: '🌂 Rain is coming. Pack an umbrella — you\'ll be glad you did.',
  };
  return {
    key: 'storm',
    label: 'High Chance of Rain',
    icon: '⛈️',
    verdict: () => 'Downpour Ahead',
    advice: '⛈️ Time to stay dry or get soaked.',
  };
}

export default function HomePage() {
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [barWidth, setBarWidth] = useState(0);
  const [theme, setTheme] = useState<WeatherTheme>('default');
  const [displayChance, setDisplayChance] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.body.setAttribute('data-weather', theme);
  }, [theme]);

  const handleSearch = async (loc?: string) => {
    const query = (loc ?? location).trim();
    if (!query) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setBarWidth(0);

    try {
      const data = await getPrediction(query);
      const chance = Number(data.chanceOfRain);
      const info = getThemeInfo(chance, data.willRain);

      setResult(data);
      setDisplayChance(chance);
      setTheme(info.key);
      setTimeout(() => setBarWidth(chance), 80);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  useEffect(() => { inputRef.current?.focus(); }, []);

  const chanceNum = result ? Number(result.chanceOfRain) : 0;
  const themeInfo = result ? getThemeInfo(chanceNum, result.willRain) : null;

  return (
    <>
      <div className="bg-mesh" />
      <RainCanvas chance={displayChance} />

      <div className="page-wrapper">
        <header className="header">
          <div className="logo-row">
            <span className="logo-icon">☂️</span>
          </div>
          <h1>Rain Check</h1>
          <p className="tagline">Should you carry an umbrella today?</p>

          {themeInfo && (
            <div className="weather-badge">
              <span>{themeInfo.icon}</span>
              {themeInfo.label}
            </div>
          )}
        </header>

        <div className="search-card">
          <p className="search-label">Enter your location</p>
          <div className="search-row">
            <input
              ref={inputRef}
              type="text"
              className="search-input"
              placeholder="e.g. Manila, Laguna, Cebu…"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              className="search-btn"
              onClick={() => handleSearch()}
              disabled={loading || !location.trim()}
            >
              {loading ? 'Checking…' : 'Check Rain'}
            </button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                className="pill-btn"
                onClick={() => { setLocation(s); handleSearch(s); }}
                disabled={loading}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="loader">
            <div className="spinner" />
            Checking weather conditions… (Server may take ~60 seconds to wake up if it's asleep)
          </div>
        )}

        {error && (
          <div className="error-box">⚠️ {error}</div>
        )}

        {result && themeInfo && !loading && (
          <div className="result-card">
            <div className="result-banner">
              <div className="result-icon">{themeInfo.icon}</div>
              <div className="result-headline">
                <p className="result-location">📍 {result.location}</p>
                <p className="result-verdict">{themeInfo.verdict(result.willRain)}</p>
              </div>
            </div>

            <div className="result-body">
              <div className="chance-row">
                <span className="chance-label">Chance of Rain</span>
                <span className="chance-value">{result.chanceOfRain}%</span>
              </div>

              <div className="chance-bar-track">
                <div className="chance-bar-fill" style={{ width: `${barWidth}%` }} />
              </div>

              <div className="advice-row">{themeInfo.advice}</div>
            </div>
          </div>
        )}

        <footer className="footer">
          <p>Powered by <a href="https://www.weatherapi.com" target="_blank" rel="noreferrer">WeatherAPI.com</a> · Built with Next.js &amp; Spring Boot · <a href="https://github.com/thebrodigy/rain-check-web" target="_blank" rel="noopener noreferrer"style={{ textDecoration: 'underline' }}>Github ↗</a></p>
        </footer>
      </div>
    </>
  );
}
