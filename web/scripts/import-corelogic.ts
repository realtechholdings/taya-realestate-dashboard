#!/usr/bin/env ts-node

/**
 * CoreLogic (RPData) Import Script
 * 
 * Imports RPData XLSX files directly into MongoDB Atlas
 * Bypasses Vercel serverless function limitations
 * 
 * Usage:
 *   npm run import:corelogic -- --file ./data/merrimac-export.xlsx
 *   npm run import:corelogic -- --file /path/to/rpdata.xlsx
 */

// Load environment variables from .env file
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load .env from parent directory (project root)
dotenv.config({ path: path.join(__dirname, '../../.env') });
import { parseRPDataXLSX, validateRPDataXLSX } from '../src/lib/xlsxParser';
import { 
  parseAddress, 
  parseOwnerNames, 
  parsePreviousOwnerNames, 
  normalizePropertyType, 
  parseSalePrice, 
  parseSaleDate, 
  extractRPDataUrl 
} from '../src/lib/addressParser';
import { geocodeAddress, logGeocodingIssue } from '../src/lib/geocoding';
import { getCollection, initializeIndexes } from '../src/lib/mongodb';
import { Property, ImportSummary, ImportIssueDocument } from '../src/types';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function colorLog(color: keyof typeof colors, message: string) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function parseArgs(): { file?: string } {
  const args = process.argv.slice(2);
  const result: { file?: string } = {};
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--file' && i + 1 < args.length) {
      result.file = args[i + 1];
      i++; // Skip next argument as it's the value
    }
  }
  
  return result;
}

async function main() {
  try {
    colorLog('cyan', '🚀 CoreLogic (RPData) Import Script');
    colorLog('cyan', '=====================================');
    
    // Parse command line arguments
    const { file } = parseArgs();
    
    if (!file) {
      colorLog('red', '❌ Error: No file specified');
      colorLog('yellow', 'Usage: npm run import:corelogic -- --file ./data/merrimac-export.xlsx');
      process.exit(1);
    }
    
    // Check if file exists
    if (!fs.existsSync(file)) {
      colorLog('red', `❌ Error: File not found: ${file}`);
      process.exit(1);
    }
    
    const filePath = path.resolve(file);
    const fileStats = fs.statSync(filePath);
    
    colorLog('blue', `📁 File: ${filePath}`);
    colorLog('blue', `📊 Size: ${(fileStats.size / 1024 / 1024).toFixed(2)} MB`);
    
    // Read file
    colorLog('yellow', '📖 Reading XLSX file...');
    const fileBuffer = fs.readFileSync(filePath);
    
    // Initialize database indexes if needed
    colorLog('yellow', '🗄️  Initializing MongoDB connection...');
    await initializeIndexes();
    
    // Validate XLSX structure
    colorLog('yellow', '🔍 Validating XLSX structure...');
    const validation = validateRPDataXLSX(fileBuffer);
    if (!validation.valid) {
      colorLog('red', `❌ Invalid XLSX file: ${validation.error}`);
      process.exit(1);
    }
    
    // Parse XLSX file
    colorLog('yellow', '📋 Parsing XLSX data...');
    const rpDataRows = parseRPDataXLSX(fileBuffer);
    colorLog('green', `✅ Parsed ${rpDataRows.length} property records from XLSX`);
    
    // Generate import batch ID
    const importBatch = new Date().toISOString();
    colorLog('blue', `🏷️  Import Batch ID: ${importBatch}`);
    
    // Initialize counters
    let inserted = 0;
    let updated = 0;
    let skipped = 0;
    let geocodingFailures = 0;
    const issues: ImportIssueDocument[] = [];
    
    // Get MongoDB collection
    const propertiesCollection = await getCollection<Property>('properties');
    
    colorLog('yellow', '⚙️  Processing properties...');
    
    // Process each property with progress updates
    for (let i = 0; i < rpDataRows.length; i++) {
      const row = rpDataRows[i];
      const rowNumber = i + 4; // Actual row in XLSX (accounting for skipped rows)
      
      // Progress indicator
      if (i % 100 === 0 || i === rpDataRows.length - 1) {
        const progress = ((i + 1) / rpDataRows.length * 100).toFixed(1);
        colorLog('cyan', `📊 Progress: ${i + 1}/${rpDataRows.length} (${progress}%) - Inserted: ${inserted}, Updated: ${updated}, Skipped: ${skipped}, Geocoding Failures: ${geocodingFailures}`);
      }
      
      try {
        // Skip rows with missing required data
        if (!row.streetAddress || !row.suburb || !row.state || !row.postcode) {
          console.log(`⚠️  Skipping row ${rowNumber}: missing required address data`);
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
        console.error(`❌ Error processing row ${rowNumber}:`, error);
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
    
    // Print final summary
    colorLog('green', '🎉 IMPORT COMPLETED SUCCESSFULLY!');
    colorLog('green', '================================');
    colorLog('bright', `📊 FINAL SUMMARY:`);
    colorLog('green', `   ✅ Inserted: ${inserted} new properties`);
    colorLog('blue', `   🔄 Updated: ${updated} existing properties`);
    colorLog('yellow', `   ⚠️  Skipped: ${skipped} invalid records`);
    colorLog('red', `   ❌ Geocoding Failures: ${geocodingFailures}`);
    colorLog('cyan', `   📋 Total Processed: ${rpDataRows.length} records`);
    colorLog('magenta', `   🏷️  Import Batch: ${importBatch}`);
    
    if (issues.length > 0) {
      colorLog('yellow', `   ⚠️  Issues Logged: ${issues.length} (stored in importIssues collection)`);
    }
    
    const geocodingSuccessRate = ((rpDataRows.length - geocodingFailures) / rpDataRows.length * 100).toFixed(1);
    colorLog('bright', `🌍 Geocoding Success Rate: ${geocodingSuccessRate}%`);
    
    if (parseFloat(geocodingSuccessRate) >= 95) {
      colorLog('green', '✅ Geocoding success rate meets >95% target!');
    } else {
      colorLog('yellow', '⚠️  Geocoding success rate below 95% target - check import issues');
    }
    
    colorLog('cyan', '🏗️  Phase 2A data foundation import complete!');
    
  } catch (error) {
    colorLog('red', `❌ Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch((error) => {
    colorLog('red', `❌ Unhandled error: ${error}`);
    process.exit(1);
  });
}