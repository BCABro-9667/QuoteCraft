'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { QuotationCreator } from "@/components/quotations/quotation-creator";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Loader2 } from 'lucide-react';

function NewQuotationPageContent() {
    const searchParams = useSearchParams();
    const quotationId = searchParams.get('id');

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">{quotationId ? 'Edit Quotation' : 'Create Quotation'}</h1>
                <p className="text-muted-foreground">
                {quotationId ? 'Update the details for this quotation.' : 'Fill in the details below to generate a new quotation.'}
                </p>
            </div>
            <QuotationCreator quotationId={quotationId ?? undefined} />
        </div>
    );
}


export default function NewQuotationPage() {
    return (
        <ProtectedRoute>
            <Suspense fallback={<div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
                <NewQuotationPageContent />
            </Suspense>
        </ProtectedRoute>
    )
}
