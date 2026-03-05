type Listener = (time: number) => void;

class VideoController {
  video: HTMLVideoElement | null = null;
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
        this.listeners.forEach((l) => l(time));
      }

      requestAnimationFrame(loop);
    };

    loop();
  }
}

export const videoController = new VideoController();
