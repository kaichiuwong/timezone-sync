import React, { useState, useEffect, useMemo } from 'react';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent 
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { DEFAULT_CITIES, City } from './types';
import { SortableCityRow } from './components/SortableCityRow';
import { CitySearch } from './components/CitySearch';
import { getLocalTimeParts, getTimezoneOffsetMinutes, getUtcDateFromLocal, getLocalMinutes, generateTimeOptions } from './utils/time';
import { SunIcon, MoonIcon } from './components/Icons';

const App: React.FC = () => {
  // Cities State
  const [cities, setCities] = useState<City[]>(DEFAULT_CITIES);
  
  // Slider/Time State (0 - 1439 minutes) representing the time of the FIRST city (Home)
  const [sliderMinutes, setSliderMinutes] = useState<number>(0);
  
  // 12/24 Hour Format Toggle (Default True)
  const [is24Hour, setIs24Hour] = useState(true);

  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Apply theme to html element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Initialize: Set time to current time of the first city, rounded to nearest 30 mins
  useEffect(() => {
    const now = new Date();
    // Get hours/minutes in the first city's timezone safely
    if (cities.length > 0) {
      const homeCity = cities[0];
      const { totalMinutes } = getLocalTimeParts(now, homeCity.timezone);
      
      // Round to nearest 30
      let rounded = Math.round(totalMinutes / 30) * 30;
      if (rounded >= 1440) rounded = 0;
      
      setSliderMinutes(rounded);
    } else {
      const nowLocal = new Date();
      const mins = nowLocal.getHours() * 60 + nowLocal.getMinutes();
      let rounded = Math.round(mins / 30) * 30;
      if (rounded >= 1440) rounded = 0;
      setSliderMinutes(rounded);
    }
  }, []); // Run once on mount

  const handleAddCity = (city: City) => {
    setCities(prev => [...prev, city]);
  };

  const handleRemoveCity = (id: string) => {
    setCities(prev => prev.filter(c => c.id !== id));
  };

  // Calculate the Global Reference UTC Date based on slider
  // The slider always controls the Home City (index 0)
  const globalDate = useMemo(() => {
    if (cities.length === 0) return new Date();
    return getUtcDateFromLocal(sliderMinutes, cities[0].timezone);
  }, [cities, sliderMinutes]);

  const handleSetHome = (id: string) => {
    const cityIndex = cities.findIndex(c => c.id === id);
    if (cityIndex === -1 || cityIndex === 0) return;

    const newCities = [...cities];
    const [cityToPromote] = newCities.splice(cityIndex, 1);
    
    // To prevent the timeline from "jumping" when the home city changes,
    // we need to calculate what the sliderMinutes should be for the NEW home city
    // so that it matches the CURRENT global time.
    const newHomeLocalMinutes = getLocalMinutes(globalDate, cityToPromote.timezone);
    
    // Round to nearest 30 to match UI controls
    let rounded = Math.round(newHomeLocalMinutes / 30) * 30;
    if (rounded >= 1440) rounded = 0;

    newCities.unshift(cityToPromote);
    setCities(newCities);
    setSliderMinutes(rounded);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setCities((items) => {
        const oldIndex = items.findIndex((c) => c.id === active.id);
        const newIndex = items.findIndex((c) => c.id === over.id);
        
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // If the Home City (index 0) changed due to drag, we must update 
        // sliderMinutes to prevent Global Time Jump.
        // Concept: The "absolute moment" (globalDate) should remain the same before and after drag.
        if (newIndex === 0 || oldIndex === 0) {
           // We need the new home city (newItems[0])
           // And we calculate what its local time is based on the CURRENT globalDate
           // Note: globalDate is computed from (cities[0], sliderMinutes) of the PREVIOUS state.
           // We can capture it before state update.
           
           // Actually, we can just calculate it right now:
           const currentGlobal = getUtcDateFromLocal(sliderMinutes, items[0].timezone);
           const newHomeCity = newItems[0];
           const newHomeLocal = getLocalMinutes(currentGlobal, newHomeCity.timezone);
           
           let rounded = Math.round(newHomeLocal / 30) * 30;
           if (rounded >= 1440) rounded = 0;
           
           // We must queue this state update to happen with the cities update
           // But React batches updates in event handlers.
           setSliderMinutes(rounded);
        }
        
        return newItems;
      });
    }
  };

  const handleCityTimeUpdate = (city: City, newMinutes: number) => {
      if (cities.length === 0) return;

      // 1. Calculate what the global UTC time would be if 'city' is at 'newMinutes'
      const newGlobalUtc = getUtcDateFromLocal(newMinutes, city.timezone);
      
      // 2. Find out what time it is in the Home City (cities[0]) at this new UTC time
      const homeCity = cities[0];
      const newHomeMinutes = getLocalMinutes(newGlobalUtc, homeCity.timezone);

      // 3. Update the main slider state. This will propagate down to 'globalDate' via the useMemo above.
      // We round to nearest 30 just to be safe and clean, though getLocalMinutes is precise.
      let rounded = Math.round(newHomeMinutes / 30) * 30;
      if (rounded >= 1440) rounded = 0;

      setSliderMinutes(rounded);
  };
  
  const timeOptions = useMemo(() => generateTimeOptions(is24Hour), [is24Hour]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 pb-20 font-sans selection:bg-cyan-500/30 transition-colors duration-300">
      
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 backdrop-blur-md bg-opacity-80 dark:bg-opacity-80 supports-[backdrop-filter]:bg-opacity-60">
        <div className="max-w-4xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)] border border-cyan-400/20">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
             </div>
             <div>
               <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">TimezoneSync</h1>
             </div>
          </div>
          
          <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-4">
            
             {/* Theme Toggle */}
             <button
               onClick={toggleTheme}
               className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
               title="Toggle Theme"
             >
                {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
             </button>

             {/* 12h/24h Toggle */}
             <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
                <button 
                  onClick={() => setIs24Hour(false)}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all ${!is24Hour ? 'bg-white dark:bg-cyan-600 text-cyan-600 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'}`}
                >
                  12H
                </button>
                <button 
                  onClick={() => setIs24Hour(true)}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all ${is24Hour ? 'bg-white dark:bg-cyan-600 text-cyan-600 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'}`}
                >
                  24H
                </button>
             </div>

             <div className="flex items-center gap-2 w-full md:w-auto">
                <label className="text-sm text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap hidden sm:block">Set Time:</label>
                <div className="relative w-full md:w-40">
                    <select
                        value={sliderMinutes}
                        onChange={(e) => setSliderMinutes(Number(e.target.value))}
                        className="w-full appearance-none bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 cursor-pointer font-mono text-base transition-all shadow-sm"
                    >
                        {timeOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-cyan-500">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                </div>
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Intro / Search */}
        <div className="mb-10">
          <CitySearch onAddCity={handleAddCity} />
        </div>

        {/* Cities List */}
        <div className="space-y-4">
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={cities.map(c => c.id)}
              strategy={verticalListSortingStrategy}
            >
              {cities.map((city, index) => (
                <SortableCityRow 
                  key={city.id} 
                  city={city} 
                  referenceDate={globalDate}
                  onRemove={handleRemoveCity}
                  onSetHome={handleSetHome}
                  onTimeChange={(val) => handleCityTimeUpdate(city, val)}
                  isBase={index === 0}
                  is24Hour={is24Hour}
                />
              ))}
            </SortableContext>
          </DndContext>
          
          {cities.length === 0 && (
            <div className="text-center py-20 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-xl bg-slate-100 dark:bg-slate-900/30">
              <p className="text-slate-500">No cities added. Use the search bar to begin.</p>
            </div>
          )}
        </div>
        
        {/* Legend */}
        <div className="mt-12 flex flex-wrap justify-center gap-6 text-xs text-slate-500 border-t border-slate-200 dark:border-slate-800 pt-6">
           <div className="flex items-center gap-2">
             <div className="w-3 h-3 bg-green-500/20 border border-green-500/50 rounded-sm"></div>
             <span>Working Hours (9-18)</span>
           </div>
           <div className="flex items-center gap-2">
             <div className="w-3 h-3 bg-sky-900/40 border border-sky-800/30 rounded-sm"></div>
             <span>Daylight</span>
           </div>
           <div className="flex items-center gap-2">
             <div className="w-3 h-3 bg-slate-950 border border-slate-800 rounded-sm"></div>
             <span>Night</span>
           </div>
           <div className="flex items-center gap-2">
             <div className="w-3 h-3 bg-white rounded-full border border-slate-700 shadow-sm"></div>
             <span>Current Time Cursor</span>
           </div>
        </div>
      </main>
    </div>
  );
};

export default App;