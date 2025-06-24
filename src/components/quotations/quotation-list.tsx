'use client';

import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { mockQuotations, mockCompanies } from '@/data/mock';
import type { Quotation } from '@/types';
import {
  PlusCircle,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  FileDown as DownloadIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useLocalStorage from '@/hooks/use-local-storage';
import { formatCurrency } from '@/lib/utils';

const ITEMS_PER_PAGE = 5;

export function QuotationList() {
  const [quotations, setQuotations] = useLocalStorage<Quotation[]>('quotations', mockQuotations);
  const [companies] = useLocalStorage('companies', mockCompanies);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const router = useRouter();


  const enrichedQuotations = useMemo(() => {
    return quotations.map(q => ({
      ...q,
      company: companies.find(c => c.id === q.companyId),
    })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [quotations, companies]);

  const filteredQuotations = useMemo(() => {
    const lowercasedTerm = searchTerm.toLowerCase();
    return enrichedQuotations.filter(
      (q) =>
        q.quotationNumber.toLowerCase().includes(lowercasedTerm) ||
        q.company?.name.toLowerCase().includes(lowercasedTerm) ||
        q.company?.email?.toLowerCase().includes(lowercasedTerm) ||
        q.company?.location?.toLowerCase().includes(lowercasedTerm)
    );
  }, [enrichedQuotations, searchTerm]);

  const paginatedQuotations = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredQuotations.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredQuotations, currentPage]);

  const totalPages = Math.ceil(filteredQuotations.length / ITEMS_PER_PAGE);

  const handleDelete = (quotationId: string) => {
    setQuotations(quotations.filter((q) => q.id !== quotationId));
  };
  
  const handleDownloadPdf = (quotationId: string) => {
      alert(`PDF download for quotation ID: ${quotationId} is not implemented yet.`);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by number, company, email..."
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
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quotation No</TableHead>
                <TableHead>Company Name</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead className="hidden lg:table-cell">Location</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedQuotations.length > 0 ? (
                paginatedQuotations.map((quotation) => (
                  <TableRow key={quotation.id}>
                    <TableCell className="font-medium">{quotation.quotationNumber}</TableCell>
                    <TableCell>{quotation.company?.name || 'N/A'}</TableCell>
                    <TableCell className="hidden md:table-cell">{quotation.company?.email || 'N/A'}</TableCell>
                    <TableCell className="hidden lg:table-cell">{quotation.company?.location || 'N/A'}</TableCell>
                    <TableCell>
                      <AlertDialog>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedQuotation(quotation)}>
                              <Eye className="mr-2 h-4 w-4" /> View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownloadPdf(quotation.id)}>
                              <DownloadIcon className="mr-2 h-4 w-4" /> Download PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/quotations/new?id=${quotation.id}`)}>
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the quotation "{quotation.quotationNumber}".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(quotation.id)} className="bg-destructive hover:bg-destructive/90">
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    No quotations found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {totalPages > 1 && (
          <div className="flex items-center justify-end space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>

      <Dialog open={!!selectedQuotation} onOpenChange={() => setSelectedQuotation(null)}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Quotation Details: {selectedQuotation?.quotationNumber}</DialogTitle>
            <DialogDescription>
              For {selectedQuotation?.company?.name} - Dated: {selectedQuotation?.date}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 text-sm">
             <div className="space-y-2">
                <h4 className="font-semibold">Client Information</h4>
                <p><strong>Company:</strong> {selectedQuotation?.company?.name}</p>
                <p><strong>Address:</strong> {selectedQuotation?.company?.address}</p>
                <p><strong>Email:</strong> {selectedQuotation?.company?.email}</p>
                <p><strong>GSTIN:</strong> {selectedQuotation?.company?.gstin}</p>
             </div>
             <div className="space-y-2">
                <h4 className="font-semibold">Products</h4>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Sr.</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Model</TableHead>
                            <TableHead>HSN</TableHead>
                            <TableHead>Qty</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {selectedQuotation?.products.map(p => (
                            <TableRow key={p.id}>
                                <TableCell>{p.srNo}</TableCell>
                                <TableCell>{p.name}</TableCell>
                                <TableCell>{p.model}</TableCell>
                                <TableCell>{p.hsn}</TableCell>
                                <TableCell>{p.quantity} {p.quantityType}</TableCell>
                                <TableCell>{formatCurrency(p.price)}</TableCell>
                                <TableCell className="text-right">{formatCurrency(p.total)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
             </div>
             <div className="flex justify-end pt-4">
                <div className="text-lg font-bold">
                    Grand Total: {formatCurrency(selectedQuotation?.grandTotal || 0)}
                </div>
             </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
