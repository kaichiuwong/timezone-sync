import React, { useMemo } from 'react';
import { City } from '../types';
import { calculateSolarCycle, formatTime, formatDate, getOffsetString, getLocalTimeParts, generateTimeOptions, getTimezoneOffsetMinutes } from '../utils/time';
import { TrashIcon, SunIcon, MoonIcon, HomeIcon, GripVerticalIcon } from './Icons';
import { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';

interface CityRowProps {
  city: City;
  referenceDate: Date; // The global "selected time" in UTC
  onRemove: (id: string) => void;
  onSetHome: (id: string) => void;
  onTimeChange: (newMinutes: number) => void;
  isBase: boolean;
  is24Hour: boolean;
  homeTimezone: string;
  dragHandleListeners?: SyntheticListenerMap;
}

// Internal component to render a single 24h day block
const DayCycleBar: React.FC<{ sunrise: number; sunset: number; workStart: number; workEnd: number }> = ({ sunrise, sunset, workStart, workEnd }) => {
  // Safe clamps
  const sRise = isNaN(sunrise) ? 360 : sunrise;
  const sSet = isNaN(sunset) ? 1080 : sunset;

  const getStyle = (start: number, end: number) => ({
    left: `${Math.max(0, (start / 1440) * 100)}%`,
    width: `${Math.max(0, ((end - start) / 1440) * 100)}%`
  });

  return (
    <div className="relative w-full h-full">
      {/* Night Base - Always dark as it represents night */}
      <div className="absolute inset-0 bg-slate-950 opacity-90"></div>
      
      {/* Day Light Block */}
      <div 
        className="absolute top-0 bottom-0 bg-gradient-to-r from-sky-900/20 via-sky-800/40 to-sky-900/20 border-x border-sky-700/30"
        style={getStyle(sRise, sSet)}
      >
        <div className="absolute top-1 left-1/2 -translate-x-1/2 opacity-30">
           <SunIcon className="w-8 h-8 text-yellow-500 blur-sm" />
        </div>
      </div>

      {/* Working Hours Block */}
      <div 
        className="absolute top-3 bottom-3 bg-green-500/10 border-x border-green-500/30 backdrop-blur-[1px] z-10"
        style={getStyle(workStart, workEnd)}
      ></div>

      {/* Time Markers */}
      <div className="absolute bottom-1 w-full text-[9px] text-slate-500 font-mono pointer-events-none">
        <span className="absolute transform -translate-x-1/2" style={{ left: `${(sRise/1440)*100}%` }}>
          {Math.floor(sRise/60)}:{String(Math.floor(sRise%60)).padStart(2,'0')}
        </span>
        <span className="absolute transform -translate-x-1/2" style={{ left: `${(sSet/1440)*100}%` }}>
          {Math.floor(sSet/60)}:{String(Math.floor(sSet%60)).padStart(2,'0')}
        </span>
      </div>
    </div>
  );
};

export const CityRow: React.FC<CityRowProps> = ({ city, referenceDate, onRemove, onSetHome, onTimeChange, isBase, is24Hour, homeTimezone, dragHandleListeners }) => {
  
  const { totalMinutes: currentMinutes } = useMemo(
    () => getLocalTimeParts(referenceDate, city.timezone),
    [referenceDate, city.timezone]
  );

  const timeOptions = useMemo(() => generateTimeOptions(is24Hour), [is24Hour]);

  // Round current minutes to nearest 30 for the select value to match options
  const roundedMinutes = Math.round(currentMinutes / 30) * 30;
  const safeSelectValue = roundedMinutes >= 1440 ? 0 : roundedMinutes;
  
  const progressPercent = (currentMinutes / 1440) * 100;

  // Solar calculation
  const { sunrise, sunset } = useMemo(() => calculateSolarCycle(city.lat, referenceDate), [city.lat, referenceDate]);
  
  const workStart = 9 * 60;
  const workEnd = 18 * 60;
  
  const isWorkingHours = currentMinutes >= workStart && currentMinutes < workEnd;
  const isDaytime = currentMinutes >= sunrise && currentMinutes < sunset;

  // Time Difference Calculation
  const offsetDiff = useMemo(() => {
    if (isBase) return 0;
    const homeOffset = getTimezoneOffsetMinutes(referenceDate, homeTimezone);
    const cityOffset = getTimezoneOffsetMinutes(referenceDate, city.timezone);
    return cityOffset - homeOffset;
  }, [referenceDate, homeTimezone, city.timezone, isBase]);

  const diffString = useMemo(() => {
    if (isBase) return '';
    if (offsetDiff === 0) return 'Same time';
    const hours = Math.floor(Math.abs(offsetDiff) / 60);
    const mins = Math.abs(offsetDiff) % 60;
    const sign = offsetDiff > 0 ? '+' : '-';
    // Format: +5h, -3h 30m
    return `${sign}${hours}h${mins > 0 ? ` ${mins}m` : ''}`;
  }, [offsetDiff, isBase]);

  return (
    <div className="group relative bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-xl p-4 transition-all duration-300 shadow-sm dark:shadow-none">
      
      {/* Top Row: Info */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-start gap-3">
          {/* Drag Handle */}
          <div 
            className="mt-1 text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400 cursor-grab active:cursor-grabbing touch-none"
            {...dragHandleListeners}
            title="Drag to reorder"
          >
            <GripVerticalIcon className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{city.name}</h3>
              {isBase ? (
                <span className="text-[10px] uppercase font-bold bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-200 dark:border-cyan-800">Home</span>
              ) : (
                <button 
                  onClick={() => onSetHome(city.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] uppercase font-bold bg-slate-200 dark:bg-slate-700 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 text-slate-600 dark:text-slate-300 hover:text-cyan-700 dark:hover:text-cyan-300 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-600 hover:border-cyan-300 dark:hover:border-cyan-800 flex items-center gap-1"
                  title="Set as Home City"
                >
                  <HomeIcon className="w-3 h-3" /> Make Home
                </button>
              )}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
              <span>
                {city.state ? <span className="text-slate-500 dark:text-slate-400">{city.state}, </span> : null}
                {city.country}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
              <span>{getOffsetString(referenceDate, city.timezone)}</span>
              
              {!isBase && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                    <span className={`font-medium ${offsetDiff > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
                      {diffString}
                    </span>
                  </>
              )}
            </p>
          </div>
        </div>
        
        <div className="text-right relative">
          <div className={`relative flex items-center justify-end group/time cursor-pointer rounded px-1 -mr-1 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700/50`}>
             <div className={`text-2xl font-mono font-semibold ${isWorkingHours ? 'text-green-600 dark:text-green-400' : 'text-slate-800 dark:text-slate-200'}`}>
                {formatTime(referenceDate, city.timezone, is24Hour)}
             </div>
             {/* Edit Pencil Icon on Hover */}
             <div className="opacity-0 group-hover/time:opacity-100 absolute -left-5 text-slate-400 dark:text-slate-500 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
             </div>
             
             {/* Hidden Select Overlay */}
             <select 
               className="absolute inset-0 opacity-0 w-full h-full cursor-pointer appearance-none"
               value={safeSelectValue}
               onChange={(e) => onTimeChange(Number(e.target.value))}
             >
                {timeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
             </select>
          </div>
          <div className="text-xs text-slate-500 font-medium">
            {formatDate(referenceDate, city.timezone)}
          </div>
        </div>
      </div>

      {/* Visual Timeline Bar with Static Cursor */}
      <div className="relative h-14 w-full bg-slate-100 dark:bg-slate-900/80 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner">
        <div 
          className="absolute top-0 bottom-0 left-0 flex h-full w-[300%] will-change-transform"
          style={{ transform: `translateX(-${(50 + progressPercent) / 3}%)` }}
        >
          {/* Yesterday */}
          <div className="flex-1 border-r border-slate-300/20 dark:border-slate-800/50 relative">
             <DayCycleBar sunrise={sunrise} sunset={sunset} workStart={workStart} workEnd={workEnd} />
          </div>
          {/* Today */}
          <div className="flex-1 border-r border-slate-300/20 dark:border-slate-800/50 relative">
             <DayCycleBar sunrise={sunrise} sunset={sunset} workStart={workStart} workEnd={workEnd} />
          </div>
          {/* Tomorrow */}
          <div className="flex-1 relative">
             <DayCycleBar sunrise={sunrise} sunset={sunset} workStart={workStart} workEnd={workEnd} />
          </div>
        </div>

        {/* Static Center Cursor */}
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-cyan-500 dark:bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] z-20 pointer-events-none">
            <div className={`absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full border-2 border-slate-100 dark:border-slate-800 ${isWorkingHours ? 'bg-green-500 dark:bg-green-400' : 'bg-cyan-500 dark:bg-white'}`}></div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-500/50 dark:bg-white/50"></div>
        </div>

      </div>

      {/* Status Badges */}
      <div className="flex gap-2 mt-3 overflow-x-auto pb-1 no-scrollbar">
        {isWorkingHours && (
            <span className="whitespace-nowrap inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/50">
              Working Hours
            </span>
        )}
        {!isDaytime ? (
             <span className="whitespace-nowrap inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50">
              <MoonIcon className="w-3 h-3" /> Night
            </span>
        ) : (
             <span className="whitespace-nowrap inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50">
              <SunIcon className="w-3 h-3" /> Day
            </span>
        )}
      </div>

      {/* Delete Button */}
      {!isBase && (
        <button 
          onClick={() => onRemove(city.id)}
          className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-2 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-all bg-white dark:bg-slate-900/90 rounded-md border border-slate-200 dark:border-slate-800 hover:border-red-200 dark:hover:border-red-900/50 z-30 shadow-sm"
          title="Remove city"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};