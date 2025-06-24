import type { Company, Quotation } from '@/types';

const defaultTerms = `1. Price: The prices quoted are exclusive of GST.
2. Payment: 50% advance payment, and the remaining 50% upon delivery.
3. Validity: This quotation is valid for 30 days from the date of issue.
4. Delivery: Delivery will be made within 15 working days after receipt of the advance payment.`;

export const mockCompanies: Company[] = [
  {
    id: '1',
    name: 'Innovate Solutions',
    address: '123 Tech Park, Silicon Valley',
    location: 'Bangalore',
    email: 'contact@innovate.com',
    phone: '9876543210',
    contactPerson: 'Arjun Mehra',
    gstin: '29ABCDE1234F1Z5',
    remarks: 'Leading provider of tech solutions.',
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

export const mockQuotations: Quotation[] = [
    {
        id: 'q1',
        quotationNumber: 'ET/2023-24/01',
        date: '2023-10-15',
        companyId: '1',
        products: [
            { id: 'p1', srNo: 1, name: 'Quantum Computer', model: 'QC-X1', hsn: '8471', quantity: 2, quantityType: 'Nos', price: 150000, total: 300000 },
            { id: 'p2', srNo: 2, name: 'AI Software Suite', model: 'AI-S2', hsn: '8523', quantity: 1, quantityType: 'Set', price: 75000, total: 75000 },
        ],
        grandTotal: 375000,
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
