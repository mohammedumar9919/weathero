import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Search } from "lucide-react";
import { SearchSuggestions } from "./SearchSuggestions";

interface CitySearchProps {
  city: string;
  onCityChange: (city: string) => void;
}

export function CitySearch({ city, onCityChange }: CitySearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState(city);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    setInputValue(city);
  }, [city]);

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "/" && document.activeElement !== inputRef.current) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const submit = () => {
    const trimmed = inputValue.trim();
    if (trimmed) {
      onCityChange(trimmed);
      inputRef.current?.blur();
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      submit();
    }
    if (event.key === "Escape") {
      setFocused(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className="city-search">
      <label htmlFor="city-search-input" className="sr-only">
        Search city
      </label>
      <Search className="search-icon" size={20} aria-hidden="true" />
      <input
        id="city-search-input"
        ref={inputRef}
        type="search"
        className="city-search-input"
        placeholder="Search city… (press /)"
        value={inputValue}
        onChange={(event) => setInputValue(event.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        onKeyDown={handleKeyDown}
        autoComplete="off"
      />
      <SearchSuggestions
        query={inputValue}
        onSelect={(selected) => {
          setInputValue(selected);
          onCityChange(selected);
          setFocused(false);
        }}
        visible={focused}
      />
    </div>
  );
}
