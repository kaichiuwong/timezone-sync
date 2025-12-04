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

This project is built as a standard **React Single Page Application (SPA)** using TypeScript. It is optimized for static hosting.

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 1. Installation
If you haven't already initialized the project with a build tool (like Vite), you can set it up quickly:

```bash
# Create a new Vite project
npm create vite@latest chronosync -- --template react-ts

# Move the provided source files into /src
# (Ensure index.html is in the root and points to /src/index.tsx)

# Install dependencies
npm install tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 2. Local Development
To run the app locally:

```bash
npm run dev
```
Open your browser to `http://localhost:5173`.

### 3. Production Build
To create a production-ready build:

```bash
npm run build
```
This command generates a `dist` (or `build`) folder containing static HTML, CSS, and JavaScript files.

### 4. Hosting
You can deploy the output folder to any static hosting provider.

#### **Vercel** (Recommended)
1. Push your code to a GitHub repository.
2. Log in to Vercel and "Add New Project".
3. Select your repository.
4. Vercel automatically detects Vite/React. Click **Deploy**.

#### **Netlify**
1. Drag and drop the `dist` folder into the Netlify dashboard.
2. Or connect your Git repository and set the build command to `npm run build` and publish directory to `dist`.

#### **GitHub Pages**
1. Update `vite.config.ts` to set `base: '/repo-name/'`.
2. Run the build.
3. Deploy the `dist` folder to the `gh-pages` branch.

## 🛠️ Tech Stack
- **React 18**: UI Library
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **Intl API**: Native date/time & timezone math
