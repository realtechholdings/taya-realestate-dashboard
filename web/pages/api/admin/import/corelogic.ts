import { NextApiRequest, NextApiResponse } from 'next';
import multer from 'multer';
import { parseRPDataXLSX, validateRPDataXLSX } from '@/lib/xlsxParser';
import { 
  parseAddress, 
  parseOwnerNames, 
  parsePreviousOwnerNames, 
  normalizePropertyType, 
  parseSalePrice, 
  parseSaleDate, 
  extractRPDataUrl 
} from '@/lib/addressParser';
import { geocodeAddress, logGeocodingIssue } from '@/lib/geocoding';
import { getCollection, initializeIndexes } from '@/lib/mongodb';
import { Property, ImportSummary, ImportIssueDocument } from '@/types';

// Configure multer for file upload
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      cb(null, true);
    } else {
      cb(new Error('Only XLSX files are allowed'));
    }
  }
});

// Helper to promisify multer
function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: any) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ImportSummary | { error: string }>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Initialize database indexes if needed
    await initializeIndexes();

    // Process file upload
    await runMiddleware(req, res, upload.single('file'));
    
    const file = (req as any).file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log(`Processing RPData XLSX file: ${file.originalname} (${file.size} bytes)`);

    // Validate XLSX structure
    const validation = validateRPDataXLSX(file.buffer);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error || 'Invalid XLSX file structure' });
    }

    // Parse XLSX file
    const rpDataRows = parseRPDataXLSX(file.buffer);
    console.log(`Parsed ${rpDataRows.length} property records from XLSX`);

    // Generate import batch ID
    const importBatch = new Date().toISOString();
    
    // Initialize counters
    let inserted = 0;
    let updated = 0;
    let skipped = 0;
    let geocodingFailures = 0;
    const issues: ImportIssueDocument[] = [];

    // Get MongoDB collection
    const propertiesCollection = await getCollection<Property>('properties');

    // Process each property
    for (let i = 0; i < rpDataRows.length; i++) {
      const row = rpDataRows[i];
      const rowNumber = i + 4; // Actual row in XLSX (accounting for skipped rows)

      try {
        // Skip rows with missing required data
        if (!row.streetAddress || !row.suburb || !row.state || !row.postcode) {
          console.log(`Skipping row ${rowNumber}: missing required address data`);
          skipped++;
          continue;
        }

        // Parse address components
        const address = parseAddress(row.streetAddress, row.suburb, row.state, row.postcode);
        
        // Parse owner names
        const { ownerNames, ownerDisplayName } = parseOwnerNames(row.owner1Name, row.owner2Name, row.owner3Name);
        
        // Parse previous owner names (vendors)
        const previousOwnerNames = parsePreviousOwnerNames(row.vendor1Name, row.vendor2Name, row.vendor3Name);
        
        // Normalize property type
        const propertyType = normalizePropertyType(row.propertyType);
        
        // Parse sale price and date
        const salePrice = parseSalePrice(row.salePrice);
        const saleDate = parseSaleDate(row.saleDate);
        const settlementDate = parseSaleDate(row.settlementDate);
        
        // Extract RPData URL from hyperlink
        const rpDataUrl = extractRPDataUrl(row.rpDataLink);

        // Geocode the address
        console.log(`Geocoding: ${address.formatted}`);
        const geocodeResult = await geocodeAddress(address.formatted);
        
        // Update address with geocoding results
        address.lat = geocodeResult.lat;
        address.lng = geocodeResult.lng;
        address.placeId = geocodeResult.placeId;
        address.geocodeConfidence = geocodeResult.confidence;
        address.geocodedAt = geocodeResult.geocodedAt;

        // Log geocoding issues
        if (geocodeResult.confidence === 'failed') {
          geocodingFailures++;
          await logGeocodingIssue(importBatch, rowNumber, row.streetAddress, 'geocode_failed', 'No results from Google Geocoding API');
        } else if (geocodeResult.confidence === 'low') {
          await logGeocodingIssue(importBatch, rowNumber, row.streetAddress, 'geocode_low_confidence', 'Low confidence geocoding result');
        }

        // Check if property already exists
        const existingProperty = await propertiesCollection.findOne({ 'address.formatted': address.formatted });

        const propertyData: Partial<Property> = {
          rawAddress: row.streetAddress,
          address,
          propertyType,
          propertyTypeRaw: row.propertyType,
          beds: row.bed,
          baths: row.bath,
          cars: row.car,
          landSize: row.landSize,
          floorSize: row.floorSize,
          yearBuilt: row.yearBuilt,
          lotPlan: row.parcelDetails,
          councilArea: row.councilArea,
          landUse: row.landUse,
          developmentZone: row.developmentZone,
          rpDataUrl,
          ownerNames,
          ownerDisplayName,
          ownerType: row.ownerType,
          previousOwnerNames: previousOwnerNames.length > 0 ? previousOwnerNames : undefined,
          salePrice,
          saleDate,
          settlementDate,
          saleType: row.saleType,
          agency: row.agency,
          agent: row.agent,
          updatedAt: new Date(),
          importBatch
        };

        if (existingProperty) {
          // Update existing property (CoreLogic wins on specified fields)
          await propertiesCollection.updateOne(
            { _id: existingProperty._id },
            {
              $set: {
                ...propertyData,
                'sources.corelogic': true
              },
              $setOnInsert: {
                // These fields are only set if they don't exist (preserve from other sources)
                phoneVerified: 'not_attempted',
                doNotCall: false,
                emailVerified: 'not_attempted',
                doNotContact: false,
                segments: [],
                sources: {
                  corelogic: true,
                  pricefinder: false,
                  homepass: false,
                  csv: false
                }
              }
            },
            { upsert: false }
          );
          updated++;
        } else {
          // Insert new property
          await propertiesCollection.insertOne({
            ...propertyData,
            phoneVerified: 'not_attempted',
            doNotCall: false,
            emailVerified: 'not_attempted',
            doNotContact: false,
            segments: [],
            sources: {
              corelogic: true,
              pricefinder: false,
              homepass: false,
              csv: false
            },
            importedAt: new Date()
          } as Property);
          inserted++;
        }

      } catch (error) {
        console.error(`Error processing row ${rowNumber}:`, error);
        skipped++;
        
        // Log the issue
        issues.push({
          importBatch,
          rowNumber,
          rawAddress: row.streetAddress || 'Unknown',
          issueType: 'parse_error',
          detail: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Save any parsing issues to database
    if (issues.length > 0) {
      const issuesCollection = await getCollection<ImportIssueDocument>('importIssues');
      await issuesCollection.insertMany(issues);
    }

    const summary: ImportSummary = {
      success: true,
      inserted,
      updated,
      skipped,
      geocodingFailures,
      totalProcessed: rpDataRows.length,
      importBatch,
      issues
    };

    console.log('Import completed:', summary);

    res.status(200).json(summary);

  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown import error' 
    });
  }
}

// Configure Next.js to handle file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};