"use client";

import { getTranscript } from "@/lib/mediaApi";
import { useEffect, useRef, useState } from "react";
import { videoController } from "@/lib/videoController";
import { skipController } from "@/lib/skipController";
import TextSlashIcon from "../ui/TextSlashIcon";

export default function Transcript() {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeWordRef = useRef<Element | null>(null); // ✅ track currently highlighted word
  const [words, setWords] = useState<any[]>([]);
  const [selectionPos, setSelectionPos] = useState<{
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    getTranscript().then((data) => setWords(data.words));
  }, []);

  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection();

      if (!selection || selection.isCollapsed) {
        setSelectionPos(null);
        return;
      }

      const anchorNode = selection.anchorNode;
      if (!containerRef.current?.contains(anchorNode)) {
        setSelectionPos(null);
        return;
      }

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelectionPos({ x: rect.left + rect.width / 2, y: rect.top });
    };

    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, []);

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

      // ✅ Only scroll when the active word actually changes
      if (newActiveWord && newActiveWord !== activeWordRef.current) {
        activeWordRef.current = newActiveWord;
        (newActiveWord as Element).scrollIntoView({
          block: "nearest", // ✅ "nearest" avoids aggressive jumping
          behavior: "smooth",
        });
      }
    });
  }, [words]);

  function markSkipped(start: number, end: number) {
    document.querySelectorAll(".transcript-word").forEach((el) => {
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

    skipController.addSegment(start, end);
    markSkipped(start, end);
    selection.removeAllRanges();
  }

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

        {selectionPos && (
          <button
            style={{
              position: "fixed",
              top: selectionPos.y - 25,
              left: selectionPos.x,
            }}
            className="cursor-pointer flex bg-white border items-center gap-1 p-[6px] rounded shadow-lg text-[12px] hover:bg-gray-100"
            onClick={() => {
              handleSkipSelection();
              setSelectionPos(null);
            }}
          >
            <TextSlashIcon size={12} />
            <span className="leading-tight">Skip</span>
          </button>
        )}
      </div>
    </>
  );
}
