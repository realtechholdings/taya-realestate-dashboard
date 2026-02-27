// MongoDB Schemas for Taya's Real Estate Dashboard
const mongoose = require('mongoose');

// Property Schema
const PropertySchema = new mongoose.Schema({
  // Basic Property Information
  address: {
    street: { type: String, required: true },
    suburb: { type: String, required: true, default: 'Merrimac' },
    state: { type: String, required: true, default: 'QLD' },
    postcode: { type: String, required: true, default: '4226' },
    fullAddress: { type: String, required: true },
  },
  
  // Property Details
  propertyType: {
    type: String,
    enum: ['House', 'Unit', 'Townhouse', 'Villa', 'Duplex', 'Land', 'Other'],
    required: true
  },
  bedrooms: { type: Number, min: 0 },
  bathrooms: { type: Number, min: 0 },
  carSpaces: { type: Number, min: 0, default: 0 },
  landSize: { type: Number }, // in square meters
  buildingArea: { type: Number }, // in square meters
  yearBuilt: { type: Number },
  
  // Location Data
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  
  // Valuation Information
  currentValuation: {
    estimate: { type: Number },
    confidence: { type: String, enum: ['High', 'Medium', 'Low'] },
    source: { type: String },
    lastUpdated: { type: Date, default: Date.now }
  },
  
  // Market Data
  marketHistory: [{
    type: { type: String, enum: ['Sale', 'Lease', 'Listed', 'Withdrawn'] },
    date: { type: Date },
    price: { type: Number },
    source: { type: String }
  }],
  
  // Owner Information Reference
  owners: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PropertyOwner' }],
  
  // Data Sources
  dataSources: [{
    source: { type: String }, // 'Domain', 'RealEstate.com.au', etc.
    externalId: { type: String },
    lastSynced: { type: Date, default: Date.now }
  }],
  
  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Property Owner Schema
const PropertyOwnerSchema = new mongoose.Schema({
  // Personal Information
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  fullName: { type: String, required: true },
  
  // Contact Information
  email: {
    address: { type: String },
    verified: { type: Boolean, default: false },
    verificationDate: { type: Date }
  },
  phone: {
    mobile: { type: String },
    home: { type: String },
    verified: { type: Boolean, default: false },
    verificationDate: { type: Date }
  },
  
  // Demographics
  estimatedAge: { type: Number },
  occupation: { type: String },
  householdIncome: { type: String, enum: ['Low', 'Medium', 'High', 'Very High'] },
  
  // Property Ownership
  properties: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }],
  ownershipType: { type: String, enum: ['Owner-Occupier', 'Investor', 'Mixed'] },
  
  // AI Segmentation
  prospectSegment: {
    category: {
      type: String,
      enum: ['Hot Prospect', 'Market Mover', 'Investment Opportunity', 'Service Needs', 'Lifecycle Trigger'],
      required: true
    },
    score: { type: Number, min: 0, max: 100 },
    reasons: [{ type: String }],
    lastAssessed: { type: Date, default: Date.now }
  },
  
  // Communication History
  interactions: [{
    date: { type: Date, default: Date.now },
    type: { type: String, enum: ['Call', 'Email', 'SMS', 'Letter', 'Visit', 'Meeting'] },
    outcome: { type: String, enum: ['Connected', 'No Answer', 'Voicemail', 'Interested', 'Not Interested', 'Follow-up Scheduled'] },
    notes: { type: String },
    nextAction: {
      date: { type: Date },
      action: { type: String }
    }
  }],
  
  // Preferences & Notes
  preferredContact: { type: String, enum: ['Phone', 'Email', 'SMS', 'Letter'] },
  doNotContact: { type: Boolean, default: false },
  tags: [{ type: String }],
  notes: { type: String },
  
  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Daily Action Item Schema
const ActionItemSchema = new mongoose.Schema({
  // Target Information
  propertyOwner: { type: mongoose.Schema.Types.ObjectId, ref: 'PropertyOwner', required: true },
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  
  // Action Details
  actionType: {
    type: String,
    enum: ['First Contact', 'Follow-up Call', 'Email Campaign', 'Property Valuation', 'Market Update', 'Service Offer'],
    required: true
  },
  priority: { type: Number, min: 1, max: 10, default: 5 },
  
  // Scheduling
  scheduledDate: { type: Date, required: true },
  estimatedDuration: { type: Number }, // in minutes
  
  // Content
  title: { type: String, required: true },
  description: { type: String },
  callScript: { type: String },
  emailTemplate: { type: String },
  
  // Status
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed', 'Skipped', 'Rescheduled'],
    default: 'Pending'
  },
  completedAt: { type: Date },
  result: {
    outcome: { type: String },
    notes: { type: String },
    nextAction: {
      date: { type: Date },
      action: { type: String }
    }
  },
  
  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Performance Analytics Schema
const AnalyticsSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  
  // Daily Metrics
  metrics: {
    totalCalls: { type: Number, default: 0 },
    connectedCalls: { type: Number, default: 0 },
    appointments: { type: Number, default: 0 },
    listings: { type: Number, default: 0 },
    prospects: { type: Number, default: 0 }
  },
  
  // Conversion Rates by Segment
  segmentPerformance: [{
    segment: { type: String },
    contacts: { type: Number },
    responses: { type: Number },
    appointments: { type: Number },
    conversions: { type: Number }
  }],
  
  // Properties Processed
  propertiesUpdated: { type: Number, default: 0 },
  newProperties: { type: Number, default: 0 },
  
  createdAt: { type: Date, default: Date.now }
});

// Create indexes for better performance
PropertySchema.index({ 'address.fullAddress': 1 });
PropertySchema.index({ 'coordinates.lat': 1, 'coordinates.lng': 1 });
PropertySchema.index({ 'currentValuation.estimate': -1 });

PropertyOwnerSchema.index({ fullName: 1 });
PropertyOwnerSchema.index({ 'email.address': 1 });
PropertyOwnerSchema.index({ 'phone.mobile': 1 });
PropertyOwnerSchema.index({ 'prospectSegment.category': 1, 'prospectSegment.score': -1 });

ActionItemSchema.index({ scheduledDate: 1, priority: -1 });
ActionItemSchema.index({ status: 1, scheduledDate: 1 });

AnalyticsSchema.index({ date: -1 });

// Export models
module.exports = {
  Property: mongoose.model('Property', PropertySchema),
  PropertyOwner: mongoose.model('PropertyOwner', PropertyOwnerSchema),
  ActionItem: mongoose.model('ActionItem', ActionItemSchema),
  Analytics: mongoose.model('Analytics', AnalyticsSchema)
};