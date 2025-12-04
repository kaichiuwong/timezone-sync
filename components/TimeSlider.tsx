import React from 'react';

interface TimeSliderProps {
  minutes: number;
  onChange: (minutes: number) => void;
}

export const TimeSlider: React.FC<TimeSliderProps> = ({ minutes, onChange }) => {
  const formatMinutesToTime = (m: number) => {
    // Safety check
    if (isNaN(m)) return "12:00 AM";
    const h = Math.floor(m / 60);
    const min = m % 60;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${min.toString().padStart(2, '0')} ${ampm}`;
  };

  const safeMinutes = isNaN(minutes) ? 0 : minutes;

  return (
    <div className="w-full flex flex-col items-center space-y-2 py-4 select-none relative z-0">
       <div className="w-full flex justify-between text-xs text-slate-400 font-mono uppercase tracking-wider mb-1 px-1">
        <span>00:00</span>
        <span>06:00</span>
        <span>12:00</span>
        <span>18:00</span>
        <span>23:59</span>
      </div>
      
      <div className="relative w-full h-12 flex items-center group isolate">
        {/* Track Background - Lowest Layer */}
        <div className="absolute w-full h-3 bg-slate-800 rounded-full overflow-hidden z-0">
          {/* Decorative tick marks */}
          <div className="w-full h-full flex justify-between px-2">
            {[...Array(25)].map((_, i) => (
              <div key={i} className={`h-full w-[1px] ${i % 6 === 0 ? 'bg-slate-600' : 'bg-slate-700/50'}`} />
            ))}
          </div>
        </div>

        {/* Custom Thumb / Indicator - Middle Layer (Visual Only) */}
        <div 
          className="absolute h-8 w-1 bg-cyan-400 rounded-full z-10 pointer-events-none shadow-[0_0_15px_rgba(34,211,238,0.5)] transition-all duration-75"
          style={{ left: `${(safeMinutes / 1439) * 100}%`, transform: 'translateX(-50%)' }}
        >
           <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-cyan-950 border border-cyan-800 text-cyan-200 text-xs font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap z-20">
             {formatMinutesToTime(safeMinutes)}
           </div>
        </div>

        {/* Input Range - Highest Layer (Interaction) */}
        <input
          type="range"
          min="0"
          max="1439"
          step="1"
          value={safeMinutes}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50"
          style={{ margin: 0 }}
        />
      </div>
    </div>
  );
};