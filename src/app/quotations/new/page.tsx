'use client';

import { useSearchParams } from 'next/navigation';
import { QuotationCreator } from "@/components/quotations/quotation-creator";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function NewQuotationPage() {
    const searchParams = useSearchParams();
    const quotationId = searchParams.get('id');

    return (
        <ProtectedRoute>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold font-headline">{quotationId ? 'Edit Quotation' : 'Create Quotation'}</h1>
                    <p className="text-muted-foreground">
                    {quotationId ? 'Update the details for this quotation.' : 'Fill in the details below to generate a new quotation.'}
                    </p>
                </div>
                <QuotationCreator quotationId={quotationId ?? undefined} />
            </div>
        </ProtectedRoute>
    )
}
