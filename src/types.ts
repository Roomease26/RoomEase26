export type Language = 'en' | 'hi' | 'mr';

export type UserRole = 'finder' | 'owner' | 'admin';

export interface UserProfile {
  uid: string;
  phone: string;
  role: UserRole;
  paymentExpiry?: string;
  loginExpiry: string;
  acceptedTerms?: boolean;
  unlockedCities?: Record<string, string>;
  language?: Language;
  loginTime?: string;
  lastActive?: string;
  selectedCity?: City;
  subscriptionStatus?: 'active' | 'expired' | 'none';
  subscriptionActive?: boolean;
  expiryDate?: string;
}

export interface Area {
  id: string;
  city: City;
  areaName: string;
  createdBy: string;
  createdAt: string;
}

export interface Listing {
  id: string;
  city: string;
  area: string;
  address: string;
  landmark: string;
  photos: string[];
  availability: {
    days: string;
    slots: string;
    status: 'Available Now' | 'Not Available';
  };
  ownerUid: string;
  createdAt: string;
}

export interface Chat {
  id: string;
  listingId: string;
  participants: string[];
  lastMessage?: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  text: string;
  senderUid: string;
  createdAt: string;
}

export type City = string;

export const PRICING = {
  UNLOCK_FEE: 49,
  VALIDITY_DAYS: 5
};
