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
    return this.video?.duration ?? 0;
  }

  subscribe(listener: Listener) {
    this.listeners.push(listener);
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
