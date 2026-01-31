# QR Code Generation for Sponsor Page

This directory contains scripts to generate QR codes for the Green Energy Event sponsor page.

## Generated Files

-   `sponsor-qr-code.png` - The QR code image file
-   `sponsor-url.txt` - Text file containing the URL for reference
-   `sponsor-qr-display.html` - HTML page to display the QR code

## How to Generate QR Code

### Method 1: Using npm script (Recommended)

```bash
npm run generate:sponsor-qr
```

### Method 2: Using Node.js directly

```bash
node scripts/generate-sponsor-qr.js
```

### Method 3: Using TypeScript

```bash
npx ts-node src/scripts/generateSponsorQR.ts
```

## QR Code Details

-   **URL**: https://green-energy.powerethio.com/sponsor
-   **Format**: PNG
-   **Size**: 300x300 pixels
-   **Error Correction**: Medium (M)
-   **Colors**: Black QR code on white background

## Usage

1. **Print the QR code**: Use the generated PNG file for printing on materials
2. **Digital display**: Open `sponsor-qr-display.html` in a web browser
3. **Integration**: Include the QR code in presentations, flyers, or digital displays

## Customization

To modify the QR code generation, edit the following files:

-   `src/scripts/generateSponsorQR.ts` - TypeScript version
-   `scripts/generate-sponsor-qr.js` - JavaScript version

### Customizable Options:

-   URL (change `sponsorUrl` variable)
-   Size (modify `width` in `qrOptions`)
-   Colors (update `color` object in `qrOptions`)
-   Error correction level (change `errorCorrectionLevel`)

## Dependencies

The QR code generation uses the `qrcode` npm package, which is already installed in this project.

## Output Location

All generated files are saved to the `public/` directory:

-   `public/sponsor-qr-code.png`
-   `public/sponsor-url.txt`
-   `public/sponsor-qr-display.html`
