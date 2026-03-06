"use client";

import { getTranscript } from "@/lib/mediaApi";
import { useEffect, useState } from "react";

export default function Transcript() {
  const [words, setWords] = useState<any[]>([]);

  useEffect(() => {
    getTranscript().then((data) => {
      setWords(data.words);
    });
  }, []);

  return (
    <div className="text-sm leading-6">
      {words?.map((word, index) => (
        <span key={index} data-start={word.start} data-end={word.end}>
          {word.text}
        </span>
      ))}
    </div>
  );
}
