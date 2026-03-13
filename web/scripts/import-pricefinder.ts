/**
 * PriceFinder Import Script
 * Phase 2B - Multi-Source Data Ingest
 * 
 * Usage: npm run import:pricefinder -- --dir ./pricefinder-exports
 * 
 * Processes PriceFinder .xls exports and merges with existing CoreLogic data
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

import * as XLSX from 'xlsx';
import * as fs from 'fs';
import { MongoClient, Db, Collection, ObjectId } from 'mongodb';

// ============================================
// CONFIGURATION
// ============================================

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DATABASE_NAME = 'merrimac-intelligence';
const PROPERTIES_COLLECTION = 'properties';
const ISSUES_COLLECTION = 'importIssues';

// Street type expansion map (from P2A)
const STREET_TYPE_MAP: Record<string, string> = {
  'CRT': 'Court',
  'RD': 'Road',
  'ST': 'Street',
  'DR': 'Drive',
  'AVE': 'Avenue',
  'PL': 'Place',
  'CL': 'Close',
  'CR': 'Crescent',
  'TCE': 'Terrace',
  'BLVD': 'Boulevard',
  'HWY': 'Highway',
  'LN': 'Lane',
  'CT': 'Court',
  'AV': 'Avenue'
};

// ============================================
// TYPE DEFINITIONS
// ============================================

interface PriceFinderRow {
  buildingName: string;
  street: string;
  alternateStreet: string;
  locality: string;
  altStreet: string;
  altLocality: string;
  legalDescription: string;
  area: number | null;
  buildingArea: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  carParks: number | null;
  mainRooms: number | null;
  buildYear: number | null;
  buildingStyle: string;
  storeys: number | null;
  wallType: string;
  roofType: string;
  postcode: string;
  currentOwners: string;
  currentOwnersAddress: string;
  vendorNames: string;
  purchaserNames: string;
  parish: string;
  lastSale: number | null;
  lastSaleDate: string | null;
  lastSaleType: string;
  landUse: string;
  zoning: string;
  valuationDate: string | null;
  valuationAmount: number | null;
  governmentNumber: string;
  parentGovernmentNumber: string;
  pdsId: number | null;
  loadDate: string | null;
}

interface ParsedAddress {
  streetNumber: string;
  streetName: string;
  streetType: string;
  suburb: string;
  state: string;
  postcode: string;
  formatted: string;
}

interface PropertyDocument {
  _id?: ObjectId;
  address: ParsedAddress;
  lotPlan: string | null;
  lotPlanPriceFinder?: string;
  beds: number | null;
  baths: number | null;
  cars: number | null;
  landSize: number | null;
  floorSize: number | null;
  yearBuilt: number | null;
  ownerNames: string[];
  ownerNamesPriceFinder?: string[];
  ownerMailingAddressRaw?: string;
  salePrice: number | null;
  saleDate: Date | null;
  saleType: string | null;
  zoning?: string;
  developmentZone?: string;
  governmentValuation?: number;
  governmentValuationDate?: Date;
  governmentNumber?: string;
  pfGovernmentNumber?: string;
  pfPdsId?: number;
  parish?: string;
  addressMismatch?: boolean;
  sources: {
    corelogic: boolean;
    pricefinder: boolean;
    homepass?: boolean;
  };
  importIssues?: string[];
  location?: {
    type: string;
    coordinates: number[];
  };
  updatedAt: Date;
  createdAt: Date;
}

interface ImportIssue {
  issueType: string;
  description: string;
  address?: string;
  lotPlan?: string;
  pfGovernmentNumber?: string;
  corelogicGovernmentNumber?: string;
  source: string;
  createdAt: Date;
}

interface ImportStats {
  filesProcessed: number;
  totalRows: number;
  matched: number;
  inserted: number;
  flagged: number;
  errors: number;
  byFile: { file: string; rows: number; matched: number; inserted: number; flagged: number }[];
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Convert Excel serial date to ISO date string
 * Excel serial dates are days since Dec 30, 1899
 */
