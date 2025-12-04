import React, { useState, useEffect, useRef } from 'react';
import { City } from '../types';
import { SearchIcon, PlusIcon } from './Icons';
import { MAJOR_CITIES } from '../data/cities';

interface CitySearchProps {
  onAddCity: (city: City) => void;
}

export const CitySearch: React.FC<CitySearchProps> = ({ onAddCity }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filteredCities = MAJOR_CITIES.filter(city => 
    city.name.toLowerCase().includes(query.toLowerCase()) ||
    city.country.toLowerCase().includes(query.toLowerCase()) ||
    (city.state && city.state.toLowerCase().includes(query.toLowerCase()))
  ).slice(0, 5); // Limit to 5 results for UI

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const handleSelectCity = (cityData: typeof MAJOR_CITIES[0]) => {
    const newCity: City = {
      id: `${cityData.name}-${Date.now()}`,
      ...cityData
    };
    onAddCity(newCity);
    setQuery('');
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsOpen(true);
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8" ref={wrapperRef}>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon className="h-5 w-5 text-slate-400 group-focus-within:text-cyan-500 transition-colors" />
        </div>
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder="Search for a city (e.g. 'London', 'Tokyo')..."
          className="block w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl leading-5 bg-white dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all shadow-sm"
        />
      </div>

      {/* Dropdown Results */}
      {isOpen && query.trim() !== '' && (
        <div className="absolute z-50 w-full max-w-2xl mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl overflow-hidden">
          {filteredCities.length > 0 ? (
            <ul>
              {filteredCities.map((city, idx) => (
                <li key={`${city.name}-${idx}`}>
                  <button
                    onClick={() => handleSelectCity(city)}
                    className="w-full text-left px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-between transition-colors group"
                  >
                    <div>
                      <span className="font-medium text-slate-900 dark:text-white block">{city.name}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {city.state ? `${city.state}, ` : ''}{city.country}
                      </span>
                    </div>
                    <PlusIcon className="w-4 h-4 text-cyan-600 dark:text-cyan-500 opacity-0 group-hover:opacity-100" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
              No matching cities found.
            </div>
          )}
        </div>
      )}
    </div>
  );
};