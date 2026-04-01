import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = { width: 48, height: 48 };
export const contentType = "image/png";

/** Tab favicon — burgundy + cream “c” (matches brand). */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#250d18",
          color: "#f2edeb",
          fontSize: 30,
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontStyle: "italic",
          fontWeight: 400,
        }}
      >
        c
      </div>
    ),
    { ...size },
  );
}
