"use client";

import { getTranscript } from "@/lib/mediaApi";
import { useEffect, useState } from "react";

import { videoController } from "@/lib/videoController";

export default function Transcript() {
  const [words, setWords] = useState<any[]>([]);

  useEffect(() => {
    getTranscript().then((data) => {
      setWords(data.words);
    });
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
    </div>
  );
}
