export interface Company {
  id: string;
  name: string;
  address: string;
  location: string;
  email: string;
  phone: string;
  contactPerson: string;
  gstin: string;
  remarks: string;
}

export const quantityTypes = ['Set', 'Nos', 'Piece', 'Pair', 'Kg', 'Meter'] as const;
export type QuantityType = (typeof quantityTypes)[number];

export interface Product {
  id: string;
  srNo: number;
  name: string;
  model: string;
  hsn: string;
  quantity: number;
  quantityType: QuantityType;
  price: number;
  total: number;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  date: string;
  companyId: string;
  company?: Company;
  products: Product[];
  grandTotal: number;
  termsAndConditions: string;
}
