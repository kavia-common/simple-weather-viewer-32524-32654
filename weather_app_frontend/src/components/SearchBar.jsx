import { useState } from 'react';

// PUBLIC_INTERFACE
export default function SearchBar({ onSearch, disabled }) {
  /** Search bar with input and submit button.
   * Props:
   * - onSearch: function(query: string)
   * - disabled: boolean (disables input + button)
   */
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      onSearch(trimmed);
    }
  };

  return (
    <form className="searchbar" onSubmit={handleSubmit} role="search" aria-label="Search city weather">
      <div className="searchbar__inner">
        <input
          type="text"
          placeholder="Search city (e.g., London)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={disabled}
          aria-label="City name"
        />
        <button type="submit" disabled={disabled || !query.trim()} aria-label="Search">
          Search
        </button>
      </div>
    </form>
  );
}
