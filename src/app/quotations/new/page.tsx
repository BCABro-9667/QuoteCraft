'use client';

import { QuotationCreator } from "@/components/quotations/quotation-creator";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function NewQuotationPage() {
    return (
        <ProtectedRoute>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Create Quotation</h1>
                    <p className="text-muted-foreground">
                    Fill in the details below to generate a new quotation.
                    </p>
                </div>
                <QuotationCreator />
            </div>
        </ProtectedRoute>
    )
}
