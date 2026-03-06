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
  geocodeConfidence?: 'high' | 'medium' | 'low' | 'failed';
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
  address: Address;
  propertyType: 'house' | 'townhouse' | 'unit' | 'land';
  beds?: number;
  baths?: number;
  cars?: number;
  landSize?: number;
  buildingSize?: number;
  yearBuilt?: number;
  lotPlan?: string;
  zoning?: string;
  ownerName: string;
  ownerMailingAddress?: Address;
  purchaseDate?: string;
  purchasePrice?: number;
  ownershipYears?: number;
  phone?: string;
  phoneVerified: VerificationStatus;
  doNotCall: boolean;
  email?: string;
  emailVerified: VerificationStatus;
  doNotContact: boolean;
  segments: ContactSegment[];
  valuationLow?: number;
  valuationMid?: number;
  valuationHigh?: number;
  valuationConfidence?: 'high' | 'medium' | 'low';
  lastContactedAt?: string;
  talkingPoint?: string;
  sources: {
    corelogic: boolean;
    pricefinder: boolean;
    homepass: boolean;
    csv: boolean;
  };
  notes?: string;
  customTags?: string[];
  createdAt: string;
  updatedAt: string;
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