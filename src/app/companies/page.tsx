'use client';

import { CompanyList } from '@/components/companies/company-list';
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function CompaniesPage() {
  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">Company Management</h1>
          <p className="text-muted-foreground">
            View, search, and manage your company profiles.
          </p>
        </div>
        <CompanyList />
      </div>
    </ProtectedRoute>
  );
}
