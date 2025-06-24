'use client';

import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockQuotations, mockCompanies } from '@/data/mock';
import type { Quotation } from '@/types';
import {
  PlusCircle,
  Search,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import useLocalStorage from '@/hooks/use-local-storage';
import { formatCurrency } from '@/lib/utils';


export function QuotationList() {
  const [quotations] = useLocalStorage<Quotation[]>('quotations', mockQuotations);
  const [companies] = useLocalStorage('companies', mockCompanies);
  const [searchTerm, setSearchTerm] = useState('');

  const enrichedQuotations = useMemo(() => {
    return quotations.map(q => ({
      ...q,
      company: companies.find(c => c.id === q.companyId),
    }));
  }, [quotations, companies]);

  const filteredQuotations = useMemo(() => {
    return enrichedQuotations.filter(
      (q) =>
        q.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.company?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [enrichedQuotations, searchTerm]);

  return (
    <div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by number or company..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button asChild>
            <Link href="/quotations/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Quotation
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuotations.length > 0 ? (
                filteredQuotations.map(q => (
                    <Card key={q.id} className="flex flex-col">
                        <CardHeader>
                            <div className='flex justify-between items-start'>
                                <div>
                                    <p className="font-bold text-primary">{q.quotationNumber}</p>
                                    <h3 className="font-headline text-xl">{q.company?.name || 'N/A'}</h3>
                                </div>
                                <p className="text-sm text-muted-foreground">{q.date}</p>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow flex flex-col justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    {q.products.length} item(s)
                                </p>
                                <p className="text-2xl font-bold mt-2">{formatCurrency(q.grandTotal)}</p>
                            </div>
                            <Button variant="outline" className="w-full mt-4">
                                View Details <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </CardContent>
                    </Card>
                ))
            ) : (
                <div className="col-span-full text-center py-12">
                    <p className="text-muted-foreground">No quotations found.</p>
                </div>
            )}
        </div>
    </div>
  );
}
