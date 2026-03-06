import { Segment } from "@/types/transcript";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Subtract [removeStart, removeEnd] from a list of segments (may split one). */
export function subtractSegment(
  segments: Segment[],
  removeStart: number,
  removeEnd: number,
): Segment[] {
  const result: Segment[] = [];
  for (const seg of segments) {
    if (removeEnd <= seg.start || removeStart >= seg.end) {
      result.push(seg);
      continue;
    }
    if (seg.start < removeStart) {
      result.push({ start: seg.start, end: removeStart });
    }
    if (seg.end > removeEnd) {
      result.push({ start: removeEnd, end: seg.end });
    }
  }
  return result;
}

/** Merge a new segment into the list and collapse any overlaps. */
export function addSegment(segments: Segment[], newSeg: Segment): Segment[] {
  const merged = [...segments, newSeg].sort((a, b) => a.start - b.start);
  const result: Segment[] = [];
  for (const seg of merged) {
    if (result.length && seg.start <= result[result.length - 1].end) {
      result[result.length - 1].end = Math.max(
        result[result.length - 1].end,
        seg.end,
      );
    } else {
      result.push({ ...seg });
    }
  }
  return result;
}

/** Returns true if [selStart, selEnd] is fully covered by any segment in the list. */
export function isFullyCovered(
  segments: Segment[],
  selStart: number,
  selEnd: number,
): boolean {
  return segments.some((s) => s.start <= selStart && s.end >= selEnd);
}

/** Returns true if [selStart, selEnd] has ANY overlap with the skipped segments. */
export function hasAnyOverlap(
  segments: Segment[],
  selStart: number,
  selEnd: number,
): boolean {
  return segments.some((s) => s.start < selEnd && s.end > selStart);
}
