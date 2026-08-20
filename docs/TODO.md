# QR Shape Studio Roadmap & TODOs

This document tracks planned refinements and upcoming features for the project.

## High Priority Refinements

- [x] **Position/Finder Patterns (The "Eyes")**
  - **Issue:** Custom dot shapes (circles, diamonds, etc.) are currently applied uniformly to every module, breaking the 3 large corner position patterns into individual dots. This looks messy and can hurt scannability.
  - **Task:** Update the SVG renderer to detect the 7x7 corner modules.
  - **Task:** Add settings to let users define the shape of the eyes independently from the main data dots (e.g., solid squares, rounded corners, etc.).

- [x] **Input Debouncing for Performance**
  - **Issue:** Generating the QR code on every single keystroke causes UI stuttering for large inputs because `QRCode.create` is synchronous.
  - **Task:** Implement a debounce hook (e.g., 300ms) for the QR data input or the generation effect.

- [x] **Logo Plate Toggle**
  - **Issue:** The logo feature forces a colored background plate (`<rect>`) behind the logo image.
  - **Task:** Add a toggle in the UI to allow hiding the logo plate so transparent PNG logos can sit directly on the QR code.

## Future Enhancements

- [ ] **Gradient Support**
  - Add support for Linear and Radial gradients for the foreground color.
- [ ] **Distinct Eye Colors**
  - Add options to color the corner position patterns differently from the main dots.
- [ ] **Export Options**
  - Allow higher DPI scaling for PNG exports.
  - Add WebP/JPEG export options.
