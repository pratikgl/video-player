type Segment = {
  start: number;
  end: number;
};

class SkipController {
  private segments: Segment[] = [];

  addSegment(start: number, end: number) {
    this.segments.push({ start, end });
  }

  getSegments() {
    return this.segments;
  }
}

export const skipController = new SkipController();
