import { Address } from '@/types';

// Street type abbreviation mapping
const STREET_TYPE_ABBREV: Record<string, string> = {
  'RD': 'Road',
  'ST': 'Street', 
  'CT': 'Court',
  'DR': 'Drive',
  'AVE': 'Avenue',
  'PL': 'Place',
  'CL': 'Close',
  'CR': 'Crescent',
  'TCE': 'Terrace',
  'BLVD': 'Boulevard',
  'HWY': 'Highway'
};

// Convert ALL CAPS to Title Case with proper handling of Mc/Mac/O' prefixes
export function toTitleCase(str: string): string {
  let result = str.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  
  // Handle Scottish/Irish name prefixes
  result = result
    // Handle Mc prefixes: McCormick, McConnell, etc.
    .replace(/\bMc([a-z])/g, 'Mc$1'.replace('Mc' + '$1', 'Mc' + '$1'.toUpperCase()))
    .replace(/\bMc([a-z])/g, (match, p1) => 'Mc' + p1.toUpperCase())
    
    // Handle Mac prefixes: MacDonald, MacLeod, etc.
    .replace(/\bMac([a-z])/g, (match, p1) => 'Mac' + p1.toUpperCase())
    
    // Handle O' prefixes: O'Connor, O'Brien, etc.
    .replace(/\bO'([a-z])/g, (match, p1) => "O'" + p1.toUpperCase());
    
  return result;
}

// Parse owner names and convert to Title Case
export function parseOwnerNames(owner1?: string, owner2?: string, owner3?: string): {
  ownerNames: string[];
  ownerDisplayName: string;
} {
  const names: string[] = [];
  
  // Filter out null, undefined, empty, and "-" values
  [owner1, owner2, owner3].forEach(name => {
    if (name && name.trim() !== '' && name.trim() !== '-') {
      names.push(toTitleCase(name.trim()));
    }
  });

  let displayName = '';
  if (names.length === 1) {
    displayName = names[0];
  } else if (names.length === 2) {
    displayName = `${names[0]} & ${names[1]}`;
  } else if (names.length === 3) {
    displayName = `${names[0]}, ${names[1]} & ${names[2]}`;
  }

  return {
    ownerNames: names,
    ownerDisplayName: displayName
  };
}

// Parse previous owner names (vendors)
export function parsePreviousOwnerNames(vendor1?: string, vendor2?: string, vendor3?: string): string[] {
  const names: string[] = [];
  
  [vendor1, vendor2, vendor3].forEach(name => {
    if (name && name.trim() !== '' && name.trim() !== '-') {
      names.push(toTitleCase(name.trim()));
    }
  });

  return names;
}

// Normalize property type from RPData verbose strings
export function normalizePropertyType(rpDataType: string): 'house' | 'townhouse' | 'unit' | 'land' | 'other' {
  const type = rpDataType.toLowerCase();
  
  if (type.includes('unit') || type.includes('apartment')) {
    return 'unit';
  }
  if (type.includes('townhouse') || type.includes('villa')) {
    return 'townhouse';
  }
  if (type.includes('house')) {
    return 'house';
  }
  if (type.includes('land') || type.includes('vacant')) {
    return 'land';
  }
  
  return 'other';
}

// Parse sale price from "$878,500" format to numeric
export function parseSalePrice(priceStr?: string): number | undefined {
  if (!priceStr || priceStr === '-') return undefined;
  
  // Remove $ and commas, then parse to number
  const cleaned = priceStr.replace(/[$,]/g, '');
  const parsed = parseInt(cleaned, 10);
  
  return isNaN(parsed) ? undefined : parsed;
}

// Parse sale date from "27 Feb 2026" format to Date
export function parseSaleDate(dateStr?: string): Date | undefined {
  if (!dateStr || dateStr === '-') return undefined;
  
  try {
    // Use Date constructor which can parse "27 Feb 2026" format
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? undefined : date;
  } catch {
    return undefined;
  }
}

// Extract URL from Excel HYPERLINK formula
export function extractRPDataUrl(hyperlinkFormula?: string): string | undefined {
  if (!hyperlinkFormula) return undefined;
  
  // Extract URL from HYPERLINK formula like =HYPERLINK("https://...", "Open in RPData")
  const match = hyperlinkFormula.match(/HYPERLINK\("([^"]+)"/);
  return match ? match[1] : undefined;
}

// Main address parsing function
export function parseAddress(streetAddress: string, suburb: string, state: string, postcode: number): Address {
  // Trim whitespace
  const address = streetAddress.trim();
  
  let unit: string | undefined;
  let streetNumber: string;
  let streetName: string;
  let streetType: string;
  
  // Check for unit prefix (e.g., "62/6-10 BOURTON ROAD")
  const unitMatch = address.match(/^(\d+)\//);
  if (unitMatch) {
    unit = unitMatch[1];
    // Remove unit prefix for further parsing
    const remainingAddress = address.substring(unitMatch[0].length);
    
    // Parse the remaining address
    const parts = remainingAddress.trim().split(/\s+/);
    streetNumber = parts[0] || '';
    streetName = parts.slice(1, -1).join(' ') || '';
    streetType = parts[parts.length - 1] || '';
  } else {
    // No unit, parse normally
    const parts = address.split(/\s+/);
    streetNumber = parts[0] || '';
    streetName = parts.slice(1, -1).join(' ') || '';
    streetType = parts[parts.length - 1] || '';
  }
  
  // Expand street type abbreviations
  const normalizedStreetType = STREET_TYPE_ABBREV[streetType.toUpperCase()] || toTitleCase(streetType);
  
  // Convert to Title Case
  const normalizedStreetName = toTitleCase(streetName);
  
  // Create standardized address string
  const formatted = `${unit ? unit + '/' : ''}${streetNumber} ${normalizedStreetName} ${normalizedStreetType}, ${suburb} ${state} ${postcode}`;
  
  return {
    unit,
    streetNumber,
    streetName: normalizedStreetName,
    streetType: normalizedStreetType,
    suburb: suburb.toLowerCase().replace(/\b\w/g, l => l.toUpperCase()), // Title case
    state: state.toUpperCase(),
    postcode: postcode.toString(),
    formatted,
    geocodeConfidence: undefined // Will be set during geocoding
  };
}