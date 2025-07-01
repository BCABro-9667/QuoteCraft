'use client';

import { useSearchParams } from 'next/navigation';
import { CompanyForm } from "@/components/companies/company-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function NewCompanyPage() {
    const searchParams = useSearchParams();
    const companyId = searchParams.get('id');

    return (
        <ProtectedRoute>
            <div className="max-w-4xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">{companyId ? 'Edit Company' : 'Company Profile'}</CardTitle>
                        <CardDescription>{companyId ? 'Update the company details.' : 'Enter the details for the new company.'}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CompanyForm companyId={companyId ?? undefined} />
                    </CardContent>
                </Card>
            </div>
        </ProtectedRoute>
    )
}
