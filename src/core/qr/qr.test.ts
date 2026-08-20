import { describe, expect, it } from "vitest";
import { generateQRCode } from ".";

describe("generateQRCode", () => {
  it("renders transparent SVG when no background is requested", async () => {
    const result = await generateQRCode({
      data: "https://example.com",
      errorCorrection: "H",
      dot: { shape: "circle", color: "#111827" },
      export: { background: { type: "none" }, size: 512, margin: 4 },
    });

    expect(result.svg).toContain("<svg");
    expect(result.svg).toContain("<circle");
    expect(result.svg).not.toContain('width="512" height="512" fill=');
  });

  it("renders a colored background separately from the foreground group", async () => {
    const result = await generateQRCode({
      data: "AZZAR-QR",
      dot: { shape: "diamond", color: "#0F172A" },
      export: { background: { type: "colored", color: "#F8FAFC" }, size: 512, margin: 4 },
    });

    expect(result.svg).toContain('fill="#F8FAFC"');
    expect(result.svg).toContain('<g fill="#0F172A">');
    expect(result.svg).toContain("<path");
  });

  it("rejects custom SVG markup", async () => {
    await expect(
      generateQRCode({
        data: "unsafe",
        dot: {
          shape: "custom",
          color: "#111827",
          custom: {
            path: '<script>alert("x")</script>',
            viewBox: "0 0 1 1",
          },
        },
      }),
    ).rejects.toThrow("SVG path data only");
  });
});
