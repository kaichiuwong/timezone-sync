/**
 * Calculates a simple approximation of sunrise and sunset based on lat/lng and day of year.
 * Returns minutes from midnight.
 */
export const calculateSolarCycle = (lat: number, date: Date): { sunrise: number; sunset: number } => {
  try {
    // Approximate day of year
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = (date.getTime() - start.getTime()) + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);

    // Approximate solar declination
    const declination = 23.45 * Math.sin((Math.PI / 180) * (360 / 365) * (dayOfYear - 81));

    // Hour angle calculation
    // cos(H) = -tan(lat) * tan(decl)
    const latRad = (lat * Math.PI) / 180;
    const declRad = (declination * Math.PI) / 180;
    
    let cosH = -Math.tan(latRad) * Math.tan(declRad);
    
    // Clamp for polar days/nights
    if (cosH < -1) cosH = -1; // Midnight sun
    if (cosH > 1) cosH = 1;   // Polar night

    const H = (Math.acos(cosH) * 180) / Math.PI;
    
    // Minutes of sunlight (half day)
    const minutes = (H / 15) * 60;
    
    // Assuming Solar Noon is approx 12:00 for the visualization bar
    return {
      sunrise: 720 - minutes,
      sunset: 720 + minutes
    };
  } catch (e) {
    // Fallback if calculation fails
    return { sunrise: 360, sunset: 1080 }; // 6am to 6pm
  }
};

export const formatTime = (date: Date, timezone: string, is24Hour: boolean = false): string => {
  try {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: timezone,
      hour12: !is24Hour
    }).format(date);
  } catch (e) {
    return "--:--";
  }
};

export const formatDate = (date: Date, timezone: string): string => {
  try {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      timeZone: timezone
    }).format(date);
  } catch (e) {
    return "Invalid Date";
  }
};

export const getOffsetString = (date: Date, timezone: string): string => {
  try {
    const str = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'shortOffset'
    }).format(date);
    // Extracts "GMT+11" or "GMT-4" etc.
    const parts = str.split(' ');
    return parts.find(p => p.startsWith('GMT')) || '';
  } catch (e) {
    return "";
  }
};

/**
 * Robustly extracts local time components (hour, minute) for a given timezone
 */
export const getLocalTimeParts = (date: Date, timezone: string) => {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    
    const parts = formatter.formatToParts(date);
    const getPart = (type: string) => parts.find(p => p.type === type)?.value;
    
    const hour = parseInt(getPart('hour') || '0', 10);
    // Handle edge case where 24:00 is returned as 24 or 0 depending on browser
    const normalizedHour = hour === 24 ? 0 : hour;
    const minute = parseInt(getPart('minute') || '0', 10);
    
    return {
      hour: normalizedHour,
      minute,
      totalMinutes: normalizedHour * 60 + minute,
      dayStr: `${getPart('weekday')}, ${getPart('month')} ${getPart('day')}`,
      year: parseInt(getPart('year') || '2024', 10),
      month: getPart('month'),
      day: parseInt(getPart('day') || '1', 10)
    };
  } catch (e) {
    console.warn("Failed to get local time parts", e);
    return { hour: 0, minute: 0, totalMinutes: 0, dayStr: '', year: 2024, month: 'Jan', day: 1 };
  }
};

/**
 * Returns the offset in minutes (Local - UTC) for a given date and timezone.
 * Uses a robust ISO parsing method to avoid browser locale issues.
 */
export const getTimezoneOffsetMinutes = (d: Date, tz: string): number => {
  try {
    // "en-CA" format: 2024-10-25, 14:30:00 (ISO-like order)
    const isoLocal = d.toLocaleString('en-CA', { timeZone: tz, hour12: false });
    const isoUtc = d.toLocaleString('en-CA', { timeZone: 'UTC', hour12: false });
    
    // Create simple ISO strings 'YYYY-MM-DDTHH:mm:ssZ' to parse as UTC
    // Robust regex to extract digits
    const parseDigits = (s: string) => s.match(/\d+/g);
    
    const localParts = parseDigits(isoLocal);
    const utcParts = parseDigits(isoUtc);

    if (!localParts || !utcParts || localParts.length < 5 || utcParts.length < 5) return 0;

    const toDate = (p: RegExpMatchArray) => Date.UTC(
      parseInt(p[0]), parseInt(p[1]) - 1, parseInt(p[2]), 
      parseInt(p[3]), parseInt(p[4]), parseInt(p[5] || '0')
    );

    const localTs = toDate(localParts);
    const utcTs = toDate(utcParts);
    
    return (localTs - utcTs) / 60000;
  } catch (e) {
    console.error("Error calculating timezone offset", e);
    return 0;
  }
};

/**
 * Calculates a UTC Date that corresponds to a specific wall-clock time in a target timezone.
 * Anchors to the current date (Today).
 */
export const getUtcDateFromLocal = (targetMinutes: number, timezone: string): Date => {
    const now = new Date();
    const targetHours = Math.floor(targetMinutes / 60);
    const targetMin = targetMinutes % 60;
    
    const year = now.getFullYear();
    const month = now.getMonth();
    const day = now.getDate();
    
    // 1. Construct naive UTC
    const naiveUTC = Date.UTC(year, month, day, targetHours, targetMin, 0);
    
    // 2. Get Approx Offset
    const approxOffset = getTimezoneOffsetMinutes(new Date(naiveUTC), timezone);
    
    // 3. Adjust
    const refinedUTC = naiveUTC - (approxOffset * 60000);
    
    // 4. Verify boundary
    const finalOffset = getTimezoneOffsetMinutes(new Date(refinedUTC), timezone);
    if (finalOffset !== approxOffset) {
        return new Date(naiveUTC - (finalOffset * 60000));
    }
    
    return new Date(refinedUTC);
};

export const getLocalMinutes = (date: Date, timezone: string): number => {
    const { totalMinutes } = getLocalTimeParts(date, timezone);
    return totalMinutes;
};

// Generate time options in 30 minute intervals (00:00 to 23:30)
export const generateTimeOptions = (is24Hour: boolean) => {
  return Array.from({ length: 48 }, (_, i) => {
    const minutes = i * 30;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    
    let label = '';
    if (is24Hour) {
        label = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    } else {
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        label = `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
    }
    
    return {
      value: minutes,
      label
    };
  });
};
