#!/usr/bin/env ts-node

import dotenv from 'dotenv';
import { MongoClient, Db } from 'mongodb';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

interface GateResult {
  status: 'PASS' | 'FAIL' | 'WARN';
  message: string;
  details?: any;
}

class Phase2AGateCheck {
  private client: MongoClient;
  private db: Db;
  private results: { [key: string]: GateResult } = {};

  constructor() {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is required');
    }
    this.client = new MongoClient(process.env.MONGODB_URI);
  }

  async connect() {
    await this.client.connect();
    this.db = this.client.db('merrimac-intelligence');
    console.log('🔌 Connected to MongoDB Atlas');
  }

  async disconnect() {
    await this.client.close();
    console.log('🔌 Disconnected from MongoDB');
  }

  // Gate 1: Record Count
  async checkRecordCount() {
    const count = await this.db.collection('properties').countDocuments({});
    const target = 3100;
    const tolerance = target * 0.1; // ±10%
    
    let status: 'PASS' | 'FAIL' | 'WARN' = 'PASS';
    if (count < 2800 || count > 3500) {
      status = 'FAIL';
    } else if (count < (target - tolerance) || count > (target + tolerance)) {
      status = 'WARN';
    }

    this.results['recordCount'] = {
      status,
      message: `${count} records (target: 2,800–3,500)`,
      details: { count, target, withinTolerance: Math.abs(count - target) <= tolerance }
    };
  }

  // Gate 2: Geocoding Failure Rate
  async checkGeocodingFailureRate() {
    const total = await this.db.collection('properties').countDocuments({});
    
    const failedCount = await this.db.collection('properties').countDocuments({
      $or: [
        { 'address.geocodeConfidence': 'failed' },
        { 'address.geocodeConfidence': { $exists: false } },
        { 'address.geocodeConfidence': null }
      ]
    });

    const lowCount = await this.db.collection('properties').countDocuments({
      'address.geocodeConfidence': 'low'
    });

    const failureRate = (failedCount / total) * 100;
    const lowRate = (lowCount / total) * 100;

    this.results['geocodingFailure'] = {
      status: failureRate < 5 ? 'PASS' : 'FAIL',
      message: `${failureRate.toFixed(1)}% failure rate (target: < 5%)`,
      details: { failedCount, lowCount, total, failureRate, lowRate }
    };
  }

  // Gate 3: Geocoding Confidence Breakdown
  async checkGeocodingBreakdown() {
    const breakdown = await this.db.collection('properties').aggregate([
      {
        $group: {
          _id: '$address.geocodeConfidence',
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    const result: { [key: string]: number } = {};
    breakdown.forEach(item => {
      const confidence = item._id || 'null/missing';
      result[confidence] = item.count;
    });

    this.results['geocodingBreakdown'] = {
      status: 'PASS',
      message: 'Geocoding confidence distribution',
      details: result
    };
  }

  // Gate 4: Import Issues Breakdown
  async checkImportIssues() {
    const issues = await this.db.collection('importIssues').aggregate([
      {
        $group: {
          _id: '$issueType',
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    const hasParseErrors = issues.some(issue => issue._id === 'parse_error');
    const totalIssues = issues.reduce((sum, issue) => sum + issue.count, 0);

    this.results['importIssues'] = {
      status: hasParseErrors ? 'WARN' : 'PASS',
      message: `${totalIssues} import issues found`,
      details: issues.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {} as { [key: string]: number })
    };
  }

  // Gate 5: Schema Spot Check
  async checkSchema() {
    const samples = await this.db.collection('properties').aggregate([
      { $sample: { size: 3 } }
    ]).toArray();

    const requiredFields = [
      'address.formatted',
      'address.lat', 
      'address.lng',
      'address.geocodeConfidence',
      'propertyType',
      'ownerNames',
      'ownerDisplayName',
      'sources.corelogic',
      'phoneVerified',
      'doNotContact',
      'segments'
    ];

    const issues: string[] = [];

    samples.forEach((doc, index) => {
      requiredFields.forEach(field => {
        const value = this.getNestedValue(doc, field);
        
        if (field === 'ownerNames' && (!Array.isArray(value) || value.length === 0)) {
          issues.push(`Sample ${index + 1}: ${field} should be non-empty array`);
        } else if (field === 'segments' && (!Array.isArray(value))) {
          issues.push(`Sample ${index + 1}: ${field} should be array`);
        } else if (field === 'sources.corelogic' && value !== true) {
          issues.push(`Sample ${index + 1}: ${field} should be true`);
        } else if (field === 'phoneVerified' && value !== 'not_attempted') {
          issues.push(`Sample ${index + 1}: ${field} should be 'not_attempted'`);
        } else if (field === 'doNotContact' && value !== false) {
          issues.push(`Sample ${index + 1}: ${field} should be false`);
        } else if (!['ownerNames', 'segments', 'sources.corelogic', 'phoneVerified', 'doNotContact'].includes(field) && 
                   (value === null || value === undefined || value === '')) {
          issues.push(`Sample ${index + 1}: ${field} is null/undefined/empty`);
        }
      });
    });

    this.results['schemaCheck'] = {
      status: issues.length === 0 ? 'PASS' : 'FAIL',
      message: issues.length === 0 ? 'All required fields present' : `${issues.length} schema issues found`,
      details: issues
    };
  }

  // Gate 6: Title Case Check
  async checkTitleCase() {
    const samples = await this.db.collection('properties').aggregate([
      { $match: { ownerDisplayName: { $exists: true, $ne: null } } },
      { $sample: { size: 5 } },
      { $project: { ownerDisplayName: 1 } }
    ]).toArray();

    const names = samples.map(doc => doc.ownerDisplayName);

    this.results['titleCaseCheck'] = {
      status: 'PASS', // Manual verification required
      message: 'Owner name samples for manual verification',
      details: names
    };
  }

  // Gate 7: Address Format Check
  async checkAddressFormat() {
    const samples = await this.db.collection('properties').aggregate([
      { $match: { 'address.formatted': { $exists: true, $ne: null } } },
      { $sample: { size: 5 } },
      { $project: { 'address.formatted': 1 } }
    ]).toArray();

    const addresses = samples.map(doc => doc.address.formatted);

    this.results['addressFormat'] = {
      status: 'PASS', // Manual verification required
      message: 'Address format samples for manual verification',
      details: addresses
    };
  }

  // Gate 8: Unit Address Sample
  async checkUnitAddresses() {
    const samples = await this.db.collection('properties').aggregate([
      { $match: { 'address.unit': { $exists: true, $ne: null } } },
      { $limit: 5 },
      { $project: { 'address.formatted': 1, 'address.unit': 1 } }
    ]).toArray();

    const unitAddresses = samples.map(doc => ({
      unit: doc.address.unit,
      formatted: doc.address.formatted
    }));

    this.results['unitAddresses'] = {
      status: 'PASS',
      message: `${unitAddresses.length} unit address samples`,
      details: unitAddresses
    };
  }

  // Gate 9: Sale Price Format Check
  async checkSalePriceFormat() {
    const samples = await this.db.collection('properties').aggregate([
      { $match: { salePrice: { $exists: true, $ne: null } } },
      { $sample: { size: 5 } },
      { $project: { salePrice: 1 } }
    ]).toArray();

    const prices = samples.map(doc => ({
      value: doc.salePrice,
      type: typeof doc.salePrice,
      isNumber: typeof doc.salePrice === 'number'
    }));

    const allNumbers = prices.every(p => p.isNumber);

    this.results['salePriceFormat'] = {
      status: allNumbers ? 'PASS' : 'FAIL',
      message: allNumbers ? 'All sale prices are numeric' : 'Some sale prices are not numeric',
      details: prices
    };
  }

  // Gate 10: Sale Date Format Check
  async checkSaleDateFormat() {
    const samples = await this.db.collection('properties').aggregate([
      { $match: { saleDate: { $exists: true, $ne: null } } },
      { $sample: { size: 5 } },
      { $project: { saleDate: 1 } }
    ]).toArray();

    const dates = samples.map(doc => ({
      value: doc.saleDate,
      type: typeof doc.saleDate,
      isDate: doc.saleDate instanceof Date,
      isISOString: typeof doc.saleDate === 'string' && !isNaN(Date.parse(doc.saleDate))
    }));

    const allValidDates = dates.every(d => d.isDate || d.isISOString);

    this.results['saleDateFormat'] = {
      status: allValidDates ? 'PASS' : 'FAIL',
      message: allValidDates ? 'All sale dates are valid Date objects/ISO strings' : 'Some sale dates are invalid',
      details: dates
    };
  }

  // Gate 11: Index Verification
  async checkIndexes() {
    const indexes = await this.db.collection('properties').listIndexes().toArray();
    
    const requiredIndexes = [
      { 'address.formatted': 1 },
      { 'lotPlan': 1 },
      { 'ownerNames': 1 },
      { 'segments.name': 1 },
      { 'doNotContact': 1 },
      { 'address.lat': 1, 'address.lng': 1 }
    ];

    const foundIndexes: string[] = [];
    const missingIndexes: string[] = [];

    requiredIndexes.forEach(requiredIndex => {
      const found = indexes.some(index => {
        return JSON.stringify(index.key) === JSON.stringify(requiredIndex);
      });
      
      if (found) {
        foundIndexes.push(JSON.stringify(requiredIndex));
      } else {
        missingIndexes.push(JSON.stringify(requiredIndex));
      }
    });

    // Check for unique constraint on address.formatted
    const formattedIndex = indexes.find(index => 
      JSON.stringify(index.key) === JSON.stringify({ 'address.formatted': 1 })
    );
    const hasUniqueConstraint = formattedIndex && formattedIndex.unique === true;

    this.results['indexes'] = {
      status: missingIndexes.length === 0 && hasUniqueConstraint ? 'PASS' : 'FAIL',
      message: `${foundIndexes.length}/6 required indexes found, unique constraint: ${hasUniqueConstraint}`,
      details: { found: foundIndexes, missing: missingIndexes, uniqueConstraint: hasUniqueConstraint }
    };
  }

  // Gate 12: Geocode Cache Check
  async checkGeocodeCache() {
    const cacheCount = await this.db.collection('geocodeCache').countDocuments({});
    const propertyCount = await this.db.collection('properties').countDocuments({});

    this.results['geocodeCache'] = {
      status: cacheCount > 2500 ? 'PASS' : 'WARN',
      message: `${cacheCount} geocode cache entries`,
      details: { cacheCount, propertyCount, ratio: (cacheCount / propertyCount * 100).toFixed(1) + '%' }
    };
  }

  // Generate Streets CSV
  async generateStreetsCSV() {
    const streets = await this.db.collection('properties').aggregate([
      {
        $group: {
          _id: {
            streetName: '$address.streetName',
            streetType: '$address.streetType'
          },
          propertyCount: { $sum: 1 },
          exampleAddress: { $first: '$address.formatted' }
        }
      },
      {
        $sort: { '_id.streetName': 1 }
      },
      {
        $project: {
          _id: 0,
          streetName: '$_id.streetName',
          streetType: '$_id.streetType',
          propertyCount: 1,
          exampleAddress: 1
        }
      }
    ]).toArray();

    const csvContent = [
      'Street Name,Street Type,Property Count,Example Address',
      ...streets.map(street => {
        const streetName = (street.streetName || '').replace(/"/g, '""');
        const streetType = (street.streetType || '').replace(/"/g, '""');
        const exampleAddress = (street.exampleAddress || '').replace(/"/g, '""');
        return `"${streetName}","${streetType}",${street.propertyCount},"${exampleAddress}"`;
      })
    ].join('\n');

    const csvPath = path.join(__dirname, '..', '..', 'merrimac-streets.csv');
    fs.writeFileSync(csvPath, csvContent);

    console.log(`📝 Generated merrimac-streets.csv with ${streets.length} unique streets`);
    return streets.length;
  }

  // Helper function to get nested object values
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  // Print final report
  printReport() {
    const timestamp = new Date().toISOString();
    
    console.log('\n=== PHASE 2A GATE CHECK REPORT ===');
    console.log(`Run timestamp: ${timestamp}`);
    console.log('Database: merrimac-intelligence\n');

    console.log('GATE CONDITIONS:');
    console.log(`[${this.results.recordCount?.status}] 1. Record count: ${this.results.recordCount?.message}`);
    console.log(`[${this.results.geocodingFailure?.status}] 2. Geocoding failure rate: ${this.results.geocodingFailure?.message}`);
    console.log(`[${this.results.indexes?.status}] 3. Indexes: ${this.results.indexes?.message}`);
    console.log(`[${this.results.importIssues?.status}] 4. Import issues: ${this.results.importIssues?.message}`);

    console.log('\nDETAIL:');
    console.log(`3. Geocoding breakdown: ${JSON.stringify(this.results.geocodingBreakdown?.details, null, 2)}`);
    
    if (this.results.schemaCheck?.details && this.results.schemaCheck.details.length > 0) {
      console.log(`5. Schema spot check: ${this.results.schemaCheck.details.join(', ')}`);
    } else {
      console.log('5. Schema spot check: All fields present and valid');
    }
    
    console.log('6. Owner name samples:');
    this.results.titleCaseCheck?.details?.forEach((name: string, index: number) => {
      console.log(`   ${index + 1}. "${name}"`);
    });

    console.log('7. Address format samples:');
    this.results.addressFormat?.details?.forEach((address: string, index: number) => {
      console.log(`   ${index + 1}. "${address}"`);
    });

    console.log('8. Unit address samples:');
    this.results.unitAddresses?.details?.forEach((item: any, index: number) => {
      console.log(`   ${index + 1}. Unit ${item.unit}: "${item.formatted}"`);
    });

    console.log('9. Sale price samples:');
    this.results.salePriceFormat?.details?.forEach((price: any, index: number) => {
      console.log(`   ${index + 1}. ${price.value} (${price.type})`);
    });

    console.log('10. Sale date samples:');
    this.results.saleDateFormat?.details?.forEach((date: any, index: number) => {
      console.log(`   ${index + 1}. ${date.value} (${date.type})`);
    });

    console.log(`12. Geocode cache count: ${this.results.geocodeCache?.details?.cacheCount}`);

    // Overall result
    const failedGates = Object.values(this.results).filter(result => result.status === 'FAIL');
    const overallResult = failedGates.length === 0 ? 'PASS — proceed to P2B' : 'FAIL — issues listed below';

    console.log(`\nOVERALL RESULT: [${overallResult}]`);

    if (failedGates.length > 0) {
      console.log('\nFAILED CONDITIONS:');
      Object.entries(this.results).forEach(([gate, result]) => {
        if (result.status === 'FAIL') {
          console.log(`- ${gate}: ${result.message}`);
          if (result.details) {
            console.log(`  Details: ${JSON.stringify(result.details, null, 2)}`);
          }
        }
      });
    }

    console.log('===================================');
  }

  async run() {
    try {
      console.log('🚀 Starting Phase 2A Gate Check');
      console.log('📊 Running comprehensive database validation...\n');

      await this.connect();

      // Run all gate checks
      await this.checkRecordCount();
      await this.checkGeocodingFailureRate();
      await this.checkGeocodingBreakdown();
      await this.checkImportIssues();
      await this.checkSchema();
      await this.checkTitleCase();
      await this.checkAddressFormat();
      await this.checkUnitAddresses();
      await this.checkSalePriceFormat();
      await this.checkSaleDateFormat();
      await this.checkIndexes();
      await this.checkGeocodeCache();

      // Generate streets CSV
      await this.generateStreetsCSV();

      // Print final report
      this.printReport();

    } catch (error) {
      console.error('❌ Gate check failed:', error);
      process.exit(1);
    } finally {
      await this.disconnect();
    }
  }
}

// Run the gate check
if (require.main === module) {
  const gateCheck = new Phase2AGateCheck();
  gateCheck.run().catch(console.error);
}