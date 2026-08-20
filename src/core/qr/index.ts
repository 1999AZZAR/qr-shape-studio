import { encodeQRCode } from "./encoder";
import { renderQRCodeSvg } from "./svg";
import type { QRConfig, QRResult } from "./types";
import { resolveQRConfig } from "./validator";

export type {
  CustomShape,
  DotShape,
  ErrorCorrection,
  QRBackground,
  QRConfig,
  QRDotConfig,
  QRExportConfig,
  QRLogoConfig,
  QRResult,
} from "./types";

export async function generateQRCode(config: QRConfig): Promise<QRResult> {
  const resolved = resolveQRConfig(config);
  const modules = encodeQRCode(resolved.data, resolved.errorCorrection);

  return {
    svg: renderQRCodeSvg(modules, resolved),
    size: resolved.export.size,
    modules: modules.length,
    errorCorrection: resolved.errorCorrection,
  };
}
