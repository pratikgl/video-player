## Video Player – Three.js Transcript Editor

This project implements the **Frontend Assignment custom video player**: a Next.js single‑page app that composites a background image and video on a Three.js canvas, with a **word‑level synced transcript sidebar**, **skipping controls**, and a **custom playback timeline**.

The app is built as a set of reusable components so that the player and transcript could be embedded into a larger application.

---

## Stack

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Rendering**: Three.js (WebGL canvas for composited background + video)
- **Styling**: Tailwind CSS
- **Icons / UI**: `lucide-react`, custom SVG icons, shadcn-style slider component
- **State / Controllers**: Lightweight controller classes for video, skips, and player styling

---

## Features

- **Three.js Player Canvas**
  - Renders a **background image** as a full‑size plane.
  - Renders the **video as a textured plane** centered on top of the background.
  - Uses a custom **shader material** to apply a rounded‑rectangle mask to the video texture.
  - Exposes **padding** and **border‑radius** controls via a `playerController`, so the visual styling can be driven externally.

- **Transcript Sidebar**
  - Loads a **word‑level transcript** from a mock API (`/api/transcript`) based on the assignment’s `Transcript` / `Word` schema.
  - Each word is rendered with `data-start` / `data-end` attributes and:
    - The **currently playing word** is highlighted and auto‑scrolled into view based on `videoController` time updates.
    - **Clicking a word** seeks the video directly to that timestamp (bonus requirement).

- **Skip / Unskip Selection**
  - Users can **select any span of transcript text**.
  - A contextual toolbar appears above the selection with:
    - **Skip** – mark the selected time range as skipped.
    - **Unskip** – remove skipping from the selected range.
  - Skipped words are rendered with **line‑through** and reduced opacity.
  - Under the hood:
    - A `skipController` tracks skipped segments as time ranges.
    - Utility functions (`addSegment`, `subtractSegment`, `hasAnyOverlap`, `isFullyCovered`) keep segments merged and consistent.
    - The `videoController` consults `skipController` while playing and **jumps over** skipped segments using a small offset.

- **Playback Controls & Timeline**
  - **Play / Pause** button with live playback state.
  - **Time display** in `MM:SS / MM:SS` format.
  - **Seekable timeline slider**:
    - Reflects current playback time in real‑time.
    - Allows scrubbing by dragging.
    - Shows **tick labels** at regular intervals along the track.

- **Styling Controls (Padding & Rounding)**
  - Left sidebar contains two sliders:
    - **Padding** – scales the video plane within the canvas, effectively changing the whitespace around the video.
    - **Rounding** – controls border radius on the canvas container and the shader’s radius uniform, producing smooth rounded corners.
  - Both sliders update the Three.js scene **in real time** via `playerController`.

- **Mock APIs & Assets**
  - `GET /api/media` – returns URLs for the video file and background image.
  - `GET /api/transcript` – returns a JSON transcript (loaded from `public/transcript.json`).
  - The player then uses these endpoints so that data is **not hard‑coded** in the UI components.

---

## Project Structure (high level)

- `app/page.tsx` – Composes the main layout: left `Sidebar` and right `PlayerPanel`.
- `components/layout/Sidebar.tsx` – Transcript section + padding/rounding sliders.
- `components/layout/PlayerPanel.tsx` – Three.js video player + playback `Timeline`.
- `components/player/ThreeVideoPlayer.tsx` – Three.js scene setup, media loading, player styling hooks.
- `components/player/Timeline.tsx` – Play/pause button, time display, and seekable slider.
- `components/transcript/Transcript.tsx` – Word‑level transcript, selection, skip/unskip UX, word click‑to‑seek.
- `lib/videoController.ts` – Central controller for video element, current time loop, subscribers, and skip integration.
- `lib/skipController.ts` – Stores skipped time segments.
- `lib/playerController.ts` – Bridges UI sliders to Three.js video mesh padding and border radius.
- `lib/mediaApi.ts` – Helper functions for fetching media and transcript from Next.js API routes.
- `types/transcript.ts` – Type definitions for `Word`, `Transcript`, and `Segment`.
- `app/api/media/route.ts` – Mock media endpoint.
- `app/api/transcript/route.ts` – Mock transcript endpoint.

---

## Getting Started

### Prerequisites

- **Node.js**: 18+ (Node 20 recommended)
- **Package manager**: `npm` (or `pnpm` / `yarn` if you prefer)

### Installation

```bash
npm install
```

### Running the development server

```bash
npm run dev
```

Then open `http://localhost:3000` in your browser.

### Required local assets

The mock media API assumes the following files exist in `public/`:

- `public/video.mp4` – the main video file
- `public/background.jpg` – the background image
- `public/transcript.json` – transcript JSON matching the `Transcript` shape

You can replace these with your own assets as long as the paths and JSON shape remain compatible.
