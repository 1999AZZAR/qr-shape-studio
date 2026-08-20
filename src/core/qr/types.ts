export type ErrorCorrection = "L" | "M" | "Q" | "H";

export type DotShape = "square" | "rounded" | "circle" | "diamond" | "custom";

export interface CustomShape {
  path: string;
  viewBox: string;
}

export interface QRDotConfig {
  shape?: DotShape;
  finderShape?: DotShape;
  color?: string;
  custom?: CustomShape;
}

export type QRBackground =
  | {
      type: "none";
    }
  | {
      type: "colored";
      color: string;
    };

export interface QRExportConfig {
  background?: QRBackground;
  size?: number;
  margin?: number;
}

export interface QRLogoConfig {
  src: string;
  sizeRatio?: number;
  paddingRatio?: number;
  backgroundColor?: string;
  showPlate?: boolean;
}

export interface QRConfig {
  data: string;
  errorCorrection?: ErrorCorrection;
  dot?: QRDotConfig;
  export?: QRExportConfig;
  logo?: QRLogoConfig;
}

export interface ResolvedQRConfig {
  data: string;
  errorCorrection: ErrorCorrection;
  dot: {
    shape: DotShape;
    finderShape: DotShape;
    color: string;
    custom?: CustomShape;
  };
  export: {
    background: QRBackground;
    size: number;
    margin: number;
  };
  logo?: Required<QRLogoConfig>;
}

export interface QRResult {
  svg: string;
  size: number;
  modules: number;
  errorCorrection: ErrorCorrection;
}
