import type { CustomShape, DotShape, ResolvedQRConfig } from "./types";

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function renderModule(
  shape: DotShape,
  x: number,
  y: number,
  size: number,
  custom?: CustomShape,
): string {
  switch (shape) {
    case "square":
      return `<rect x="${x}" y="${y}" width="${size}" height="${size}"/>`;
    case "rounded":
      return `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${size * 0.28}" ry="${size * 0.28}"/>`;
    case "circle":
      return `<circle cx="${x + size / 2}" cy="${y + size / 2}" r="${size / 2}"/>`;
    case "diamond": {
      const centerX = x + size / 2;
      const centerY = y + size / 2;
      return `<path d="M ${centerX} ${y} L ${x + size} ${centerY} L ${centerX} ${y + size} L ${x} ${centerY} Z"/>`;
    }
    case "custom": {
      if (!custom) {
        throw new Error("Custom shape definition is missing");
      }

      const [minX, minY, width, height] = custom.viewBox.trim().split(/\s+/).map(Number);
      const scaleX = size / width;
      const scaleY = size / height;
      return `<path d="${escapeXml(custom.path)}" transform="translate(${x} ${y}) scale(${scaleX} ${scaleY}) translate(${-minX} ${-minY})"/>`;
    }
    default:
      throw new Error(`Unsupported dot shape: ${shape satisfies never}`);
  }
}

export function renderQRCodeSvg(modules: boolean[][], config: ResolvedQRConfig): string {
  const moduleCount = modules.length;
  const { background, margin, size } = config.export;
  const moduleSize = size / (moduleCount + margin * 2);
  const offset = margin * moduleSize;
  const parts: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="Generated QR code" shape-rendering="geometricPrecision">`,
    "<title>Generated QR code</title>",
  ];

  if (background.type === "colored") {
    parts.push(`<rect x="0" y="0" width="${size}" height="${size}" fill="${escapeXml(background.color)}"/>`);
  }

  parts.push(`<g fill="${escapeXml(config.dot.color)}">`);

  for (let row = 0; row < moduleCount; row += 1) {
    for (let column = 0; column < moduleCount; column += 1) {
      if (!modules[row][column]) {
        continue;
      }

      parts.push(
        renderModule(
          config.dot.shape,
          offset + column * moduleSize,
          offset + row * moduleSize,
          moduleSize,
          config.dot.custom,
        ),
      );
    }
  }

  parts.push("</g>");

  if (config.logo) {
    const logoSize = size * config.logo.sizeRatio;
    const logoPadding = logoSize * config.logo.paddingRatio;
    const logoPlateSize = logoSize + logoPadding * 2;
    const logoPlatePosition = (size - logoPlateSize) / 2;
    const logoPosition = (size - logoSize) / 2;
    const logoRadius = logoPlateSize * 0.08;

    parts.push(
      `<rect x="${logoPlatePosition}" y="${logoPlatePosition}" width="${logoPlateSize}" height="${logoPlateSize}" rx="${logoRadius}" ry="${logoRadius}" fill="${escapeXml(config.logo.backgroundColor)}"/>`,
      `<image href="${escapeXml(config.logo.src)}" x="${logoPosition}" y="${logoPosition}" width="${logoSize}" height="${logoSize}" preserveAspectRatio="xMidYMid meet"/>`,
    );
  }

  parts.push("</svg>");
  return parts.join("");
}
