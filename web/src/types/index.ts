export type VerificationStatus = 'verified' | 'partial' | 'unverified' | 'not_attempted';
export type UserRole = 'agent' | 'admin';
export type SegmentName =
  | 'Long Holder'
  | 'Active Looker'
  | 'Recent Mover'
  | 'Investor'
  | 'Downsizer'
  | 'Upgrader'
  | 'Distressed'
  | 'Off-Market Potential';

export interface User {
  id: string;
  name: string;
  initials: string;
  role: UserRole;
}

export interface Address {
  unit?: string;
  streetNumber: string;
  streetName: string;
  streetType: string;
  suburb: string;
  state: string;
  postcode: string;
  formatted: string;
  lat?: number;
  lng?: number;
  placeId?: string; // Google Places ID
  geocodeConfidence?: 'high' | 'medium' | 'low' | 'failed';
  geocodedAt?: Date;
}

export interface ContactSegment {
  name: SegmentName;
  confidence: number;
  reasoning?: string;
  assignedAt: string;
  isManualOverride: boolean;
}

export interface Property {
  _id: string;
  // Address
  rawAddress: string; // original from RPData, unmodified
  address: Address;
  
  // Property attributes
  propertyType: 'house' | 'townhouse' | 'unit' | 'land' | 'other';
  propertyTypeRaw: string; // original RPData string
  beds?: number;
  baths?: number;
  cars?: number;
  landSize?: number; // m²
  floorSize?: number; // m²
  yearBuilt?: number;
  lotPlan?: string; // from Parcel Details col V
  councilArea?: string;
  landUse?: string;
  developmentZone?: string;
  rpDataUrl?: string; // extracted from HYPERLINK formula

  // Ownership
  ownerNames: string[]; // array, Title Case
  ownerDisplayName: string; // formatted for display
  ownerType?: string; // e.g. "Owner Occupied"
  previousOwnerNames?: string[]; // vendor names

  // Sale data (most recent transaction)
  salePrice?: number; // numeric, dollars
  saleDate?: Date;
  settlementDate?: Date;
  saleType?: string;
  agency?: string;
  agent?: string;

  // Contact (populated later by ID4me — Phase 3B)
  phone?: string;
  phoneVerified: VerificationStatus;
  doNotCall: boolean;
  email?: string;
  emailVerified: VerificationStatus;
  doNotContact: boolean;

  // Segmentation (populated Phase 4)
  segments: Array<{
    name: string;
    confidence: number;
    reasoning?: string;
    assignedAt: Date;
    isManualOverride: boolean;
  }>;

  // Valuation (populated Phase 4)
  valuationLow?: number;
  valuationMid?: number;
  valuationHigh?: number;
  valuationConfidence?: 'high' | 'medium' | 'low';
  valuationUpdatedAt?: Date;

  // Interaction tracking (populated Phase 5)
  lastContactedAt?: Date;
  talkingPoint?: string;
  notes?: string;
  customTags?: string[];

  // Data provenance
  sources: {
    corelogic: boolean;
    pricefinder: boolean;
    homepass: boolean;
    csv: boolean;
  };

  // Audit
  importedAt: Date;
  updatedAt: Date;
  importBatch?: string; // timestamp of the import run
}

export interface Interaction {
  _id: string;
  propertyId: string;
  type: 'call' | 'sms' | 'email' | 'note' | 'skip';
  outcome?: string;
  note?: string;
  message?: string;
  reason?: string;
  snoozeUntil?: string;
  followUpDate?: string;
  createdAt: string;
  createdBy: string;
}

// Phase 2A specific interfaces
export interface GeocodeCacheDocument {
  _id?: string;
  formattedAddress: string; // unique index
  lat: number;
  lng: number;
  placeId: string;
  confidence: string;
  cachedAt: Date;
}

export interface ImportIssueDocument {
  _id?: string;
  importBatch: string;
  rowNumber: number;
  rawAddress: string;
  issueType: 'geocode_failed' | 'geocode_low_confidence' | 'parse_error' | 'duplicate_suspect';
  detail: string;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export interface ImportSummary {
  success: boolean;
  inserted: number;
  updated: number;
  skipped: number;
  geocodingFailures: number;
  totalProcessed: number;
  importBatch: string;
  issues: ImportIssueDocument[];
}

export interface RPDataRow {
  // Column mapping from Phase 2A spec
  propertyPhoto?: string; // Col A - skip
  streetAddress: string; // Col B
  suburb: string; // Col C
  state: string; // Col D
  postcode?: number; // Col E
  councilArea: string; // Col F
  propertyType: string; // Col G
  bed?: number; // Col H
  bath?: number; // Col I
  car?: number; // Col J
  landSize?: number; // Col K
  floorSize?: number; // Col L
  yearBuilt?: number; // Col M
  salePrice?: string; // Col N
  saleDate?: string; // Col O
  settlementDate?: string; // Col P
  saleType?: string; // Col Q
  agency?: string; // Col R
  agent?: string; // Col S
  landUse?: string; // Col T
  developmentZone?: string; // Col U
  parcelDetails?: string; // Col V - lot/plan
  owner1Name?: string; // Col W
  owner2Name?: string; // Col X
  owner3Name?: string; // Col Y
  ownerType?: string; // Col Z
  vendor1Name?: string; // Col AA
  vendor2Name?: string; // Col AB
  vendor3Name?: string; // Col AC
  rpDataLink?: string; // Col AD - HYPERLINK formula
}