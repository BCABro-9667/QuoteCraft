'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CompanyForm } from "@/components/companies/company-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Loader2 } from 'lucide-react';

function CompanyPageContent() {
    const searchParams = useSearchParams();
    const companyId = searchParams.get('id');

    return (
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
    );
}

export default function NewCompanyPage() {
    return (
        <ProtectedRoute>
            <Suspense fallback={<div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
                <CompanyPageContent />
            </Suspense>
        </ProtectedRoute>
    )
}
