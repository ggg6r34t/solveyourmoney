import { NextRequest, NextResponse } from "next/server";
import { getOptionalSession } from "@/server/dal/session";
import { parseBankStatement } from "@/lib/import/parseBankStatement";

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB
const MIN_TEXT_LENGTH = 50;
const PDF_MAGIC = Buffer.from([0x25, 0x50, 0x44, 0x46]); // %PDF

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

  // Enforce size limit on actual bytes (client-reported size can be spoofed)
  if (buffer.byteLength > MAX_FILE_BYTES) {
    return NextResponse.json(
      { error: "File too large. Maximum size is 10 MB." },
      { status: 413 },
    );
  }

  // Verify PDF magic bytes (%PDF) to reject renamed non-PDF files
  if (buffer.length < 4 || !buffer.slice(0, 4).equals(PDF_MAGIC)) {
    return NextResponse.json(
      { error: "Only PDF files are supported" },
      { status: 415 },
    );
  }

  // pdfjs-dist (used internally by pdf-parse) tries to initialise canvas globals at module load.
  // Stub them out before requiring so text extraction works without a canvas installation.
  const g = globalThis as Record<string, unknown>;
  if (!g.DOMMatrix) g.DOMMatrix = class {};
  if (!g.ImageData) g.ImageData = class {};
  if (!g.Path2D) g.Path2D = class {};

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require("pdf-parse") as (
    buffer: Buffer,
  ) => Promise<{ text: string }>;

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

  let transactions: ReturnType<typeof parseBankStatement>;
  try {
    transactions = parseBankStatement(parsed.text);
  } catch {
    return NextResponse.json(
      {
        error:
          "We couldn't read transactions from this file. Try a different export format.",
      },
      { status: 422 },
    );
  }

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
