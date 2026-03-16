import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = { width: 48, height: 48 };
export const contentType = "image/png";

export default async function Icon() {
  const logoPath = join(process.cwd(), "public", "logo", "sygnet-header.png");
  const buffer = await readFile(logoPath);
  const dataUrl = `data:image/png;base64,${buffer.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
          padding: "2px",
        }}
      >
        <img
          src={dataUrl}
          alt=""
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
