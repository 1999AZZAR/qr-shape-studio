import { Download, FileCode2, ImagePlus, RefreshCw, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  type DotShape,
  type ErrorCorrection,
  type QRBackground,
  generateQRCode,
} from "./core/qr";

const ERROR_LEVELS: Array<{ value: ErrorCorrection; label: string; detail: string }> = [
  { value: "L", label: "L", detail: "~7%" },
  { value: "M", label: "M", detail: "~15%" },
  { value: "Q", label: "Q", detail: "~25%" },
  { value: "H", label: "H", detail: "~30%" },
];

const DOT_SHAPES: Array<{ value: DotShape; label: string }> = [
  { value: "square", label: "Square" },
  { value: "rounded", label: "Rounded" },
  { value: "circle", label: "Circle" },
  { value: "diamond", label: "Diamond" },
  { value: "custom", label: "Custom" },
];

const CUSTOM_PRESET = {
  path: "M0.5 0 L1 0.5 L0.5 1 L0 0.5 Z",
  viewBox: "0 0 1 1",
};

const MAX_LOGO_BYTES = 1024 * 1024;

function downloadSvg(svg: string): void {
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "qr-shape-studio.svg";
  anchor.click();
  URL.revokeObjectURL(url);
}

function downloadPng(svg: string, size: number): void {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const img = new Image();
  img.onload = () => {
    ctx.drawImage(img, 0, 0, size, size);
    const pngUrl = canvas.toDataURL("image/png");
    const anchor = document.createElement("a");
    anchor.href = pngUrl;
    anchor.download = "qr-shape-studio.png";
    anchor.click();
  };
  const base64 = btoa(unescape(encodeURIComponent(svg)));
  img.src = "data:image/svg+xml;base64," + base64;
}

