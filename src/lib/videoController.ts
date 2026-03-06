import { skipController } from "./skipController";

type Listener = (time: number) => void;

const SKIP_OFFSET = 0.01;
const PRE_SKIP = 0.1;

class VideoController {
  video: HTMLVideoElement | null = null;
  lastSkippedSegmentEnd: number | null = null;
  listeners: Listener[] = [];

  setVideo(video: HTMLVideoElement) {
    this.video = video;

    // Notify listeners once metadata (including duration) is available
    const onMetadata = () => {
      this.listeners.forEach((l) => l(this.video?.currentTime ?? 0));
    };

    video.addEventListener("loadedmetadata", onMetadata);
    // Also covers cases where duration changes (e.g. HLS streams)
    video.addEventListener("durationchange", onMetadata);
  }

  play() {
    this.video?.play();
  }

  pause() {
    this.video?.pause();
  }

  toggle() {
    if (!this.video) return;
    if (this.video.paused) this.video.play();
    else this.video.pause();
  }

  seek(time: number) {
    if (this.video) this.video.currentTime = time;
  }

  getCurrentTime() {
    return this.video?.currentTime ?? 0;
  }

  getDuration() {
    const dur = this.video?.duration;
    // Return 0 instead of NaN when metadata hasn't loaded yet
    return Number.isFinite(dur) ? dur! : 0;
  }

  isPlaying() {
    return this.video ? !this.video.paused : false;
  }

  subscribe(listener: Listener) {
    this.listeners.push(listener);
    // Return unsubscribe so consumers can clean up (e.g. React useEffect)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  startLoop() {
    const loop = () => {
      if (this.video) {
        const time = this.video.currentTime;

        const segments = skipController.getSegments();

        for (const seg of segments) {
          if (time >= seg.start - PRE_SKIP && time <= seg.end) {
            if (this.lastSkippedSegmentEnd !== seg.end) {
              this.lastSkippedSegmentEnd = seg.end;
              this.video.currentTime = seg.end + SKIP_OFFSET; // with some offset
            }

            break;
          }
        }
        if (!segments.some((s) => time >= s.start && time <= s.end)) {
          this.lastSkippedSegmentEnd = null;
        }

        this.listeners.forEach((l) => l(time));
      }

      requestAnimationFrame(loop);
    };

    loop();
  }
}

export const videoController = new VideoController();
