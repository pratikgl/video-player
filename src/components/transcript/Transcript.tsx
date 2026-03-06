"use client";

import { getTranscript } from "@/lib/mediaApi";
import { useEffect, useState } from "react";

import { videoController } from "@/lib/videoController";
import { skipController } from "@/lib/skipController";

export default function Transcript() {
  const [words, setWords] = useState<any[]>([]);
  const [selectionPos, setSelectionPos] = useState<{
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    getTranscript().then((data) => {
      setWords(data.words);
    });
  }, []);

  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection();

      if (!selection || selection.isCollapsed) {
        setSelectionPos(null);
        return;
      }

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      setSelectionPos({
        x: rect.left + rect.width / 2,
        y: rect.top,
      });
    };

    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  useEffect(() => {
    if (!words.length) return;
    const wordEls = document.querySelectorAll(".transcript-word");

    videoController.subscribe((time) => {
      wordEls.forEach((word) => {
        const start = Number(word.getAttribute("data-start"));
        const end = Number(word.getAttribute("data-end"));

        if (time >= start && time <= end) {
          word.classList.add("bg-yellow-200", "rounded");
          word.scrollIntoView({
            block: "center",
            behavior: "smooth",
          });
        } else {
          word.classList.remove("bg-yellow-200", "rounded");
        }
      });
    });
  }, [words]);

  function markSkipped(start: number, end: number) {
    const words = document.querySelectorAll(".transcript-word");

    words.forEach((el) => {
      const s = Number(el.getAttribute("data-start"));
      const e = Number(el.getAttribute("data-end"));

      if (s >= start && e <= end) {
        el.classList.add("line-through", "opacity-50");
      }
    });
  }

  function getWordElement(node: Node | null): HTMLElement | null {
    let el = node as HTMLElement | null;

    while (el && !el.classList?.contains("transcript-word")) {
      el = el.parentElement;
    }

    return el;
  }

  function handleSkipSelection() {
    const selection = window.getSelection();

    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);

    const startEl = getWordElement(range.startContainer);
    const endEl = getWordElement(range.endContainer);

    if (!startEl || !endEl) return;

    const start = Number(startEl.getAttribute("data-start"));
    const end = Number(endEl.getAttribute("data-end"));

    if (isNaN(start) || isNaN(end)) return;

    console.log("Skipping:", start, end);

    skipController.addSegment(start, end);

    markSkipped(start, end);

    selection.removeAllRanges();
  }

  return (
    <div className="text-sm leading-6">
      {words.map((word, index) => (
        <span
          key={index}
          data-start={word.start}
          data-end={word.end}
          data-index={index}
          className="transcript-word"
          onClick={() => videoController.seek(word.start)}
        >
          {word.text}
        </span>
      ))}
      {selectionPos && (
        <button
          style={{
            position: "fixed",
            top: selectionPos.y - 40,
            left: selectionPos.x,
            transform: "translateX(-50%)",
          }}
          className="bg-red-500 text-white px-3 py-1 rounded shadow-lg text-sm"
          onClick={() => {
            handleSkipSelection();
            setSelectionPos(null); // hide after skipping
          }}
        >
          Skip Selection
        </button>
      )}
    </div>
  );
}
