export type Language = 'en' | 'hi' | 'mr';

export interface UserProfile {
  uid: string;
  phone: string;
  role: 'user' | 'admin';
  paymentExpiry?: string;
  loginExpiry: string;
  acceptedTerms?: boolean;
  unlockedCities?: Record<string, string>;
  language?: Language;
  loginTime?: string;
  lastActive?: string;
  selectedCity?: City;
  subscriptionStatus?: 'active' | 'expired' | 'none';
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

export const CITIES = ['Bramhapuri', 'Nagbhid', 'Wadsa', 'Armori', 'Gadchiroli'] as const;
export type City = typeof CITIES[number];

export const INITIAL_AREAS: Record<City, string[]> = {
  'Bramhapuri': ['Main Market', 'College Road', 'Station Area', 'Gujari Ward', 'Vidya Nagar', 'Shastri Ward'],
  'Nagbhid': ['Bus Stand', 'Railway Station', 'Main Road', 'Tahsil Office Area'],
  'Wadsa': ['Market Yard', 'Desaiganj', 'Kurkheda Road', 'Railway Colony'],
  'Armori': ['Main Chowk', 'College Area', 'Gadchiroli Road', 'Vairagad Road'],
  'Gadchiroli': ['Complex Area', 'Indira Gandhi Chowk', 'Collector Office Road', 'Dhanora Road', 'Chamorshi Road']
};

export const PRICING = {
  UNLOCK_FEE: 49,
  VALIDITY_DAYS: 5
};
