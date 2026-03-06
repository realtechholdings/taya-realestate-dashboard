# Import Scripts

This directory contains data import scripts for the Merrimac Intelligence Dashboard.

## CoreLogic (RPData) Import

### Overview
The `import-corelogic.ts` script imports RPData XLSX files directly into MongoDB Atlas, bypassing Vercel serverless function limitations.

### Prerequisites
1. MongoDB Atlas connection configured in `.env`:
   ```
   MONGODB_URI=mongodb+srv://...
   DATABASE_NAME=merrimac-intelligence
   ```

2. Google Geocoding API key in `.env`:
   ```
   GOOGLE_GEOCODING_API_KEY=...
   ```

3. Dependencies installed:
   ```bash
   npm install
   ```

### Usage

**Basic usage:**
```bash
npm run import:corelogic -- --file ./data/merrimac-export.xlsx
```

**With absolute path:**
```bash
npm run import:corelogic -- --file /Users/username/Downloads/rpdata-export.xlsx
```

### Expected File Format
The script expects RPData XLSX files with:
- **Row 1:** Search metadata (skipped)
- **Row 2:** Empty (skipped) 
- **Row 3:** Column headers (skipped)
- **Rows 4+:** Property data (30 columns A-AD)

### Processing
The script will:
1. ✅ Validate XLSX structure
2. 📋 Parse 30 columns per Phase 2A specification
3. 🏠 Parse addresses with unit extraction and Title Case conversion
4. 🌍 Geocode addresses via Google API with caching
5. 💾 Store in MongoDB with conflict resolution
6. 📊 Output progress and final summary

### Output Example
```
🚀 CoreLogic (RPData) Import Script
=====================================
📁 File: /path/to/merrimac-export.xlsx
📊 Size: 12.34 MB
📖 Reading XLSX file...
🗄️  Initializing MongoDB connection...
🔍 Validating XLSX structure...
✅ Parsed 3100 property records from XLSX
🏷️  Import Batch ID: 2026-03-06T14:30:00.000Z
⚙️  Processing properties...
📊 Progress: 3100/3100 (100.0%) - Inserted: 2847, Updated: 253, Skipped: 0, Geocoding Failures: 45

🎉 IMPORT COMPLETED SUCCESSFULLY!
================================
📊 FINAL SUMMARY:
   ✅ Inserted: 2847 new properties
   🔄 Updated: 253 existing properties
   ⚠️  Skipped: 0 invalid records
   ❌ Geocoding Failures: 45
   📋 Total Processed: 3100 records
   🏷️  Import Batch: 2026-03-06T14:30:00.000Z
🌍 Geocoding Success Rate: 98.5%
✅ Geocoding success rate meets >95% target!
🏗️  Phase 2A data foundation import complete!
```

### Features
- **No size limits** - reads directly from filesystem
- **Progress tracking** - shows processing status every 100 records
- **Error handling** - logs issues to `importIssues` collection
- **Geocoding caching** - prevents re-geocoding same addresses
- **Conflict resolution** - CoreLogic data wins on specified fields
- **Title Case names** - handles Mc/Mac/O' prefixes correctly

### Troubleshooting

**"File not found" error:**
- Check the file path is correct
- Use absolute paths if relative paths don't work

**MongoDB connection error:**
- Verify `.env` file exists with correct `MONGODB_URI`
- Check network connectivity to MongoDB Atlas

**Geocoding API errors:**
- Verify `GOOGLE_GEOCODING_API_KEY` in `.env`
- Check Google API quotas and billing

**Import issues:**
- Check the `importIssues` collection in MongoDB for detailed error logs
- Verify XLSX file matches expected RPData format