export function App() {
  const [data, setData] = useState("https://example.com/qr-shape-studio");
  const [errorCorrection, setErrorCorrection] = useState<ErrorCorrection>("H");
  const [shape, setShape] = useState<DotShape>("rounded");
  const [foreground, setForeground] = useState("#111827");
  const [backgroundMode, setBackgroundMode] = useState<QRBackground["type"]>("colored");
  const [backgroundColor, setBackgroundColor] = useState("#F8FAFC");
  const [size, setSize] = useState(1024);
  const [margin, setMargin] = useState(4);
  const [customPath, setCustomPath] = useState(CUSTOM_PRESET.path);
  const [customViewBox, setCustomViewBox] = useState(CUSTOM_PRESET.viewBox);
  const [logoSrc, setLogoSrc] = useState("");
  const [logoName, setLogoName] = useState("");
  const [logoSizeRatio, setLogoSizeRatio] = useState(20);
  const [logoPaddingRatio, setLogoPaddingRatio] = useState(28);
  const [logoBackgroundColor, setLogoBackgroundColor] = useState("#FFFFFF");
  const [svg, setSvg] = useState("");
  const [modules, setModules] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);

  const resetSettings = () => {
    setData("https://example.com/qr-shape-studio");
    setErrorCorrection("H");
    setShape("rounded");
    setForeground("#111827");
    setBackgroundMode("colored");
    setBackgroundColor("#F8FAFC");
    setSize(1024);
    setMargin(4);
    setCustomPath(CUSTOM_PRESET.path);
    setCustomViewBox(CUSTOM_PRESET.viewBox);
    setLogoSrc("");
    setLogoName("");
    setLogoSizeRatio(20);
    setLogoPaddingRatio(28);
    setLogoBackgroundColor("#FFFFFF");
    setLogoError(null);
  };

  const handleLogoUpload = (file: File | undefined) => {
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setLogoError("Logo file must be an image");
      return;
    }

    if (file.size > MAX_LOGO_BYTES) {
      setLogoError("Logo image must be 1 MB or smaller");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setLogoSrc(String(reader.result));
      setLogoName(file.name);
      setLogoError(null);
      setErrorCorrection("H");
    };
    reader.onerror = () => setLogoError("Unable to read logo image");
    reader.readAsDataURL(file);
  };

  const qrConfig = useMemo(
    () => ({
      data,
      errorCorrection,
      dot: {
        shape,
        color: foreground,
        custom:
          shape === "custom"
            ? {
                path: customPath,
                viewBox: customViewBox,
              }
            : undefined,
      },
      export: {
        background:
          backgroundMode === "none"
            ? ({ type: "none" } as const)
            : ({ type: "colored", color: backgroundColor } as const),
        size,
        margin,
      },
      logo: logoSrc
        ? {
            src: logoSrc,
            sizeRatio: logoSizeRatio / 100,
            paddingRatio: logoPaddingRatio / 100,
            backgroundColor: logoBackgroundColor,
          }
        : undefined,
    }),
    [
      backgroundColor,
      backgroundMode,
      customPath,
      customViewBox,
      data,
      errorCorrection,
      foreground,
      logoBackgroundColor,
      logoPaddingRatio,
      logoSizeRatio,
      logoSrc,
      margin,
      shape,
      size,
    ],
  );

  useEffect(() => {
    let cancelled = false;

    generateQRCode(qrConfig)
      .then((result) => {
        if (cancelled) {
          return;
        }
        setSvg(result.svg);
        setModules(result.modules);
        setError(null);
      })
      .catch((unknownError: unknown) => {
        if (cancelled) {
          return;
        }
        setError(unknownError instanceof Error ? unknownError.message : "Unable to generate QR code");
      });

    return () => {
      cancelled = true;
    };
  }, [qrConfig]);

  return (
    <main className="app-shell">
      <section className="workspace" aria-labelledby="page-title">
        <header className="topbar">
          <div>
            <p className="eyebrow">Workspace / QR Generator</p>
            <h1 id="page-title">QR Shape Studio</h1>
          </div>
          <button className="icon-button" type="button" aria-label="Reset settings" onClick={resetSettings}>
            <RefreshCw size={18} aria-hidden="true" />
          </button>
        </header>

        <div className="layout">
          <form className="panel controls" aria-label="QR generator settings">
            <div className="section-index">
              <span>01</span>
              <p>Configuration record</p>
            </div>

            <div className="field-group">
              <label htmlFor="qr-data">Content</label>
              <textarea
                id="qr-data"
                value={data}
                onChange={(event) => setData(event.target.value)}
                rows={4}
                spellCheck={false}
              />
            </div>

            <fieldset className="field-group">
              <legend>Error correction</legend>
              <div className="segmented four">
                {ERROR_LEVELS.map((level) => (
                  <button
                    aria-pressed={errorCorrection === level.value}
                    className={errorCorrection === level.value ? "active" : ""}
                    key={level.value}
                    onClick={() => setErrorCorrection(level.value)}
                    type="button"
                  >
                    <span>{level.label}</span>
                    <small>{level.detail}</small>
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="field-group">
              <legend>Dot shape</legend>
              <div className="shape-grid">
                {DOT_SHAPES.map((option) => (
                  <button
                    aria-pressed={shape === option.value}
                    className={shape === option.value ? "shape-card active" : "shape-card"}
                    key={option.value}
                    onClick={() => setShape(option.value)}
                    type="button"
                  >
                    <span className={`shape-swatch ${option.value}`} aria-hidden="true" />
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            {shape === "custom" ? (
              <div className="custom-box">
                <div className="field-group">
                  <label htmlFor="custom-path">Custom SVG path</label>
                  <textarea
                    id="custom-path"
                    value={customPath}
                    onChange={(event) => setCustomPath(event.target.value)}
                    rows={3}
                    spellCheck={false}
                  />
                </div>
                <div className="field-row">
                  <div className="field-group">
                    <label htmlFor="custom-viewbox">ViewBox</label>
                    <input
                      id="custom-viewbox"
                      value={customViewBox}
                      onChange={(event) => setCustomViewBox(event.target.value)}
                    />
                  </div>
                </div>
              </div>
            ) : null}

            <div className="field-row">
              <div className="field-group color-field">
                <label htmlFor="foreground">Foreground</label>
                <input
                  id="foreground"
                  type="color"
                  value={foreground}
                  onChange={(event) => setForeground(event.target.value)}
                />
                <code>{foreground}</code>
              </div>
              <div className="field-group">
                <label htmlFor="size">Size</label>
                <input
                  id="size"
                  type="number"
                  min="128"
                  max="4096"
                  step="128"
                  value={size}
                  onChange={(event) => setSize(event.target.valueAsNumber)}
                />
              </div>
              <div className="field-group">
                <label htmlFor="margin">Margin</label>
                <input
                  id="margin"
                  type="number"
                  min="0"
                  max="16"
                  value={margin}
                  onChange={(event) => setMargin(event.target.valueAsNumber)}
                />
              </div>
            </div>

            <fieldset className="field-group">
              <legend>Export background</legend>
              <div className="segmented two">
                <button
                  aria-pressed={backgroundMode === "none"}
                  className={backgroundMode === "none" ? "active" : ""}
                  onClick={() => setBackgroundMode("none")}
                  type="button"
                >
                  Transparent
                </button>
                <button
                  aria-pressed={backgroundMode === "colored"}
                  className={backgroundMode === "colored" ? "active" : ""}
                  onClick={() => setBackgroundMode("colored")}
                  type="button"
                >
                  Colored
                </button>
              </div>
            </fieldset>

            {backgroundMode === "colored" ? (
              <div className="field-group color-field">
                <label htmlFor="background">Background</label>
                <input
                  id="background"
                  type="color"
                  value={backgroundColor}
                  onChange={(event) => setBackgroundColor(event.target.value)}
                />
                <code>{backgroundColor}</code>
              </div>
            ) : null}

            <fieldset className="field-group logo-fieldset">
              <legend>Center logo</legend>
              <label className="upload-target" htmlFor="logo-upload">
                <ImagePlus size={18} aria-hidden="true" />
                <span>{logoName || "Upload logo / icon"}</span>
                <input
                  accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                  id="logo-upload"
                  type="file"
                  onChange={(event) => handleLogoUpload(event.target.files?.[0])}
                />
              </label>
              {logoError ? (
                <p className="inline-error" role="alert">
                  {logoError}
                </p>
              ) : null}
              {logoSrc ? (
                <div className="logo-controls">
                  <div className="logo-preview">
                    <img alt="" src={logoSrc} />
                  </div>
                  <div className="logo-sliders">
                    <div className="field-group">
                      <label htmlFor="logo-size">Logo size</label>
                      <input
                        id="logo-size"
                        max="32"
                        min="8"
                        type="range"
                        value={logoSizeRatio}
                        onChange={(event) => setLogoSizeRatio(event.target.valueAsNumber)}
                      />
                      <code>{logoSizeRatio}%</code>
                    </div>
                    <div className="field-group">
                      <label htmlFor="logo-padding">Clear space</label>
                      <input
                        id="logo-padding"
                        max="80"
                        min="0"
                        type="range"
                        value={logoPaddingRatio}
                        onChange={(event) => setLogoPaddingRatio(event.target.valueAsNumber)}
                      />
                      <code>{logoPaddingRatio}%</code>
                    </div>
                    <div className="field-group color-field">
                      <label htmlFor="logo-background">Logo plate</label>
                      <input
                        id="logo-background"
                        type="color"
                        value={logoBackgroundColor}
                        onChange={(event) => setLogoBackgroundColor(event.target.value)}
                      />
                      <code>{logoBackgroundColor}</code>
                    </div>
                  </div>
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => {
                      setLogoSrc("");
                      setLogoName("");
                      setLogoError(null);
                    }}
                  >
                    <X size={16} aria-hidden="true" />
                    Remove logo
                  </button>
                </div>
              ) : null}
            </fieldset>
          </form>

          <section className="panel preview-panel" aria-label="QR code preview">
            <div className="section-index">
              <span>02</span>
              <p>Output specimen</p>
            </div>

            <div className="preview-toolbar">
              <div>
                <p className="eyebrow">Live Preview</p>
                <h2>{modules ? `${modules} x ${modules} modules` : "Waiting for input"}</h2>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="primary-button" type="button" disabled={!svg || !!error} onClick={() => downloadSvg(svg)}>
                  <Download size={18} aria-hidden="true" />
                  Export SVG
                </button>
                <button className="primary-button" type="button" disabled={!svg || !!error} onClick={() => downloadPng(svg, size)}>
                  <ImagePlus size={18} aria-hidden="true" />
                  Export PNG
                </button>
              </div>
            </div>

            <div className={backgroundMode === "none" ? "preview transparent" : "preview"}>
              {error ? (
                <div className="error-state" role="alert">
                  {error}
                </div>
              ) : (
                <div className="svg-frame" dangerouslySetInnerHTML={{ __html: svg }} />
              )}
            </div>

            <details className="code-drawer">
              <summary>
                <FileCode2 size={16} aria-hidden="true" />
                SVG source
              </summary>
              <pre>{svg}</pre>
            </details>
          </section>
        </div>
      </section>
    </main>
  );
}
