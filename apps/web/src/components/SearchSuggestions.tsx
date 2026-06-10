import { useEffect, useRef, useState } from "react";

const DEMO_CITIES = [
  "Hyderabad",
  "London",
  "Tokyo",
  "New York",
  "Paris",
  "Mumbai",
  "Sydney",
  "Berlin",
  "Singapore",
  "Dubai",
];

interface SearchSuggestionsProps {
  query: string;
  onSelect: (city: string) => void;
  visible: boolean;
}

export function SearchSuggestions({
  query,
  onSelect,
  visible,
}: SearchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  useEffect(() => {
    if (!visible || !query.trim()) {
      setSuggestions([]);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const q = query.toLowerCase();
      const matches = DEMO_CITIES.filter((city) =>
        city.toLowerCase().includes(q),
      ).slice(0, 5);
      setSuggestions(matches);
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [query, visible]);

  if (!visible || suggestions.length === 0) return null;

  return (
    <ul className="search-suggestions" role="listbox" aria-label="City suggestions">
      {suggestions.map((city) => (
        <li key={city}>
          <button
            type="button"
            role="option"
            className="suggestion-item"
            onClick={() => onSelect(city)}
          >
            {city}
          </button>
        </li>
      ))}
    </ul>
  );
}
