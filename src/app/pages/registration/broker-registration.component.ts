import { Component } from '@angular/core';

interface BrokerRegistrationForm {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  alternatePhone: string;
  dateOfBirth: string;
  nationality: string;
  emiratesId: string;
  passportNumber: string;
  
  // Company Information
  companyName: string;
  companyLicense: string;
  companyAddress: string;
  companyCity: string;
  companyCountry: string;
  yearsOfExperience: number;
  
  // Property Purchase Details
  propertyInterest: string[];
  preferredLocation: string[];
  budgetRange: string;
  propertyType: string[];
  purchaseTimeline: string;
  
  // Broker Details
  brokerLicenseNumber: string;
  brokerLicenseExpiry: string;
  commissionStructure: string;
  referralSource: string;
  
  // Additional Information
  additionalNotes: string;
  termsAccepted: boolean;
  marketingConsent: boolean;
}

@Component({
  selector: 'app-broker-registration',
  templateUrl: './broker-registration.component.html',
  styleUrls: ['./broker-registration.component.scss']
})
export class BrokerRegistrationComponent {
  formData: BrokerRegistrationForm = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    alternatePhone: '',
    dateOfBirth: '',
    nationality: '',
    emiratesId: '',
    passportNumber: '',
    companyName: '',
    companyLicense: '',
    companyAddress: '',
    companyCity: '',
    companyCountry: 'UAE',
    yearsOfExperience: 0,
    propertyInterest: [],
    preferredLocation: [],
    budgetRange: '',
    propertyType: [],
    purchaseTimeline: '',
    brokerLicenseNumber: '',
    brokerLicenseExpiry: '',
    commissionStructure: '',
    referralSource: '',
    additionalNotes: '',
    termsAccepted: false,
    marketingConsent: false
  };

  // Options for dropdowns
  nationalities = ['UAE', 'Saudi Arabia', 'Kuwait', 'Qatar', 'Bahrain', 'Oman', 'Egypt', 'Jordan', 'Lebanon', 'Other'];
  cities = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'];
  propertyTypes = ['Residential', 'Commercial', 'Villa', 'Apartment', 'Townhouse', 'Penthouse', 'Land', 'Office Space'];
  budgetRanges = [
    'Under 1M AED',
    '1M - 2M AED',
    '2M - 5M AED',
    '5M - 10M AED',
    '10M - 20M AED',
    'Above 20M AED'
  ];
  purchaseTimelines = [
    'Immediate (0-3 months)',
    'Short-term (3-6 months)',
    'Medium-term (6-12 months)',
    'Long-term (12+ months)',
    'Just exploring'
  ];
  commissionStructures = [
    'Standard (2-3%)',
    'Negotiable',
    'Fixed Amount',
    'Performance-based'
  ];
  referralSources = [
    'Website',
    'Social Media',
    'Referral from existing broker',
    'Advertisement',
    'Event/Exhibition',
    'Direct Contact',
    'Other'
  ];

  isSubmitting = false;
  submitSuccess = false;
  submitError = '';

  togglePropertyInterest(type: string) {
    const index = this.formData.propertyInterest.indexOf(type);
    if (index > -1) {
      this.formData.propertyInterest.splice(index, 1);
    } else {
      this.formData.propertyInterest.push(type);
    }
  }

  togglePropertyType(type: string) {
    const index = this.formData.propertyType.indexOf(type);
    if (index > -1) {
      this.formData.propertyType.splice(index, 1);
    } else {
      this.formData.propertyType.push(type);
    }
  }

  toggleLocation(location: string) {
    const index = this.formData.preferredLocation.indexOf(location);
    if (index > -1) {
      this.formData.preferredLocation.splice(index, 1);
    } else {
      this.formData.preferredLocation.push(location);
    }
  }

  onSubmit() {
    // Basic validation
    if (!this.formData.firstName || !this.formData.lastName || !this.formData.email || 
        !this.formData.phone || !this.formData.termsAccepted) {
      this.submitError = 'Please fill in all required fields and accept the terms.';
      return;
    }

    this.isSubmitting = true;
    this.submitError = '';

    // Simulate API call
    setTimeout(() => {
      console.log('Registration Data:', this.formData);
      this.isSubmitting = false;
      this.submitSuccess = true;
      
      // Reset form after 3 seconds
      setTimeout(() => {
        this.resetForm();
      }, 3000);
    }, 1500);
  }

  resetForm() {
    this.formData = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      alternatePhone: '',
      dateOfBirth: '',
      nationality: '',
      emiratesId: '',
      passportNumber: '',
      companyName: '',
      companyLicense: '',
      companyAddress: '',
      companyCity: '',
      companyCountry: 'UAE',
      yearsOfExperience: 0,
      propertyInterest: [],
      preferredLocation: [],
      budgetRange: '',
      propertyType: [],
      purchaseTimeline: '',
      brokerLicenseNumber: '',
      brokerLicenseExpiry: '',
      commissionStructure: '',
      referralSource: '',
      additionalNotes: '',
      termsAccepted: false,
      marketingConsent: false
    };
    this.submitSuccess = false;
    this.submitError = '';
  }
}
