# Badge Preview Scripts

These scripts allow you to generate and preview badge PDFs before sending them to users.

## Quick Start

### 1. Generate Sample Badges
```bash
npm run preview:badges
```
This will generate sample badges for all user types (Attendee, Exhibitor, Sponsor) using default test data.

### 2. Advanced Preview with Custom Data
```bash
npm run preview:badges:advanced
```
This provides more options and allows you to customize the test data.

## Generated Files

The preview badges will be saved in the `preview/` directory with the following naming:
- `attendee_badge_preview.pdf` - Sample attendee badge
- `exhibitor_badge_preview.pdf` - Sample exhibitor badge  
- `sponsor_badge_preview.pdf` - Sample sponsor badge

## Badge Features

Each badge includes:
- **Top Section**: Event branding with logos and event details
- **Middle Section**: User information (name, title, company)
- **QR Code**: Unique identifier for each user
- **Bottom Banner**: User type (VISITOR/EXHIBITOR/SPONSOR)
- **Footer**: Organizer information

## Customizing Test Data

To test with your own data, modify the `sampleData` object in `src/scripts/badgePreview.ts` or use the advanced script with custom data.

### Sample Data Structure

**Attendee:**
```typescript
{
    id: 'ATT-001',
    firstName: 'John',
    lastName: 'Doe', 
    occupation: 'Software Engineer',
    organization: 'Tech Solutions Inc.'
}
```

**Exhibitor:**
```typescript
{
    id: 'EXH-001',
    name: 'Jane Smith',
    title: 'Marketing Director',
    company: 'Green Energy Solutions Ltd.'
}
```

**Sponsor:**
```typescript
{
    id: 'SPO-001',
    name: 'Michael Johnson',
    title: 'CEO',
    company: 'Power Ethiopia Corporation'
}
```

## Troubleshooting

- Make sure all required image assets are in the `images/` directory
- Check that the badge generator dependencies are installed
- Ensure the preview directory has write permissions

## Next Steps

After previewing the badges:
1. Open the generated PDF files to see the layout
2. Verify all information displays correctly
3. Check QR code generation
4. Test with different user types and data lengths
5. Make any necessary adjustments to the badge design


