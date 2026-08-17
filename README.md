# Career Pilot Project Website

A responsive, animated, multi-theme static website for the Career Pilot graduation project.

## Run locally

From this folder:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Deploy to Vercel

This project is static and includes `vercel.json`. Upload the folder to a Git repository and import it into Vercel, or deploy with the Vercel CLI.

## Add the Android APK

Place the signed APK here:

`downloads/CareerPilot.apk`

All Download APK buttons are already connected to that path. If the file is not present, the site shows a friendly toast instead of a broken download.

## Add the recorded demo

Place the recorded portrait MP4 here:

`assets/demo/career-pilot-demo.mp4`

The inline emulator and modal demo player automatically detect the video and switch from the placeholder state to the player.

Recommended encoding: H.264 MP4, portrait 720x1280 or 1080x1920.

## Included Pages & Portals

- **Company Landing Page (`index.html`)**: Clean, high-level business & company overview, value proposition, core solution gateways, key trust metrics, and resource hub.
- **Product & Live Playground (`product.html`)**: 10 connected product pillars, interactive mock interview simulator, ATS resume scanner, challenge arena, and 4-tier distributed AI architecture.
- **Pricing & Economics (`pricing.html`)**: Free, Plus, and Max subscription tiers, virtual coin top-ups, access entitlement explorer, and interactive practice ROI calculator.
- **About & Team (`about.html`)**: ITI Intake 46 graduation project story, the 4 engineering teams (Android, iOS, Backend, QA), supervisor Eng. Mayar Hassan, and technology stack.
- **Interactive Documentation Portal (`docs.html`)**: Complete 8-chapter SRS specification, architecture models, REST API reference, and requirements with instant search (`Ctrl+K`).

## Included downloads

- Career Pilot documentation: `downloads/Career_Pilot_Documentation.docx`
- Career Pilot presentation: `downloads/Career_Pilot_Presentation.pptx`
- Android APK slot: `downloads/CareerPilot.apk`

## Themes

The site has three project-related themes:

- Cloud — bright Career Pilot blue/teal
- Pulse — warm indigo/orange accent
- Midnight — deep navy product theme

The selected theme persists in `localStorage`.

## Content / links configuration

Edit `config.js` to change the APK, documentation, presentation, or demo-video paths without touching the main HTML.

## Main interactive pieces

- Sticky navigation + active-section indicator
- Scroll progress bar and controlled reveal animations
- Animated hero application mockup
- Challenge Public / Private / Create switcher
- Interactive AI architecture explorer
- Subscription access explorer
- Android / iOS emulator selector
- Demo modal and video auto-detection
- Theme switcher
- Responsive mobile navigation
- Download hub
- Team and FAQ sections

## Source notes

Website content was aligned with the latest Career Pilot documentation and implementation context available in this project conversation. The Challenge feature is currently Android-first; the website does not claim iOS/backend Challenge parity.

## Brand palette

The website theme is synchronized with the Career Pilot mobile palette:

- Navy `#1B2340`, Navy Dark `#0E1428`, Navy Light `#2D3B6B`
- Amber `#FF7A45`, Amber Light `#FF9E72`
- Teal `#2DD4BF`, Teal Light `#99F6E4`
- Green `#22C55E`, Yellow `#F59E0B`, Coral `#EF4444`
- Off White `#F7F8FC`, Gray 100 `#F1F3F9`, Gray 200 `#E4E8F0`, Gray 400 `#9AA3B8`, Gray 600 `#5B657E`
- Dark Surface `#141B35`, Dark Surface Alt `#1A2140`

The theme selector now exposes **Light**, **Focus**, and **Dark**, all derived only from the approved Career Pilot palette.
