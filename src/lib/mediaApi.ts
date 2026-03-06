export async function getMedia() {
  const res = await fetch("/api/media");
  return res.json();
}

export async function getTranscript() {
  const res = await fetch("/api/transcript");
  return res.json();
}
