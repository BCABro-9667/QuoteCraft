'use client';

import React, { useState, useMemo } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockCompanies } from '@/data/mock';
import type { Company } from '@/types';
import {
  MoreHorizontal,
  PlusCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  FileDown,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useLocalStorage from '@/hooks/use-local-storage';

const ITEMS_PER_PAGE = 5;

export function CompanyList() {
  const [companies, setCompanies] = useLocalStorage<Company[]>(
    'companies',
    mockCompanies
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const router = useRouter();

  const filteredCompanies = useMemo(() => {
    return companies.filter(
      (company) =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.gstin.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [companies, searchTerm]);

  const paginatedCompanies = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCompanies.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredCompanies, currentPage]);

  const totalPages = Math.ceil(filteredCompanies.length / ITEMS_PER_PAGE);

  const handleDelete = (companyId: string) => {
    setCompanies(companies.filter((c) => c.id !== companyId));
  };

  const exportToCSV = () => {
    const headers = 'Company Name,Email,Location,GSTIN\n';
    const rows = filteredCompanies
      .map(
        (c) => `"${c.name}","${c.email}","${c.location}","${c.gstin}"`
      )
      .join('\n');
    const csvContent = headers + rows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.href) {
      URL.revokeObjectURL(link.href);
    }
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', 'companies.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search companies..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportToCSV}>
              <FileDown className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button asChild>
              <Link href="/companies/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Company
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company Name</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead className="hidden md:table-cell">Location</TableHead>
                <TableHead className="hidden lg:table-cell">GSTIN</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCompanies.length > 0 ? (
                paginatedCompanies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell className="font-medium">{company.name}</TableCell>
                    <TableCell className="hidden md:table-cell">{company.email}</TableCell>
                    <TableCell className="hidden md:table-cell">{company.location}</TableCell>
                    <TableCell className="hidden lg:table-cell">{company.gstin}</TableCell>
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
                            <DropdownMenuItem onClick={() => setSelectedCompany(company)}>
                              <Eye className="mr-2 h-4 w-4" /> View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/companies/new?id=${company.id}`)}>
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                                <span className="text-destructive">Delete</span>
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the company "{company.name}".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(company.id)}>
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
                  <TableCell colSpan={5} className="text-center">
                    No companies found.
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

      <Dialog open={!!selectedCompany} onOpenChange={() => setSelectedCompany(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedCompany?.name}</DialogTitle>
            <DialogDescription>
              {selectedCompany?.location}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 text-sm">
            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
              <strong>Address:</strong>
              <span>{selectedCompany?.address}</span>
            </div>
            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
              <strong>Email:</strong>
              <span>{selectedCompany?.email}</span>
            </div>
            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
              <strong>Phone:</strong>
              <span>{selectedCompany?.phone}</span>
            </div>
            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
              <strong>Contact Person:</strong>
              <span>{selectedCompany?.contactPerson}</span>
            </div>
            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
              <strong>GSTIN:</strong>
              <span>{selectedCompany?.gstin}</span>
            </div>
            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
              <strong>Remarks:</strong>
              <span>{selectedCompany?.remarks}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
