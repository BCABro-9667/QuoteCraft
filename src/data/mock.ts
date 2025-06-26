import type { Company, Quotation, UserProfile } from '@/types';

const defaultTerms = `Payment: 100% Advance
Tax: 18% GST
Freight: Extra at actual
Packing: Extra at actual
Installation: Extra at actual
Delivery: 2-3 Days confirmation of order with advance.
Validity: 30 Days.
Jurisdiction: All disputes will be referred to Faridabad, Jurisdiction on only`;

export const mockCompanies: Company[] = [
  {
    id: '1',
    name: 'AveryTech Solutions',
    address: 'Client Address, City, State, Pin',
    location: 'Bengaluru',
    email: 'fiyazahmed24@gmail.com',
    phone: '+91 8073611905',
    contactPerson: 'Mr. Fiyaz Ahmed',
    gstin: 'CLIENTGSTINHERE',
    remarks: 'From PDF example.',
  },
  {
    id: '2',
    name: 'GreenLeaf Organics',
    address: '456 Agri Complex, Farm Lane',
    location: 'Pune',
    email: 'support@greenleaf.com',
    phone: '8765432109',
    contactPerson: 'Priya Sharma',
    gstin: '27FGHIJ5678K1Z4',
    remarks: 'Specializes in organic products.',
  },
  {
    id: '3',
    name: 'Quantum Constructions',
    address: '789 Builder\'s Hub, Infra City',
    location: 'Mumbai',
    email: 'projects@quantum.com',
    phone: '7654321098',
    contactPerson: 'Rohan Verma',
    gstin: '27LMNOP9012Q1Z3',
    remarks: 'Top-tier construction services.',
  },
  {
    id: '4',
    name: 'Apex Logistics',
    address: '101 Supply Chain Rd, Industrial Area',
    location: 'Chennai',
    email: 'info@apexlogistics.com',
    phone: '6543210987',
    contactPerson: 'Anjali Desai',
    gstin: '33QRSTU3456V1Z2',
    remarks: 'Reliable logistics and shipping partner.',
  },
  {
    id: '5',
    name: 'Future Gadgets Ltd.',
    address: '210 Electronics Plaza, Circuit Nagar',
    location: 'Delhi',
    email: 'sales@futuregadgets.com',
    phone: '5432109876',
    contactPerson: 'Vikram Singh',
    gstin: '07WXYZA7890B1Z1',
    remarks: 'Cutting-edge electronic devices.',
  },
];

export const mockUserProfile: UserProfile = {
    id: 'user-profile',
    companyName: 'ESTOVIR TECHNOLOGIES',
    logoUrl: 'https://fplogoimages.withfloats.com/tile/63b3e90ca4c3440001407fbd.png',
    email: 'sales@estovir.in',
    website: 'www.estovirsmt.com',
    phone: '0124-4013575',
    mobile: '9311225593',
    whatsapp: '9311225593',
    address: 'Plot No. 89, HSIIDC Industrial Estate, Sector-59, Faridabad - 121',
    gstin: '06AANPP5476E1ZD',
    quotationPrefix: 'ET',
};

export const mockQuotations: Quotation[] = [
    {
        id: 'q1',
        quotationNumber: 'ET/2024-25/0262',
        date: '2024-07-09',
        companyId: '1',
        products: [
            { id: 'p1', srNo: 1, name: 'Automatic Loose Radial Lead Cutter', model: 'ARP 366', hsn: '84678990', quantity: 1, quantityType: 'Nos', price: 148000, total: 148000 },
            { id: 'p2', srNo: 2, name: 'Universal Manual Pre-former', model: 'UMP 870', hsn: '84678990', quantity: 1, quantityType: 'Nos', price: 6500, total: 6500 },
        ],
        grandTotal: 154500,
        termsAndConditions: defaultTerms,
    },
    {
        id: 'q2',
        quotationNumber: 'ET/2023-24/02',
        date: '2023-11-01',
        companyId: '3',
        products: [
            { id: 'p3', srNo: 1, name: 'High-Tensile Steel Beams', model: 'HT-500', hsn: '7214', quantity: 50, quantityType: 'Kg', price: 120, total: 6000 },
        ],
        grandTotal: 6000,
        termsAndConditions: defaultTerms,
    }
];
