import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

const ALLOWED = new Set([180, 192, 512]);

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ size: string }> }
) {
  const { size: sizeStr } = await params;
  const size = parseInt(sizeStr, 10);
  if (!ALLOWED.has(size)) {
    return new Response("Not found", { status: 404 });
  }

  const ring = Math.round(size * 0.65);
  const void_ = Math.round(size * 0.45);
  const dot = Math.round(size * 0.12);

  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          background: "#1c1826",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: size * 0.22,
        }}
      >
        <div
          style={{
            width: ring,
            height: ring,
            borderRadius: "50%",
            background: "linear-gradient(220deg, #5248d0, #7a78e8, #5248d0)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: void_,
              height: void_,
              borderRadius: "50%",
              background: "#1c1826",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: dot,
                height: dot,
                borderRadius: "50%",
                background: "#f8f8ff",
              }}
            />
          </div>
        </div>
      </div>
    ),
    {
      width: size,
      height: size,
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Type": "image/png",
      },
    }
  );
}
