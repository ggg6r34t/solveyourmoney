import { NextRequest, NextResponse } from "next/server";
import { parseBankStatement } from "@/lib/import/parseBankStatement";

// pdf-parse ships a CommonJS bundle without a default ESM export; use require
const pdfParse = require("pdf-parse") as (
  buffer: Buffer,
) => Promise<{ text: string }>;
import { getOptionalSession } from "@/server/dal/session";

export const runtime = "nodejs";

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB
const MIN_TEXT_LENGTH = 50;

export async function POST(request: NextRequest) {
  const session = await getOptionalSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  if (file.type !== "application/pdf") {
    return NextResponse.json(
      { error: "Only PDF files are supported" },
      { status: 415 },
    );
  }

  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json(
      { error: "File too large. Maximum size is 10 MB." },
      { status: 413 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let parsed: { text: string };
  try {
    parsed = await pdfParse(buffer);
  } catch {
    return NextResponse.json(
      { error: "Could not read this PDF file." },
      { status: 422 },
    );
  }

  if (!parsed.text || parsed.text.trim().length < MIN_TEXT_LENGTH) {
    return NextResponse.json(
      {
        error:
          "This looks like a scanned PDF. Please download your statement as a digital export from your bank's website.",
      },
      { status: 422 },
    );
  }

  const transactions = parseBankStatement(parsed.text);

  if (transactions.length === 0) {
    return NextResponse.json(
      {
        error:
          "We couldn't read transactions from this file. Try a different export format.",
      },
      { status: 422 },
    );
  }

  return NextResponse.json({ transactions });
}
