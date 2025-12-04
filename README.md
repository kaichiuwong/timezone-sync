# ChronoSync - Global Timezone Scheduler

ChronoSync is a professional timezone visualizer designed to help distributed teams and travelers coordinate schedules effectively. It provides a seamless interface to compare time across cities, featuring daylight saving adjustments, solar cycles, and working hour overlaps.

## ✨ Key Functionalities

### 🌍 Multi-City Time Synchronization
- **Global Timeline**: View time across multiple cities simultaneously.
- **Reference City**: The top city serves as the "Home" or base reference.
- **"Set as Home"**: Promote any city to the top of the list. The application intelligently recalculates offsets so the global timeline remains stable (i.e., the absolute moment in time doesn't change, only the perspective).

### 🎮 Interactive Controls
- **Global Time Picker**: Use the dropdown in the header to set the time for your home city in 30-minute intervals.
- **Per-City Adjustment**: Click the time display on *any* city card to change the time specifically for that location. The app automatically syncs all other cities to match that new reference time.
- **12H / 24H Toggle**: Switch between military time and AM/PM formats globally.

### ☀️ Rich Visualization
- **Day/Night Cycles**: Visual indicators (gradients + icons) show sunrise, daylight, sunset, and night.
- **Working Hours**: A distinct green bar highlights the standard 9:00 AM – 6:00 PM working window, making it easy to spot overlap between timezones.
- **Seamless Scrolling**: The timeline renders a 3-day window (Yesterday, Today, Tomorrow) to handle overnight transitions smoothly.

### 🏙️ Comprehensive Data
- **Offline City Database**: Includes major cities, state capitals, and regional hubs worldwide (e.g., Melbourne, Hobart, Osaka, New York, London).
- **Accurate DST**: Utilizes the browser's native `Intl` API to handle Daylight Saving Time rules automatically for every specific date.

---

## 🚀 Deployment

This project is now configured as a standard Vite React application, making it instantly deployable to Vercel.

### 1. Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

### 2. Vercel Deployment

**Zero-Config Deployment:**
1. Push this code to a Git repository (GitHub, GitLab, or Bitbucket).
2. Go to [Vercel](https://vercel.com) and click **"Add New..."** > **"Project"**.
3. Import your Git repository.
4. Vercel will detect `Vite` framework automatically.
5. Click **Deploy**.

**Manual Build:**
To build locally for production:
```bash
npm run build
```
This generates a `dist` folder which can be served by any static host.

## 🛠️ Tech Stack
- **React 18**: UI Library
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling (via PostCSS)
- **Vite**: Build tool
- **Intl API**: Native date/time & timezone math