function excelSerialToDate(serial: number | null | undefined): string | null {
  if (serial === null || serial === undefined) {
    return null;
  }
  const epoch = new Date(1899, 11, 30); // December 30, 1899
  const date = new Date(epoch.getTime() + serial * 24 * 60 * 60 * 1000);
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

/**
 * Parse PriceFinder street address into components
 * Format: "{number} {name} {type}" e.g. "1 ALTER CRT"
 */
function parseStreetAddress(street: string, locality: string, postcode: string): ParsedAddress {
  const normalizedStreet = street.trim().toUpperCase();
  
  // Split into parts
  const parts = normalizedStreet.split(/\s+/);
  
  if (parts.length < 2) {
    // Fallback for malformed addresses
    return {
      streetNumber: '',
      streetName: normalizedStreet,
      streetType: '',
      suburb: locality.trim().toUpperCase(),
      state: 'QLD',
      postcode: postcode.trim(),
      formatted: `${normalizedStreet}, ${locality.trim().toUpperCase()} QLD ${postcode.trim()}`
    };
  }

  // First part is typically the street number (may have suffix like 1A)
  let streetNumber = parts[0];
  let streetNameParts: string[] = [];
  let streetType = '';

  // Check if first part is a number (street number)
  if (/^\d+[A-Z]?$/.test(streetNumber)) {
    streetNameParts = parts.slice(1, -1);
    streetType = parts[parts.length - 1] || '';
  } else {
    // No clear number, treat all as name
    streetNameParts = parts;
    streetType = '';
  }

  // Expand street type abbreviation
  const expandedType = STREET_TYPE_MAP[streetType] || streetType;

  // Build street name (Title Case)
  const streetName = streetNameParts
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');

  // Build formatted address
  const formatted = streetNumber && streetName
    ? `${streetNumber} ${streetName} ${expandedType}, ${locality.trim().toUpperCase()} QLD ${postcode.trim()}`
    : `${streetNumber || ''} ${streetName || ''} ${expandedType}, ${locality.trim().toUpperCase()} QLD ${postcode.trim()}`;

  return {
    streetNumber,
    streetName: streetName || normalizedStreet,
    streetType: expandedType,
    suburb: locality.trim().toUpperCase(),
    state: 'QLD',
    postcode: postcode.trim(),
    formatted: formatted.replace(/\s+/g, ' ').trim()
  };
}

/**
 * Normalize address for matching
 * Lowercase, strip punctuation, normalize whitespace
 */
function normalizeAddress(address: string): string {
  return address
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Parse owner names from PriceFinder format
 * Handles & and ; separators, converts to Title Case
 */
function parseOwnerNames(ownerString: string): string[] {
  if (!ownerString || ownerString.trim() === '') {
    return [];
  }

  // Split on semicolons first, then ampersands
  const segments = ownerString.split(';').flatMap(seg => seg.split('&'));
  
  return segments
    .map(seg => seg.trim().toLowerCase())
    .filter(seg => seg !== '' && seg !== 'n/a')
    .map(seg => titleCase(seg));
}

/**
 * Convert string to Title Case
 */
function titleCase(str: string): string {
  return str.replace(
    /\b\w+/g,
    word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  );
}

/**
 * Normalize lot/plan format
 * PriceFinder: L{lot} {plan} -> {lot}/{plan}
 * RPData: {lot}/{plan} -> {lot}/{plan}
 */
function normalizeLotPlan(legalDescription: string): string | null {
  if (!legalDescription || legalDescription.trim() === '') {
    return null;
  }

  // PriceFinder format: "L24 RP222082"
  const pfMatch = legalDescription.trim().match(/^L(\d+)\s+(\S+)$/i);
  if (pfMatch) {
    return `${pfMatch[1]}/${pfMatch[2]}`;
  }

  // Already in RPData format: "164/RP900205"
  const rpMatch = legalDescription.trim().match(/^(\d+)\/(\S+)$/i);
  if (rpMatch) {
    return `${rpMatch[1]}/${rpMatch[2]}`;
  }

  // Return as-is if no pattern match
  return legalDescription.trim();
}

/**
 * Calculate string similarity (for fuzzy owner matching)
 */
function similarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().replace(/\s/g, '');
  const s2 = str2.toLowerCase().replace(/\s/g, '');
  
  if (s1 === s2) return 1;
  if (s1.length === 0 || s2.length === 0) return 0;
  
  const costs: number[] = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  
  return 1 - costs[s2.length] / Math.max(s1.length, s2.length);
}

// ============================================
// PARSING FUNCTIONS
// ============================================

/**
 * Parse a raw XLS row into a structured PriceFinderRow object
 */
function parsePriceFinderRow(row: any[]): PriceFinderRow | null {
  // Skip rows where both Building Name (col 0) and Street (col 1) are empty
  // This handles empty rows and copyright disclaimer rows
  if ((!row[0] || row[0].toString().trim() === '') && 
      (!row[1] || row[1].toString().trim() === '')) {
    return null;
  }

  return {
    buildingName: row[0]?.toString().trim() || '',
    street: row[1]?.toString().trim() || '',
    alternateStreet: row[2]?.toString().trim() || '',
    locality: row[3]?.toString().trim() || '',
    altStreet: row[4]?.toString().trim() || '',
    altLocality: row[5]?.toString().trim() || '',
    legalDescription: row[6]?.toString().trim() || '',
    area: row[7] !== undefined && row[7] !== '' ? parseFloat(row[7]) : null,
    buildingArea: row[8] !== undefined && row[8] !== '' ? parseFloat(row[8]) : null,
    bedrooms: row[9] !== undefined && row[9] !== '' ? parseInt(row[9]) : null,
    bathrooms: row[10] !== undefined && row[10] !== '' ? parseInt(row[10]) : null,
    carParks: row[11] !== undefined && row[11] !== '' ? parseInt(row[11]) : null,
    mainRooms: row[12] !== undefined && row[12] !== '' ? parseFloat(row[12]) : null,
    buildYear: row[13] !== undefined && row[13] !== '' ? parseInt(row[13]) : null,
    buildingStyle: row[14]?.toString().trim() || '',
    storeys: row[15] !== undefined && row[15] !== '' ? parseInt(row[15]) : null,
    wallType: row[16]?.toString().trim() || '',
    roofType: row[17]?.toString().trim() || '',
    postcode: row[18]?.toString().trim() || '',
    currentOwners: row[19]?.toString().trim() || '',
    currentOwnersAddress: row[20]?.toString().trim() || '',
    vendorNames: row[21]?.toString().trim() || '',
    purchaserNames: row[22]?.toString().trim() || '',
    parish: row[23]?.toString().trim() || '',
    lastSale: row[24] !== undefined && row[24] !== '' ? parseFloat(row[24]) : null,
    lastSaleDate: excelSerialToDate(row[25]),
    lastSaleType: row[26]?.toString().trim() || '',
    landUse: row[27]?.toString().trim() || '',
    zoning: row[28]?.toString().trim() || '',
    valuationDate: excelSerialToDate(row[29]),
    valuationAmount: row[30] !== undefined && row[30] !== '' ? parseFloat(row[30]) : null,
    governmentNumber: row[31]?.toString().trim() || '',
    parentGovernmentNumber: row[32]?.toString().trim() || '',
    pdsId: row[33] !== undefined && row[33] !== '' ? parseInt(row[33]) : null,
    loadDate: excelSerialToDate(row[34])
  };
}

/**
 * Convert PriceFinderRow to a property document ready for merge/insert
 */
function convertToPropertyDocument(pfRow: PriceFinderRow): Partial<PropertyDocument> {
  const address = parseStreetAddress(pfRow.street, pfRow.locality, pfRow.postcode);
  const lotPlan = normalizeLotPlan(pfRow.legalDescription);
  const ownerNames = parseOwnerNames(pfRow.currentOwners);
  
  // Handle mailing address - "N/A" becomes null
  const ownerMailingAddress = pfRow.currentOwnersAddress && 
    pfRow.currentOwnersAddress.toUpperCase() !== 'N/A' 
    ? pfRow.currentOwnersAddress 
    : undefined;

  return {
    address,
    lotPlanPriceFinder: lotPlan ?? undefined,
    beds: pfRow.bedrooms,
    baths: pfRow.bathrooms,
    cars: pfRow.carParks,
    landSize: pfRow.area,
    floorSize: pfRow.buildingArea,
    yearBuilt: pfRow.buildYear,
    ownerNamesPriceFinder: ownerNames,
    ownerMailingAddressRaw: ownerMailingAddress,
    salePrice: pfRow.lastSale,
    saleDate: pfRow.lastSaleDate ? new Date(pfRow.lastSaleDate) : null,
    saleType: pfRow.lastSaleType,
    zoning: pfRow.zoning,
    governmentValuation: pfRow.valuationAmount ?? undefined,
    governmentValuationDate: pfRow.valuationDate ? new Date(pfRow.valuationDate) : undefined,
    pfGovernmentNumber: pfRow.governmentNumber,
    pfPdsId: pfRow.pdsId || undefined,
    parish: pfRow.parish || undefined,
    sources: {
      corelogic: false, // Will be set true if matched
      pricefinder: true
    },
    updatedAt: new Date()
  };
}

// ============================================
// DATABASE FUNCTIONS
// ============================================

let mongoClient: MongoClient;
let db: Db;
let propertiesCollection: Collection<PropertyDocument>;
let issuesCollection: Collection<ImportIssue>;

async function connectToDatabase(): Promise<void> {
  console.log('🔌 Connecting to MongoDB...');
  mongoClient = new MongoClient(MONGODB_URI);
  await mongoClient.connect();
  db = mongoClient.db(DATABASE_NAME);
  propertiesCollection = db.collection<PropertyDocument>(PROPERTIES_COLLECTION);
  issuesCollection = db.collection<ImportIssue>(ISSUES_COLLECTION);
  
  // Create indexes for matching
  await propertiesCollection.createIndex({ 'address.formatted': 1 });
  await propertiesCollection.createIndex({ lotPlan: 1 });
  await propertiesCollection.createIndex({ 'sources.corelogic': 1 });
  
  console.log(`✅ Connected to ${DATABASE_NAME}`);
}

async function closeDatabase(): Promise<void> {
  await mongoClient.close();
  console.log('🔌 Disconnected from MongoDB');
}

/**
 * Find matching property by address
 */
async function findByAddress(address: ParsedAddress): Promise<PropertyDocument | null> {
  const normalizedAddress = normalizeAddress(address.formatted);
  
  // Find all properties with this address
  const candidates = await propertiesCollection
    .find({
      'address.formatted': { $regex: new RegExp(`^${escapeRegExp(normalizedAddress)}$`, 'i') }
    })
    .toArray();

  if (candidates.length === 0) {
    return null;
  }

  if (candidates.length === 1) {
    return candidates[0];
  }

  // Multiple matches - unit complex scenario
  // Return all for lot/plan tiebreaker logic
  return candidates[0]; // Return first for now, will handle tiebreaker in merge
}

/**
 * Find matching property by lot/plan
 */
async function findByLotPlan(lotPlan: string): Promise<PropertyDocument | null> {
  return await propertiesCollection.findOne({ lotPlan });
}

/**
 * Record an import issue
 */
async function recordIssue(issue: Omit<ImportIssue, 'createdAt'>): Promise<void> {
  await issuesCollection.insertOne({
    ...issue,
    createdAt: new Date()
  });
}

// ============================================
// MAIN IMPORT LOGIC
// ============================================

/**
 * Process a single PriceFinder XLS file
 */
async function processFile(filePath: string): Promise<{ matched: number; inserted: number; flagged: number }> {
  const fileName = path.basename(filePath);
  console.log(`\n📄 Processing: ${fileName}`);
  
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  // Parse all rows
  const rawRows = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
  
  // Row 0 is headers, data starts from row 1
  let matched = 0;
  let inserted = 0;
  let flagged = 0;
  
  for (let i = 1; i < rawRows.length; i++) {
    const rawRow = rawRows[i];
    const pfRow = parsePriceFinderRow(rawRow);
    
    if (!pfRow) {
      continue; // Skip empty rows
    }
    
    try {
      const pfDoc = convertToPropertyDocument(pfRow);
      const normalizedAddress = normalizeAddress(pfDoc.address!.formatted);
      const lotPlan = pfDoc.lotPlanPriceFinder || '';
      
      // PASS 1: Address match
      const addressMatches = await propertiesCollection
        .find({
          'address.formatted': { $regex: new RegExp(`^${escapeRegExp(normalizedAddress)}$`, 'i') }
        })
        .toArray();
      
      let existingProperty: PropertyDocument | null = null;
      
      if (addressMatches.length === 1) {
        // Single match - good
        existingProperty = addressMatches[0];
      } else if (addressMatches.length > 1) {
        // Multiple matches - unit complex, use lot/plan tiebreaker
        if (lotPlan) {
          existingProperty = addressMatches.find(p => 
            normalizeLotPlan(p.lotPlan || '') === lotPlan
          ) || null;
        }
        
        if (!existingProperty) {
          // Can't resolve - flag for review
          await recordIssue({
            issueType: 'duplicate_suspect',
            description: `Multiple CoreLogic records match address, lot/plan tiebreaker failed`,
            address: pfDoc.address!.formatted,
            lotPlan: lotPlan,
            pfGovernmentNumber: pfDoc.pfGovernmentNumber,
            source: 'pricefinder'
          });
          flagged++;
          continue;
        }
      }
      
      if (existingProperty) {
        // PASS 2: Found match - merge data
        await mergeProperty(existingProperty, pfDoc);
        matched++;
      } else if (lotPlan) {
        // PASS 3: Try lot/plan match
        const lotPlanMatch = await findByLotPlan(lotPlan);
        
        if (lotPlanMatch) {
          // Matched via lot/plan - flag address mismatch
          await mergeProperty(lotPlanMatch, pfDoc, true);
          matched++;
        } else {
          // No match - insert as new
          await insertNewProperty(pfDoc);
          await recordIssue({
            issueType: 'pricefinder_only',
            description: 'Property in PriceFinder but not found in CoreLogic data',
            address: pfDoc.address!.formatted,
            lotPlan: lotPlan,
            pfGovernmentNumber: pfDoc.pfGovernmentNumber,
            source: 'pricefinder'
          });
          inserted++;
          flagged++;
        }
      } else {
        // No address match, no lot/plan - insert as new
        await insertNewProperty(pfDoc);
        await recordIssue({
          issueType: 'pricefinder_only',
          description: 'Property in PriceFinder but not found in CoreLogic data',
          address: pfDoc.address!.formatted,
          pfGovernmentNumber: pfDoc.pfGovernmentNumber,
          source: 'pricefinder'
        });
        inserted++;
        flagged++;
      }
      
    } catch (error) {
      console.error(`  ❌ Error processing row ${i}:`, error);
    }
  }
  
  console.log(`  ✅ Matched: ${matched}, Inserted: ${inserted}, Flagged: ${flagged}`);
  return { matched, inserted, flagged };
}

/**
 * Merge PriceFinder data into existing property
 * CoreLogic wins on property attributes
 */
async function mergeProperty(
  existing: PropertyDocument, 
  pfDoc: Partial<PropertyDocument>,
  addressMismatch: boolean = false
): Promise<void> {
  const update: any = {
    $set: {
      sources: {
        corelogic: existing.sources?.corelogic || false,
        pricefinder: true
      },
      updatedAt: new Date()
    }
  };
  
  // CoreLogic wins on these fields - only update if existing is null
  if (!existing.beds && pfDoc.beds) update.$set.beds = pfDoc.beds;
  if (!existing.baths && pfDoc.baths) update.$set.baths = pfDoc.baths;
  if (!existing.cars && pfDoc.cars) update.$set.cars = pfDoc.cars;
  if (!existing.landSize && pfDoc.landSize) update.$set.landSize = pfDoc.landSize;
  if (!existing.floorSize && pfDoc.floorSize) update.$set.floorSize = pfDoc.floorSize;
  if (!existing.yearBuilt && pfDoc.yearBuilt) update.$set.yearBuilt = pfDoc.yearBuilt;
  if (!existing.lotPlan && pfDoc.lotPlanPriceFinder) update.$set.lotPlan = pfDoc.lotPlanPriceFinder;
  
  // Store PriceFinder lot/plan as backup
  if (pfDoc.lotPlanPriceFinder) {
    update.$set.lotPlanPriceFinder = pfDoc.lotPlanPriceFinder;
  }
  
  // Sale price/date - keep most recent
  if (pfDoc.saleDate && (!existing.saleDate || pfDoc.saleDate > existing.saleDate)) {
    update.$set.salePrice = pfDoc.salePrice;
    update.$set.saleDate = pfDoc.saleDate;
    update.$set.saleType = pfDoc.saleType;
  }
  
  // Zoning - PriceFinder has it, CoreLogic has developmentZone
  if (pfDoc.zoning) {
    update.$set.zoning = pfDoc.zoning;
  }
  
  // PriceFinder-only fields
  if (pfDoc.governmentValuation) {
    update.$set.governmentValuation = pfDoc.governmentValuation;
  }
  if (pfDoc.governmentValuationDate) {
    update.$set.governmentValuationDate = pfDoc.governmentValuationDate;
  }
  if (pfDoc.pfGovernmentNumber) {
    update.$set.pfGovernmentNumber = pfDoc.pfGovernmentNumber;
  }
  if (pfDoc.pfPdsId) {
    update.$set.pfPdsId = pfDoc.pfPdsId;
  }
  if (pfDoc.parish) {
    update.$set.parish = pfDoc.parish;
  }
  if (pfDoc.ownerMailingAddressRaw) {
    update.$set.ownerMailingAddressRaw = pfDoc.ownerMailingAddressRaw;
  }
  
  // Owner name reconciliation
  if (pfDoc.ownerNamesPriceFinder && pfDoc.ownerNamesPriceFinder.length > 0) {
    const existingOwners = existing.ownerNames || [];
    const pfOwners = pfDoc.ownerNamesPriceFinder;
    
    // Check if PriceFinder has MORE owners (likely more accurate)
    if (pfOwners.length > existingOwners.length) {
      // Check if existing owners are a subset (fuzzy match)
      const existingSet = new Set(existingOwners.map(o => o.toLowerCase()));
      const allMatch = pfOwners.every(pf => 
        existingSet.has(pf.toLowerCase()) ||
        existingOwners.some(ex => similarity(ex, pf) > 0.85)
      );
      
      if (!allMatch) {
        // Different owners - flag for review
        update.$set.ownerNamesPriceFinder = pfOwners;
        await recordIssue({
          issueType: 'owner_name_conflict',
          description: 'Owner names differ significantly between sources',
          address: existing.address.formatted,
          lotPlan: existing.lotPlan || undefined,
          pfGovernmentNumber: pfDoc.pfGovernmentNumber,
          corelogicGovernmentNumber: existing.governmentNumber,
          source: 'pricefinder'
        });
      }
    }
  }
  
  // Address mismatch flag
  if (addressMismatch) {
    update.$set.addressMismatch = true;
  }
  
  await propertiesCollection.updateOne(
    { _id: existing._id },
    update
  );
}

/**
 * Insert new property from PriceFinder (no CoreLogic match)
 */
async function insertNewProperty(pfDoc: Partial<PropertyDocument>): Promise<void> {
  const doc: PropertyDocument = {
    address: pfDoc.address!,
    lotPlan: pfDoc.lotPlanPriceFinder || null,
    beds: pfDoc.beds || null,
    baths: pfDoc.baths || null,
    cars: pfDoc.cars || null,
    landSize: pfDoc.landSize || null,
    floorSize: pfDoc.floorSize || null,
    yearBuilt: pfDoc.yearBuilt || null,
    ownerNames: pfDoc.ownerNamesPriceFinder || [],
    ownerMailingAddressRaw: pfDoc.ownerMailingAddressRaw,
    salePrice: pfDoc.salePrice || null,
    saleDate: pfDoc.saleDate || null,
    saleType: pfDoc.saleType || null,
    zoning: pfDoc.zoning,
    governmentValuation: pfDoc.governmentValuation,
    governmentValuationDate: pfDoc.governmentValuationDate,
    pfGovernmentNumber: pfDoc.pfGovernmentNumber,
    pfPdsId: pfDoc.pfPdsId,
    parish: pfDoc.parish,
    sources: {
      corelogic: false,
      pricefinder: true
    },
    importIssues: [],
    updatedAt: new Date(),
    createdAt: new Date()
  };
  
  await propertiesCollection.insertOne(doc);
}

// Helper to escape regex special characters
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ============================================
// MAIN EXECUTION
// ============================================

async function main() {
  const args = process.argv.slice(2);
  let dirPath = './pricefinder-exports';
  
  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--dir' && args[i + 1]) {
      dirPath = args[i + 1];
    }
  }
  
  console.log('🏠 PriceFinder Import Script');
  console.log('============================');
  console.log(`📁 Directory: ${dirPath}`);
  console.log('');
  
  // Check directory exists
  if (!fs.existsSync(dirPath)) {
    console.error(`❌ Directory not found: ${dirPath}`);
    process.exit(1);
  }
  
  // Get all XLS files
  const files = fs.readdirSync(dirPath)
    .filter(f => f.endsWith('.xls') || f.endsWith('.xlsx'))
    .map(f => path.join(dirPath, f));
  
  if (files.length === 0) {
    console.error('❌ No .xls files found in directory');
    process.exit(1);
  }
  
  console.log(`📊 Found ${files.length} files to process`);
  
  // Connect to database
  await connectToDatabase();
  
  const stats: ImportStats = {
    filesProcessed: 0,
    totalRows: 0,
    matched: 0,
    inserted: 0,
    flagged: 0,
    errors: 0,
    byFile: []
  };
  
  // Process each file
  for (const file of files) {
    const result = await processFile(file);
    stats.filesProcessed++;
    stats.matched += result.matched;
    stats.inserted += result.inserted;
    stats.flagged += result.flagged;
    stats.byFile.push({
      file: path.basename(file),
      rows: result.matched + result.inserted,
      ...result
    });
  }
  
  // Print summary
  console.log('\n============================');
  console.log('📈 IMPORT SUMMARY');
  console.log('============================');
  console.log(`Files processed: ${stats.filesProcessed}`);
  console.log(`Total matched:   ${stats.matched}`);
  console.log(`Total inserted: ${stats.inserted}`);
  console.log(`Total flagged:   ${stats.flagged}`);
  console.log('');
  
  console.log('By file:');
  for (const file of stats.byFile) {
    console.log(`  ${file.file}: ${file.matched} matched, ${file.inserted} inserted, ${file.flagged} flagged`);
  }
  
  await closeDatabase();
  
  console.log('\n✅ Import complete!');
}

main().catch(console.error);
