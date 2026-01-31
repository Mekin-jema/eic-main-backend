import { Schema, model } from 'mongoose';
import { applyBaseSchemaOptions } from './base';

const AttendeeRegistrationSchema = applyBaseSchemaOptions(
  new Schema(
    {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String, required: true, unique: true, index: true },
      phoneNumber: { type: String, required: true },
      organization: { type: String, required: true },
      country: { type: String, required: true },
      isCheckedIn: { type: Boolean, default: false },
      checkInTime: { type: Date },
      checkOutTime: { type: Date },
      lastScannedAt: { type: Date },
      scanCount: { type: Number, default: 0 },
      businessLicenseUrl: { type: String },
      needsVisa: { type: Boolean, default: false },
      attendance: { type: String, enum: ['day1', 'day2', 'both'], default: null },
      category: { type: String, enum: ['inv', 'loc', 'gov', 'dip', 'med', 'aca', 'con', 'oth'], default: null },
      communicationPreference: { type: String, enum: ['email', 'phone', 'both'], required: true },
      companyName: { type: String },
      companySector: { type: String },
      hasExistingCompany: { type: Boolean, default: false },
      jobTitle: { type: String, required: true },
      passportCopyUrl: { type: String },
      sectorInterest: { type: String },
      siteVisit: { type: Boolean, default: false },
      specialRequirements: { type: String },
      registrationType: { type: String },
      occupation: { type: String },
      age: { type: Number },
      groupSize: { type: Number },
      interests: { type: [String], default: [] },
    },
    { timestamps: true }
  )
);

export default model('AttendeeRegistration', AttendeeRegistrationSchema);
