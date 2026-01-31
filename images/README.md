# Badge Generator Images

This folder contains all the images required for the badge generator functionality.

## Folder Structure

### `/backgrounds/`

Contains background images for badges:

-   `bg.png` - Main background image for the badge (recommended size: 595x421px)

### `/logos/`

Contains all logo images:

-   `logo_main.png` - Main event logo "Green Energy Technology Expo 2025" (recommended size: 140px width)
-   `logo_power_ethiopia.png` - Power Ethiopia logo (recommended size: 120px width)
-   `logo_egyg.png` - EGYG logo (recommended size: 60px height)
-   `logo_placeholder_blue.png` - Blue icon logo (recommended size: 60px height)

### `/icons/`

Contains icon images and other small graphics:

-   Additional icons and graphics as needed

## Image Requirements

### Background Image (`bg.png`)

-   Format: PNG (with transparency support)
-   Size: 595x421px (A4 width x calculated height)
-   Should be a green energy themed background

### Logo Images

-   Format: PNG (with transparency support)
-   High resolution for crisp printing
-   Transparent backgrounds preferred
-   Consistent styling and branding

## Usage

The badge generator automatically looks for these images in their respective folders. If an image is not found, the system will:

1. Log a warning message
2. Use fallback colors or skip the image
3. Continue badge generation

## Adding New Images

1. Place images in the appropriate subfolder
2. Update the `imagePaths` object in `badgeGenerator.ts` if adding new image types
3. Test badge generation to ensure proper display

## Notes

-   All images should be optimized for print quality
-   Consider file sizes for performance
-   Maintain consistent branding across all images
-   Test badge generation after adding or updating images

