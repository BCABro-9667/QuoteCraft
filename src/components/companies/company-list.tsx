'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
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
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { Company } from '@/types';
import {
  MoreHorizontal,
  PlusCircle,
  Search,
  Eye,
  Edit,
  Trash2,
  FileDown,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getCompanies, deleteCompany } from '@/lib/actions/company.actions';
import { useToast } from '@/hooks/use-toast';

export function CompanyList() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const fetchCompanies = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedCompanies = await getCompanies();
      setCompanies(fetchedCompanies);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch companies.' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (user && !authLoading) {
      fetchCompanies();
    } else if (!user && !authLoading) {
      // Auth is resolved, but no user. ProtectedRoute will redirect.
      setIsLoading(false);
    }
  }, [user, authLoading, fetchCompanies]);

  const filteredCompanies = useMemo(() => {
    return companies.filter(
      (company) =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (company.email && company.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (company.location && company.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (company.gstin && company.gstin.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [companies, searchTerm]);

  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);

  const paginatedCompanies = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCompanies.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCompanies, currentPage, itemsPerPage]);

  const handleDelete = async (companyId: string) => {
    try {
        await deleteCompany(companyId);
        toast({ title: 'Success', description: 'Company deleted successfully.' });
        fetchCompanies(); // Refetch after delete
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete company.' });
    }
  };

  const exportToCSV = () => {
    const headers = 'Company Name,Email,Location,GSTIN\n';
    const rows = filteredCompanies
      .map(
        (c) => `"${c.name}","${c.email || ''}","${c.location || ''}","${c.gstin || ''}"`
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
              {isLoading ? (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                        <div className="flex justify-center items-center">
                            <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                    </TableCell>
                </TableRow>
              ) : paginatedCompanies.length > 0 ? (
                paginatedCompanies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell className="font-medium">{company.name}</TableCell>
                    <TableCell className="hidden md:table-cell">{company.email}</TableCell>
                    <TableCell className="hidden md:table-cell">{company.location}</TableCell>
                    <TableCell className="hidden lg:table-cell">{company.gstin}</TableCell>
                    <TableCell>
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
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the company "{company.name}".
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(company.id)} className="bg-destructive hover:bg-destructive/90">
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    No companies found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {totalPages > 0 && (
          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              {filteredCompanies.length} of {companies.length} row(s) found.
            </div>
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Rows per page</p>
              <Select
                value={`${itemsPerPage}`}
                onValueChange={(value) => {
                  setItemsPerPage(Number(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={`${itemsPerPage}`} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      <Dialog open={!!selectedCompany} onOpenChange={() => setSelectedCompany(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-primary">{selectedCompany?.name}</DialogTitle>
            <DialogDescription>
              {selectedCompany?.location}
            </DialogDescription>
          </DialogHeader>
          <hr />
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
