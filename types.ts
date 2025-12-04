export interface City {
  id: string;
  name: string;
  country: string;
  state?: string; // State, Province, or Territory
  timezone: string; // IANA timezone string (e.g., Australia/Melbourne)
  lat: number;
  lng: number;
}

export interface SolarCycle {
  sunrise: number; // minutes from midnight
  sunset: number; // minutes from midnight
}

export const DEFAULT_CITIES: City[] = [
  {
    id: 'melbourne-au',
    name: 'Melbourne',
    country: 'Australia',
    state: 'VIC',
    timezone: 'Australia/Melbourne',
    lat: -37.8136,
    lng: 144.9631
  }
];

export interface SearchResult {
  name: string;
  country: string;
  state?: string;
  timezone: string;
  lat: number;
  lng: number;
}