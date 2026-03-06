"use client";

import { getTranscript } from "@/lib/mediaApi";
import { useEffect, useRef, useState, useCallback } from "react";
import { videoController } from "@/lib/videoController";
import { skipController } from "@/lib/skipController";
import TextSlashIcon from "../ui/TextSlashIcon";
import { Word } from "@/types/transcript";
import TextIcon from "../ui/TextIcon";

type Segment = { start: number; end: number };

/** Subtract [removeStart, removeEnd] from a list of segments (may split one). */
function subtractSegment(
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
function addSegment(segments: Segment[], newSeg: Segment): Segment[] {
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
function isFullyCovered(
  segments: Segment[],
  selStart: number,
  selEnd: number,
): boolean {
  return segments.some((s) => s.start <= selStart && s.end >= selEnd);
}

/** Returns true if [selStart, selEnd] has ANY overlap with the skipped segments. */
function hasAnyOverlap(
  segments: Segment[],
  selStart: number,
  selEnd: number,
): boolean {
  return segments.some((s) => s.start < selEnd && s.end > selStart);
}

export default function Transcript() {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeWordRef = useRef<Element | null>(null);
  const [words, setWords] = useState<Word[]>([]);
  const [skippedSegments, setSkippedSegments] = useState<Segment[]>([]);
  const [selectionPos, setSelectionPos] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [selectionRange, setSelectionRange] = useState<Segment | null>(null);
  const [selectionMode, setSelectionMode] = useState<
    "skip" | "unskip" | "mixed" | null
  >(null);

  useEffect(() => {
    getTranscript().then((data) => setWords(data.words));
  }, []);

  // Re-apply skip styling whenever skippedSegments changes
  useEffect(() => {
    if (!words.length) return;

    document.querySelectorAll(".transcript-word").forEach((el) => {
      const s = Number(el.getAttribute("data-start"));
      const e = Number(el.getAttribute("data-end"));
      const isSkipped = skippedSegments.some(
        (seg) => s >= seg.start && e <= seg.end,
      );
      el.classList.toggle("line-through", isSkipped);
      el.classList.toggle("opacity-50", isSkipped);
    });
  }, [skippedSegments, words]);

  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        setSelectionPos(null);
        setSelectionRange(null);
        setSelectionMode(null);
        return;
      }

      const anchorNode = selection.anchorNode;
      if (!containerRef.current?.contains(anchorNode)) {
        setSelectionPos(null);
        setSelectionRange(null);
        setSelectionMode(null);
        return;
      }

      const range = selection.getRangeAt(0);

      // Resolve start/end word elements
      const startEl = getWordElement(range.startContainer);
      const endEl = getWordElement(range.endContainer);
      if (!startEl || !endEl) return;

      const start = Number(startEl.getAttribute("data-start"));
      const end = Number(endEl.getAttribute("data-end"));
      if (isNaN(start) || isNaN(end)) return;

      const rect = range.getBoundingClientRect();
      setSelectionPos({ x: rect.left + rect.width / 2, y: rect.top });
      setSelectionRange({ start, end });

      // Determine what button(s) to show
      const fullyCovered = isFullyCovered(skippedSegments, start, end);
      const anyOverlap = hasAnyOverlap(skippedSegments, start, end);

      if (fullyCovered) {
        setSelectionMode("unskip");
      } else if (anyOverlap) {
        setSelectionMode("mixed"); // partly skipped — offer both
      } else {
        setSelectionMode("skip");
      }
    };

    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, [skippedSegments]);

  useEffect(() => {
    if (!words.length) return;
    const wordEls = document.querySelectorAll(".transcript-word");

    videoController.subscribe((time) => {
      let newActiveWord: Element | null = null;

      wordEls.forEach((word) => {
        const start = Number(word.getAttribute("data-start"));
        const end = Number(word.getAttribute("data-end"));

        if (time >= start && time <= end) {
          word.classList.add("bg-[#FAEBFF]", "rounded");
          newActiveWord = word;
        } else {
          word.classList.remove("bg-[#FAEBFF]", "rounded");
        }
      });

      if (newActiveWord && newActiveWord !== activeWordRef.current) {
        activeWordRef.current = newActiveWord;
        (newActiveWord as Element).scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    });
  }, [words]);

  function getWordElement(node: Node | null): HTMLElement | null {
    let el = node as HTMLElement | null;
    while (el && !el.classList?.contains("transcript-word")) {
      el = el.parentElement;
    }
    return el;
  }

  const handleSkip = useCallback(() => {
    if (!selectionRange) return;
    const { start, end } = selectionRange;

    skipController.addSegment(start, end);
    setSkippedSegments((prev) => addSegment(prev, { start, end }));

    window.getSelection()?.removeAllRanges();
    setSelectionPos(null);
    setSelectionRange(null);
    setSelectionMode(null);
  }, [selectionRange]);

  const handleUnskip = useCallback(() => {
    if (!selectionRange) return;
    const { start, end } = selectionRange;

    // Tell skipController to remove this range (add removeSegment if not present,
    // or recompute from the new local state and reset all segments)
    setSkippedSegments((prev) => {
      const next = subtractSegment(prev, start, end);
      skipController.setSegments(next);
      return next;
    });

    window.getSelection()?.removeAllRanges();
    setSelectionPos(null);
    setSelectionRange(null);
    setSelectionMode(null);
  }, [selectionRange]);

  return (
    <>
      <style>{`
        .transcript-container ::selection {
          background-color: #FFFAEB;
          text-decoration: underline;
          text-decoration-color: #FFC903;
          text-underline-offset: 2px;
        }
      `}</style>

      <div
        ref={containerRef}
        className="transcript-container text-sm leading-6 mr-3"
      >
        {words.map((word, index) => (
          <span
            key={index}
            data-start={word.start}
            data-end={word.end}
            data-index={index}
            className="transcript-word py-1"
            onClick={() => videoController.seek(word.start)}
          >
            {word.text}
          </span>
        ))}

        {selectionPos && selectionMode && (
          <div
            style={{
              position: "fixed",
              top: selectionPos.y - 36,
              left: selectionPos.x,
              transform: "translateX(-50%)",
              zIndex: 50,
            }}
            className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg shadow-lg p-1"
          >
            {(selectionMode === "skip" || selectionMode === "mixed") && (
              <button
                className="cursor-pointer flex items-center gap-1 px-2 py-1 rounded-md text-[12px] text-red-600 hover:bg-red-50 transition-colors"
                onClick={handleSkip}
              >
                <TextSlashIcon color="red" size={12} />
                <span className="leading-tight">Skip</span>
              </button>
            )}

            {selectionMode === "mixed" && (
              <div className="w-px h-4 bg-gray-200" />
            )}

            {(selectionMode === "unskip" || selectionMode === "mixed") && (
              <button
                className="cursor-pointer flex items-center gap-1 px-2 py-1 rounded-md text-[12px] text-green-800 hover:bg-green-50 transition-colors"
                onClick={handleUnskip}
              >
                <TextIcon color="green" size={12} />
                <span className="leading-tight">Unskip</span>
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
