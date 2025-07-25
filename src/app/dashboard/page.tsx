'use client';

import { useEffect, useState, Suspense } from 'react';
import type { LucideIcon } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import {
  Building,
  FilePlus,
  FileText,
  PlusCircle,
  ArrowRight,
  Users,
  BarChart,
  CheckCircle,
  Clock,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { getCompanyCount } from '@/lib/actions/company.actions';
import { getQuotationStats } from '@/lib/actions/quotation.actions';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    description: string;
    isLoading: boolean;
}

const StatCard = ({ title, value, icon: Icon, description, isLoading }: StatCardProps) => (
    <Card className="transition-all hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <Skeleton className="h-7 w-12" />
        ) : (
            <div className="text-2xl font-bold">{value}</div>
        )}
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
);

const actions = [
  {
    title: 'Create New Quotation',
    description: 'Generate a new quotation for a client.',
    href: '/quotations/new',
    icon: FilePlus,
  },
  {
    title: 'Add New Company',
    description: 'Add a new company profile to the system.',
    href: '/companies/new',
    icon: PlusCircle,
  },
  {
    title: 'Manage Companies',
    description: 'Browse and manage all company profiles.',
    href: '/companies',
    icon: Building,
  },
  {
    title: 'Manage Quotations',
    description: 'Access and review all existing quotations.',
    href: '/quotations',
    icon: FileText,
  },
];


function DashboardPageContent() {
    const { user, loading: authLoading } = useAuth();
    const searchParams = useSearchParams();
    const [showAlert, setShowAlert] = useState(false);
    const [stats, setStats] = useState<{
        companies: number;
        quotations: { total: number; pending: number; completed: number; rejected: number };
    } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        if (searchParams.get('login') === 'success') {
          setShowAlert(true);
          const timer = setTimeout(() => {
            setShowAlert(false);
            // Optional: remove the query param from URL without reloading the page
            window.history.replaceState(null, '', '/dashboard');
          }, 5000);
          return () => clearTimeout(timer);
        }
    }, [searchParams]);

    useEffect(() => {
        if (!authLoading && user) {
            const fetchStats = async () => {
                setIsLoading(true);
                try {
                    const [companyCount, quotationStats] = await Promise.all([
                        getCompanyCount(),
                        getQuotationStats(),
                    ]);
                    setStats({ companies: companyCount, quotations: quotationStats });
                } catch (error: any) {
                    console.error("Failed to fetch dashboard stats:", error);
                    toast({
                      variant: 'destructive',
                      title: 'Failed to load dashboard stats',
                      description: error.message,
                    });
                } finally {
                    setIsLoading(false);
                }
            };
            fetchStats();
        } else if (!authLoading && !user) {
            setIsLoading(false);
        }
    }, [user, authLoading, toast]);
    
  return (
      <div className="flex flex-col gap-6 md:gap-8">
        {showAlert && user && (
            <Alert variant="success">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Welcome back, {user.firstName || 'User'}!</AlertTitle>
                <AlertDescription>You’ve successfully logged in.</AlertDescription>
            </Alert>
        )}
        <header className="space-y-1.5">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl font-headline">
                Welcome back, {user?.firstName || 'User'}!
            </h1>
            <p className="text-muted-foreground">
                Here's a snapshot of your business activity.
            </p>
        </header>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total Companies" value={stats?.companies ?? 0} icon={Users} description="All client companies managed." isLoading={isLoading} />
            <StatCard title="Total Quotations" value={stats?.quotations.total ?? 0} icon={BarChart} description="All quotations generated." isLoading={isLoading} />
            <StatCard title="Pending Quotations" value={stats?.quotations.pending ?? 0} icon={Clock} description="Quotations awaiting action." isLoading={isLoading} />
            <StatCard title="Completed Deals" value={stats?.quotations.completed ?? 0} icon={CheckCircle} description="Quotations marked as complete." isLoading={isLoading} />
        </div>

        <Card className="col-span-1 md:col-span-2">
            <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Get started with your most common tasks.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {actions.map((action) => (
                    <Link href={action.href} key={action.title} className="group flex flex-col justify-between rounded-lg border bg-card p-4 transition-all hover:bg-accent/50 hover:shadow-md">
                       <div>
                        <action.icon className="h-8 w-8 text-primary mb-3" />
                        <h3 className="font-semibold">{action.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
                       </div>
                        <div className="flex items-center text-sm font-medium text-primary mt-4 opacity-0 transition-opacity group-hover:opacity-100">
                            Let's go <ArrowRight className="ml-2 h-4 w-4" />
                        </div>
                    </Link>
                ))}
            </CardContent>
        </Card>
      </div>
  );
}


export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
        <DashboardPageContent />
      </Suspense>
    </ProtectedRoute>
  );
}
