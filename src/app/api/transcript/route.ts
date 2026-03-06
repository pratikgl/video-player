import { NextResponse } from "next/server";
import transcript from "../../../../public/transcript.json";

export async function GET() {
  return NextResponse.json(transcript);
}
