'use client';

import { ProfileForm } from "@/components/profile/profile-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function ProfilePage() {
    return (
        <ProtectedRoute>
            <div className="max-w-4xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">My Company Profile</CardTitle>
                        <CardDescription>Update your company's information and branding.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ProfileForm />
                    </CardContent>
                </Card>
            </div>
        </ProtectedRoute>
    )
}
