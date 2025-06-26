'use client';

import { QuotationList } from '@/components/quotations/quotation-list';
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function QuotationsPage() {
  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">Quotation Management</h1>
          <p className="text-muted-foreground">
            View, search, and manage your quotations.
          </p>
        </div>
        <QuotationList />
      </div>
    </ProtectedRoute>
  );
}
