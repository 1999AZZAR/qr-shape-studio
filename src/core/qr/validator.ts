import type { CustomShape, DotShape, QRConfig, ResolvedQRConfig } from "./types";

const DEFAULTS = {
  errorCorrection: "M",
  dotShape: "square",
  foreground: "#111827",
  size: 1024,
  margin: 4,
  logoSizeRatio: 0.2,
  logoPaddingRatio: 0.28,
  logoBackground: "#FFFFFF",
} as const;

const ERROR_CORRECTION = new Set(["L", "M", "Q", "H"]);
const DOT_SHAPES = new Set(["square", "rounded", "circle", "diamond", "custom"]);
const PATH_DATA_PATTERN = /^[MmZzLlHhVvCcSsQqTtAa0-9,.\-+\sEe]+$/;

function assertHexColor(value: string, field: string): void {
  if (!/^#[0-9a-fA-F]{6}$/.test(value)) {
    throw new Error(`${field} must be a valid 6-digit hexadecimal color`);
  }
}

function assertPositiveInteger(value: number, field: string, min: number, max: number): void {
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new Error(`${field} must be an integer between ${min} and ${max}`);
  }
}

function assertRatio(value: number, field: string, min: number, max: number): void {
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new Error(`${field} must be a number between ${min} and ${max}`);
  }
}

function validateCustomShape(custom: CustomShape): void {
  if (!custom.path.trim()) {
    throw new Error("dot.custom.path must not be empty");
  }

  if (!PATH_DATA_PATTERN.test(custom.path)) {
    throw new Error("dot.custom.path must contain SVG path data only");
  }

  const viewBox = custom.viewBox.trim().split(/\s+/).map(Number);

  if (viewBox.length !== 4 || viewBox.some((value) => !Number.isFinite(value))) {
    throw new Error("dot.custom.viewBox must contain four numeric values");
  }

  if (viewBox[2] <= 0 || viewBox[3] <= 0) {
    throw new Error("dot.custom.viewBox width and height must be positive");
  }
}

export function resolveQRConfig(config: QRConfig): ResolvedQRConfig {
  if (!config || typeof config !== "object") {
    throw new Error("QR configuration is required");
  }

  if (typeof config.data !== "string" || config.data.trim().length === 0) {
    throw new Error("data must be a non-empty string");
  }

  const errorCorrection = config.errorCorrection ?? DEFAULTS.errorCorrection;
  if (!ERROR_CORRECTION.has(errorCorrection)) {
    throw new Error("errorCorrection must be L, M, Q, or H");
  }

  const shape = config.dot?.shape ?? DEFAULTS.dotShape;
  if (!DOT_SHAPES.has(shape)) {
    throw new Error("dot.shape must be square, rounded, circle, diamond, or custom");
  }

  const foreground = config.dot?.color ?? DEFAULTS.foreground;
  assertHexColor(foreground, "dot.color");

  if (shape === "custom") {
    if (!config.dot?.custom) {
      throw new Error("dot.custom is required when shape is custom");
    }
    validateCustomShape(config.dot.custom);
  }

  const background = config.export?.background ?? { type: "none" as const };
  if (background.type === "colored") {
    assertHexColor(background.color, "export.background.color");
  }

  const size = config.export?.size ?? DEFAULTS.size;
  const margin = config.export?.margin ?? DEFAULTS.margin;
  const logo = config.logo
    ? {
        src: config.logo.src,
        sizeRatio: config.logo.sizeRatio ?? DEFAULTS.logoSizeRatio,
        paddingRatio: config.logo.paddingRatio ?? DEFAULTS.logoPaddingRatio,
        backgroundColor: config.logo.backgroundColor ?? DEFAULTS.logoBackground,
        showPlate: config.logo.showPlate ?? true,
      }
    : undefined;

  assertPositiveInteger(size, "export.size", 128, 4096);
  assertPositiveInteger(margin, "export.margin", 0, 16);

  if (logo) {
    if (!/^data:image\/(?:png|jpeg|jpg|webp|gif|svg\+xml);base64,[A-Za-z0-9+/=]+$/.test(logo.src)) {
      throw new Error("logo.src must be a base64 image data URL");
    }

    assertRatio(logo.sizeRatio, "logo.sizeRatio", 0.08, 0.32);
    assertRatio(logo.paddingRatio, "logo.paddingRatio", 0, 0.8);
    assertHexColor(logo.backgroundColor, "logo.backgroundColor");
  }

  return {
    data: config.data,
    errorCorrection,
    dot: {
      shape: shape as DotShape,
      finderShape: (config.dot?.finderShape ?? shape) as DotShape,
      color: foreground,
      custom: config.dot?.custom,
    },
    export: {
      background,
      size,
      margin,
    },
    logo,
  };
}
