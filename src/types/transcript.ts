export interface Word {
  text: string;
  start: number;
  end: number;
  type?: string;
}

export interface Transcript {
  text: string;
  words: Word[];
}
