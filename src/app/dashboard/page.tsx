'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Building,
  FilePlus,
  FileText,
  PlusCircle,
  ArrowRight,
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/protected-route';

const features = [
  {
    title: 'Create New Company',
    description: 'Add a new company profile to the system.',
    href: '/companies/new',
    icon: PlusCircle,
  },
  {
    title: 'View All Companies',
    description: 'Browse and manage all company profiles.',
    href: '/companies',
    icon: Building,
  },
  {
    title: 'Create New Quotation',
    description: 'Generate a new quotation for a client.',
    href: '/quotations/new',
    icon: FilePlus,
  },
  {
    title: 'View All Quotations',
    description: 'Access and review all existing quotations.',
    href: '/quotations',
    icon: FileText,
  },
];

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto p-4 md:p-6">
        <header className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-foreground">
            Welcome to Your Dashboard
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Manage your companies and quotations from here.
          </p>
        </header>

        <main>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="group transform transition-transform duration-300 ease-in-out hover:-translate-y-2 hover:shadow-xl"
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-medium font-headline">
                    {feature.title}
                  </CardTitle>
                  <feature.icon className="h-6 w-6 text-accent" />
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {feature.description}
                  </p>
                  <Button asChild className="w-full">
                    <Link href={feature.href}>
                      Go <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
