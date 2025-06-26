'use client';

import { CompanyForm } from "@/components/companies/company-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function NewCompanyPage() {
    return (
        <ProtectedRoute>
            <div className="max-w-4xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">Company Profile</CardTitle>
                        <CardDescription>Enter the details for the new company.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CompanyForm />
                    </CardContent>
                </Card>
            </div>
        </ProtectedRoute>
    )
}
