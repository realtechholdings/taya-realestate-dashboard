import * as XLSX from 'xlsx';
import { RPDataRow } from '@/types';

// Parse RPData XLSX file according to Phase 2A specification
export function parseRPDataXLSX(buffer: Buffer): RPDataRow[] {
  try {
    // Read the workbook from buffer
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    
    // Get the first worksheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON array (this will include all rows)
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as any[][];
    
    // Skip rows 1-3 (metadata and headers) - data starts at row 4 (index 3)
    if (rawData.length <= 3) {
      throw new Error('XLSX file does not contain enough rows - expected data starting from row 4');
    }
    
    const dataRows = rawData.slice(3); // Skip first 3 rows
    const properties: RPDataRow[] = [];
    
    // Process each data row
    dataRows.forEach((row: any[], index: number) => {
      // Skip empty rows
      if (!row || row.length === 0 || !row[1]) { // Check if street address (col B) is present
        return;
      }
      
      try {
        // Map columns according to Phase 2A specification (A-AD = 0-29)
        const property: RPDataRow = {
          // Col A - Property Photo (skip)
          propertyPhoto: row[0] || undefined,
          
          // Col B - Street Address (required)
          streetAddress: row[1] || '',
          
          // Col C - Suburb  
          suburb: row[2] || '',
          
          // Col D - State
          state: row[3] || '',
          
          // Col E - Postcode
          postcode: parseNumber(row[4]),
          
          // Col F - Council Area
          councilArea: row[5] || '',
          
          // Col G - Property Type
          propertyType: row[6] || '',
          
          // Col H - Bed
          bed: parseNumber(row[7]),
          
          // Col I - Bath
          bath: parseNumber(row[8]),
          
          // Col J - Car
          car: parseNumber(row[9]),
          
          // Col K - Land Size (m²)
          landSize: parseNumber(row[10]),
          
          // Col L - Floor Size (m²)
          floorSize: parseNumber(row[11]),
          
          // Col M - Year Built
          yearBuilt: parseNumber(row[12]),
          
          // Col N - Sale Price
          salePrice: row[13] || undefined,
          
          // Col O - Sale Date
          saleDate: row[14] || undefined,
          
          // Col P - Settlement Date
          settlementDate: parseNullableString(row[15]),
          
          // Col Q - Sale Type
          saleType: row[16] || undefined,
          
          // Col R - Agency
          agency: row[17] || undefined,
          
          // Col S - Agent
          agent: row[18] || undefined,
          
          // Col T - Land Use
          landUse: row[19] || undefined,
          
          // Col U - Development Zone
          developmentZone: row[20] || undefined,
          
          // Col V - Parcel Details (lot/plan)
          parcelDetails: row[21] || undefined,
          
          // Col W - Owner 1 Name
          owner1Name: parseNullableString(row[22]),
          
          // Col X - Owner 2 Name
          owner2Name: parseNullableString(row[23]),
          
          // Col Y - Owner 3 Name
          owner3Name: parseNullableString(row[24]),
          
          // Col Z - Owner Type
          ownerType: row[25] || undefined,
          
          // Col AA - Vendor 1 Name
          vendor1Name: parseNullableString(row[26]),
          
          // Col AB - Vendor 2 Name
          vendor2Name: parseNullableString(row[27]),
          
          // Col AC - Vendor 3 Name
          vendor3Name: parseNullableString(row[28]),
          
          // Col AD - Open in RPData (HYPERLINK formula)
          rpDataLink: row[29] || undefined,
        };
        
        properties.push(property);
      } catch (error) {
        console.error(`Error parsing row ${index + 4}:`, error);
        // Continue processing other rows
      }
    });
    
    console.log(`Parsed ${properties.length} properties from XLSX file`);
    return properties;
    
  } catch (error) {
    console.error('Error parsing XLSX file:', error);
    throw new Error(`Failed to parse XLSX file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper function to parse numbers, returning undefined for invalid values
function parseNumber(value: any): number | undefined {
  if (value === null || value === undefined || value === '' || value === '-') {
    return undefined;
  }
  
  const num = Number(value);
  return isNaN(num) ? undefined : num;
}

// Helper function to parse strings, treating "-" as null/undefined
function parseNullableString(value: any): string | undefined {
  if (value === null || value === undefined || value === '' || value === '-') {
    return undefined;
  }
  
  return String(value);
}

// Validate that the XLSX file has the expected structure
export function validateRPDataXLSX(buffer: Buffer): { valid: boolean; error?: string } {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    
    if (workbook.SheetNames.length === 0) {
      return { valid: false, error: 'No worksheets found in XLSX file' };
    }
    
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as any[][];
    
    if (rawData.length < 4) {
      return { valid: false, error: 'XLSX file must have at least 4 rows (metadata + headers + data)' };
    }
    
    // Check if row 1 contains search metadata (should have "Search String" in first cell)
    const row1 = rawData[0];
    if (!row1 || !String(row1[0]).toLowerCase().includes('search')) {
      console.warn('Warning: Row 1 does not appear to contain search metadata');
    }
    
    // Check if row 3 contains headers (should have "Street Address" in column B)
    const row3 = rawData[2];
    if (!row3 || !String(row3[1]).toLowerCase().includes('street')) {
      return { valid: false, error: 'Row 3 should contain column headers with "Street Address" in column B' };
    }
    
    // Check if there's actual data starting from row 4
    const dataRows = rawData.slice(3);
    if (dataRows.length === 0) {
      return { valid: false, error: 'No data rows found starting from row 4' };
    }
    
    return { valid: true };
    
  } catch (error) {
    return { 
      valid: false, 
      error: `Failed to validate XLSX file: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}