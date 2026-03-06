type Segment = {
  start: number;
  end: number;
};

class SkipController {
  private segments: Segment[] = [];

  addSegment(start: number, end: number) {
    this.segments.push({ start, end });
  }

  /** Replace all segments at once (used after unskip recalculation). */
  setSegments(segments: Segment[]) {
    this.segments = [...segments];
  }

  clearSegments() {
    this.segments = [];
  }

  getSegments() {
    return this.segments;
  }
}

export const skipController = new SkipController();
