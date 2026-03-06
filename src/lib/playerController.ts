type PlayerActions = {
  setPadding: (percent: number) => void;
  setRadius: (percent: number) => void;
};

class PlayerController {
  private actions: PlayerActions | null = null;

  /** Called once by ThreeVideoPlayer on mount to register its handlers */
  register(actions: PlayerActions) {
    this.actions = actions;
  }

  setPadding(percent: number) {
    this.actions?.setPadding(percent);
  }

  setRadius(percent: number) {
    this.actions?.setRadius(percent);
  }
}

export const playerController = new PlayerController();
