

export interface Company {
  _id: string; // From MongoDB
  id: string; // Virtual
  name: string;
  address?: string;
  location?: string;
  email?: string;
  phone?: string;
  contactPerson?: string;
  gstin?: string;
  remarks?: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  companyName: string;
  logoUrl: string;
  email: string;
  website: string;
  phone: string;
  mobile: string;
  whatsapp: string;
  address: string;
  gstin: string;
  quotationPrefix: string;
}

export const quantityTypes = ['Set', 'Nos', 'Piece', 'Pair', 'Kg', 'Meter'] as const;
export type QuantityType = (typeof quantityTypes)[number];

export interface Product {
  _id: string; // From MongoDB
  id: string; // Virtual
  srNo: number;
  name: string;
  model?: string;
  hsn: string;
  quantity: number;
  quantityType: QuantityType;
  price: number;
  total: number;
}

export const quotationStatuses = ['Pending', 'Complete', 'Rejected'] as const;
export type QuotationStatus = (typeof quotationStatuses)[number];

export interface Quotation {
  _id: string; // From MongoDB
  id: string; // Virtual
  quotationNumber: string;
  date: string;
  companyId: string;
  company?: Company;
  products: Product[];
  grandTotal: number;
  termsAndConditions: string;
  referencedBy: string;
  createdBy: string;
  progress: QuotationStatus;
}

export interface UserCredentials {
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
}

export interface User {
  id: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}
