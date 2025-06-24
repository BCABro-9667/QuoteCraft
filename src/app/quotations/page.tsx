import { QuotationList } from '@/components/quotations/quotation-list';

export default function QuotationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Quotation Management</h1>
        <p className="text-muted-foreground">
          View, search, and manage your quotations.
        </p>
      </div>
      <QuotationList />
    </div>
  );
}
