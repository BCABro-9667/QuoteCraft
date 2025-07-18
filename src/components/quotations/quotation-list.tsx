
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import type { Quotation, UserProfile, QuotationStatus } from '@/types';
import { quotationStatuses } from '@/types';
import {
  PlusCircle,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  FileDown as DownloadIcon,
  Calendar as CalendarIcon,
  FilterX,
  Loader2,
  Copy,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatCurrency, formatNumberForPdf, cn, sanitizeFilename } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { format, isSameDay } from 'date-fns';
import { useQuotations, useDeleteQuotation, useDuplicateQuotation, useUpdateQuotationProgress } from '@/hooks/use-quotations';
import { getProfile } from '@/lib/actions/profile.actions';

const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
];

export function QuotationList() {
  const router = useRouter();
  const { toast } = useToast();

  const { data: quotations, isLoading, isError } = useQuotations();
  const deleteMutation = useDeleteQuotation();
  const duplicateMutation = useDuplicateQuotation();
  const updateProgressMutation = useUpdateQuotationProgress();

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    getProfile().then(setUserProfile);
  }, []);

  const uniqueLocations = useMemo(() => {
    const quotationList = quotations || [];
    const locations = new Set(quotationList.map(q => q.company?.location).filter(Boolean));
    return Array.from(locations as string[]);
  }, [quotations]);

  const uniqueCompanies = useMemo(() => {
    const quotationList = quotations || [];
    const companyMap = new Map<string, { id: string; name: string }>();
    quotationList.forEach(q => {
      if (q.company && !companyMap.has(q.company.id)) {
        companyMap.set(q.company.id, { id: q.company.id, name: q.company.name });
      }
    });
    return Array.from(companyMap.values());
  }, [quotations]);

  const filteredQuotations = useMemo(() => {
    const quotationList = quotations || [];
    return quotationList.filter(q => {
      const lowercasedTerm = searchTerm.toLowerCase();
      const searchMatch =
        q.quotationNumber.toLowerCase().includes(lowercasedTerm) ||
        (q.company?.name.toLowerCase().includes(lowercasedTerm) ?? false) ||
        (q.company?.email?.toLowerCase().includes(lowercasedTerm) ?? false) ||
        (q.company?.location?.toLowerCase().includes(lowercasedTerm) ?? false);
      
      const monthMatch = selectedMonth ? format(new Date(q.date), 'MMMM') === selectedMonth : true;
      const locationMatch = selectedLocation ? q.company?.location === selectedLocation : true;
      const companyMatch = selectedCompany ? q.company?.id === selectedCompany : true;
      const dateMatch = selectedDate ? isSameDay(new Date(q.date), selectedDate) : true;

      return searchMatch && monthMatch && locationMatch && companyMatch && dateMatch;
    });
  }, [quotations, searchTerm, selectedMonth, selectedLocation, selectedCompany, selectedDate]);
  
  const totalPages = Math.ceil(filteredQuotations.length / itemsPerPage);
  const totalQuotations = quotations?.length ?? 0;

  const paginatedQuotations = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredQuotations.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredQuotations, currentPage, itemsPerPage]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedMonth('');
    setSelectedLocation('');
    setSelectedCompany('');
    setSelectedDate(undefined);
    setCurrentPage(1);
  };

  const handleDuplicate = (quotationId: string) => {
    duplicateMutation.mutate(quotationId);
  };

  const handleDelete = (quotationId: string) => {
    deleteMutation.mutate(quotationId);
  };
  
  const handleProgressChange = (quotationId: string, newProgress: QuotationStatus) => {
    updateProgressMutation.mutate({ quotationId, progress: newProgress });
  };

  const exportToCSV = () => {
    const headers = 'Quotation Number,Date,Company Name,Contact Person,Contact No,Email,GSTIN,Products,Referenced By,Created By,Progress\n';
    const rows = filteredQuotations
      .map(q => {
        const companyName = q.company?.name.replace(/"/g, '""') || '';
        const contactPerson = q.company?.contactPerson?.replace(/"/g, '""') || '';
        const contactNo = q.company?.phone || '';
        const email = q.company?.email?.replace(/"/g, '""') || '';
        const gstin = q.company?.gstin || '';
        const products = q.products.map(p => `${p.name} (Qty: ${p.quantity} ${p.quantityType})`).join('; ') || '';
        const referencePerson = q.referencedBy.replace(/"/g, '""') || '';
        const createdBy = q.createdBy.replace(/"/g, '""') || '';

        return `"${q.quotationNumber}","${new Date(q.date).toLocaleDateString('en-GB')}","${companyName}","${contactPerson}","${contactNo}","${email}","${gstin}","${products}","${referencePerson}","${createdBy}","${q.progress}"`;
      })
      .join('\n');

    const csvContent = headers + rows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.href) {
      URL.revokeObjectURL(link.href);
    }
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', 'quotations.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPdf = async (quotation: Quotation) => {
    const sanitize = (value: any, fallback: string = 'N/A'): string => {
        if (value === null || value === undefined || value === '') {
            return fallback;
        }
        return String(value);
    };

    try {
        if (!quotation.company) {
            toast({
              variant: 'destructive',
              title: 'Error',
              description: 'Company data is missing for this quotation.',
            });
            return;
        }
        if (!userProfile) {
              toast({
                variant: 'destructive',
                title: 'Error',
                description: 'User profile data is not available.',
              });
              return;
        }

        const doc = new jsPDF();
        const pageHeight = doc.internal.pageSize.height;
        const pageWidth = doc.internal.pageSize.width;
        const orangeColor = '#F58220';

        // --- Header ---
        if (userProfile.logoUrl) {
            try {
                const dataUrl = await new Promise<string>((resolve, reject) => {
                    const img = new Image();
                    img.crossOrigin = "Anonymous";
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        canvas.width = img.width;
                        canvas.height = img.height;
                        const ctx = canvas.getContext('2d');
                        if (!ctx) {
                            return reject(new Error('Could not get 2D context from canvas.'));
                        }
                        ctx.drawImage(img, 0, 0);
                        resolve(canvas.toDataURL('image/png'));
                    };
                    img.onerror = (e) => {
                      console.error("PDF Logo Load Error:", e);
                      reject(new Error('Failed to load logo. Check URL and CORS.'));
                    };
                    img.src = userProfile.logoUrl;
                });
                doc.addImage(dataUrl, 'PNG', 14, 12, 50, 15);
            } catch (e: any) {
                console.error("Error adding logo image, proceeding without it:", e);
                toast({
                    variant: 'destructive',
                    title: 'Logo Warning',
                    description: `${e.message || 'Could not load logo.'} Continuing with text fallback.`,
                });
                doc.setFontSize(16);
                doc.setFont('helvetica', 'bold');
                doc.text(sanitize(userProfile.companyName, 'My Company'), 14, 20);
            }
        } else {
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text(sanitize(userProfile.companyName, 'My Company'), 14, 20);
        }

        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        const headerRightX = pageWidth - 14;
        
        const companyAddressText = `Address: ${sanitize(userProfile.address)}`;
        const companyAddressLines = doc.splitTextToSize(companyAddressText, 80);
        let rightHeaderY = 12;
        doc.text(companyAddressLines, headerRightX, rightHeaderY, { align: 'right' });
        rightHeaderY += companyAddressLines.length * 3.5;
        
        doc.setFont('helvetica', 'bold');
        const contactInfo = [
            userProfile.phone ? `Tel: ${sanitize(userProfile.phone)}` : '',
            userProfile.email ? `Email: ${sanitize(userProfile.email)}`: '',
            userProfile.website ? `URL: ${sanitize(userProfile.website)}`: '',
            userProfile.gstin ? `GSTIN: ${sanitize(userProfile.gstin)}`: '',
        ].filter(Boolean);
        
        contactInfo.forEach(line => {
          doc.text(line, headerRightX, rightHeaderY, { align: 'right' });
          rightHeaderY += 3.5;
        })

        doc.setDrawColor(245, 130, 32);
        doc.setLineWidth(1);
        doc.line(14, rightHeaderY, pageWidth - 14, rightHeaderY);
        let currentY = rightHeaderY;

        // --- Ref and Date ---
        currentY += 6;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Ref. No.', headerRightX - 25, currentY, { align: 'right' });
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0,0,0);
        doc.text(sanitize(quotation.quotationNumber), headerRightX, currentY, { align: 'right' });
        
        currentY += 5;
        doc.setFont('helvetica', 'bold');
        doc.text('Date', headerRightX - 25, currentY, { align: 'right' });
        doc.setFont('helvetica', 'normal');
        doc.text(quotation.date ? new Date(quotation.date).toLocaleDateString('en-GB') : 'N/A', headerRightX, currentY, { align: 'right' });
        doc.setTextColor(0);

        // --- Client Info ---
        let clientY = currentY + 5;
        const addClientInfo = (label: string, value: any) => {
            if (sanitize(value, '').trim()) {
                doc.setFont('helvetica', 'bold');
                doc.text(label, 14, clientY);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(orangeColor);
                doc.text(sanitize(value), 48, clientY);
                doc.setTextColor(0);
                clientY += 6;
            }
        }
        addClientInfo('Company Name:', quotation.company.name);
        addClientInfo('Contact Person:', quotation.company.contactPerson);
        addClientInfo('Contact No.:', quotation.company.phone);
        addClientInfo('Email id:', quotation.company.email);
        addClientInfo('GSTIN:', quotation.company.gstin);
        currentY = clientY;

        // --- Subject ---
        currentY += 5;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Subject: Quotation', 14, currentY);
        doc.setDrawColor(0);
        doc.setLineWidth(0.3);
        doc.line(14, currentY + 1, 44, currentY + 1);
        
        // --- Intro Text ---
        currentY += 8;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Dear Sir,', 14, currentY);
        currentY += 6;
        const introText = 'With reference to our recent discussion and after carefully reviewing your requirements, we are pleased to present our best proposal as outlined below:';
        const splitIntro = doc.splitTextToSize(introText, pageWidth - 28);
        doc.text(splitIntro, 14, currentY);
        currentY += (splitIntro.length * 5) + 3;

        // --- Products Table ---
        const tableBody = (quotation.products || []).map(p => ([
            sanitize(p?.srNo, ''),
            `${sanitize(p?.name, 'Unnamed Product')}\n(Model No: ${sanitize(p?.model, 'N/A')})`,
            sanitize(p?.hsn),
            `${sanitize(p?.quantity, '0')} ${sanitize(p?.quantityType, '')}`.trim(),
            formatNumberForPdf(p?.price ?? 0),
            formatNumberForPdf(p?.total ?? 0),
        ]));

        autoTable(doc, {
            startY: currentY,
            head: [['Sr. No.', 'Description', 'HSN', 'Qty.', 'Unit Price', 'Amount']],
            body: tableBody,
            theme: 'grid',
            headStyles: {
                fillColor: [245, 130, 32],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
            },
            bodyStyles: {
                textColor: [0, 0, 0],
                cellPadding: 2.5,
                valign: 'middle'
            },
            styles: {
                fontSize: 9,
                valign: 'middle',
            },
            columnStyles: {
                0: { halign: 'center', cellWidth: 15 },
                1: { halign: 'left', cellWidth: 60 },
                2: { halign: 'center' },
                3: { halign: 'center' },
                4: { halign: 'right' },
                5: { halign: 'right' },
            },
            didDrawPage: (data) => {
                // Add footer on each page
                doc.setFontSize(8);
                doc.setFont('helvetica', 'normal');
                const pageNumText = `Page ${doc.internal.pages.length - 1}`;
                doc.text(pageNumText, pageWidth / 2, pageHeight - 10, { align: 'center'});
            }
        });

        let finalY = (doc as any).lastAutoTable.finalY;

        // --- Grand Total ---
        const grandTotalY = finalY + 8;
        if (grandTotalY > pageHeight - 30) {
            doc.addPage();
            finalY = 20;
        } else {
            finalY = grandTotalY;
        }
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Grand Total', pageWidth - 14 - 40, finalY, { align: 'right' });
        doc.setFont('helvetica', 'normal');
        doc.text(formatNumberForPdf(quotation.grandTotal ?? 0), pageWidth - 14, finalY, { align: 'right' });
        finalY += 5;


        // --- Terms & Conditions ---
        if (quotation.termsAndConditions && typeof quotation.termsAndConditions === 'string') {
            if (finalY > pageHeight - 80) { // Check if space is available for T&C
                doc.addPage();
                finalY = 20;
            }
            finalY += 10;
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text('Terms & Conditions', 14, finalY);
            doc.setDrawColor(0);
            doc.setLineWidth(0.3);
            doc.line(14, finalY + 1, 50, finalY + 1);

            finalY += 6;
            doc.setFontSize(9);
            
            const terms = sanitize(quotation.termsAndConditions).split('\n').map(line => {
                const parts = line.split(':');
                const key = (parts.shift() || '').trim();
                const value = parts.join(':').trim();
                return { key, value };
            });
            
            terms.forEach(term => {
                if (finalY > pageHeight - 40) {
                    doc.addPage();
                    finalY = 20;
                }
                if (term.key) {
                    doc.setFont('helvetica', 'normal');
                    doc.text(`• ${sanitize(term.key)}`, 18, finalY);
                    doc.text(':', 50, finalY);
                    doc.text(sanitize(term.value), 55, finalY);
                    finalY += 5;
                }
            });
        }
        
        // --- Closing ---
        if (finalY > pageHeight - 60) {
            doc.addPage();
            finalY = 20;
        }
        finalY += 10;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Thank You.', 14, finalY);
        finalY += 5;
        doc.text('Regards', 14, finalY);
        
        finalY += 15;
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(245, 130, 32);
        doc.text(`For ${sanitize(userProfile.companyName, 'My Company').toUpperCase()}`, 14, finalY);
        doc.setTextColor(0);

        finalY += 10;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        const addClosingInfo = (label: string, value: any) => {
             if (sanitize(value, '').trim()) {
                const closingText = `${label}: ${sanitize(value)}`;
                doc.text(closingText, 14, finalY);
                finalY += 5;
             }
        }
        addClosingInfo('Reference Person', quotation.referencedBy);
        addClosingInfo('Created By', quotation.createdBy);
        
        finalY += 10;
        doc.setFont('helvetica', 'normal');
        doc.text('Authorized signature', 14, finalY);
        
        const filename = `${sanitizeFilename(quotation.quotationNumber)} (${sanitizeFilename(quotation.company.name)}).pdf`;
        doc.save(filename);
    } catch (error: any) {
        console.error("Failed to generate PDF:", error);
        toast({
            variant: 'destructive',
            title: 'PDF Generation Failed',
            description: error.message || 'An unexpected error occurred while creating the PDF.',
        });
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-1/3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                    placeholder="Search by number, company, email..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                    }}
                    />
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={exportToCSV}
                        variant="outline"
                        disabled={!quotations || quotations.length === 0}
                    >
                        <DownloadIcon className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                    <Button asChild>
                        <Link href="/quotations/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Quotation
                        </Link>
                    </Button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
                 <Select value={selectedMonth} onValueChange={(value) => { setSelectedMonth(value === 'all' ? '' : value); setCurrentPage(1); }}>
                    <SelectTrigger><SelectValue placeholder="Filter by Month" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Months</SelectItem>
                        {months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                </Select>

                <Select value={selectedLocation} onValueChange={(value) => { setSelectedLocation(value === 'all' ? '' : value); setCurrentPage(1); }}>
                    <SelectTrigger><SelectValue placeholder="Filter by Location" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Locations</SelectItem>
                        {uniqueLocations.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                    </SelectContent>
                </Select>

                <Select value={selectedCompany} onValueChange={(value) => { setSelectedCompany(value === 'all' ? '' : value); setCurrentPage(1); }}>
                    <SelectTrigger><SelectValue placeholder="Filter by Company" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Companies</SelectItem>
                        {uniqueCompanies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                </Select>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? format(selectedDate, "PPP") : <span>Filter by Date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={selectedDate} onSelect={(date) => { setSelectedDate(date); setCurrentPage(1); }} initialFocus />
                    </PopoverContent>
                </Popover>

                <Button variant="ghost" onClick={clearFilters} className="flex items-center gap-2">
                    <FilterX className="h-4 w-4" />
                    <span>Clear Filters</span>
                </Button>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quotation No</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Company Name</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead className="hidden lg:table-cell">Location</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
            {isLoading ? (
                <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                        <div className="flex justify-center items-center">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <span className="ml-2">Loading quotations...</span>
                        </div>
                    </TableCell>
                </TableRow>
            ) : isError ? (
                <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-destructive">
                        Failed to load quotations.
                    </TableCell>
                </TableRow>
            ) : paginatedQuotations.length > 0 ? (
                paginatedQuotations.map((quotation) => (
                  <TableRow key={quotation.id}>
                    <TableCell className="font-medium">{quotation.quotationNumber}</TableCell>
                    <TableCell>{format(new Date(quotation.date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>{quotation.company?.name || 'N/A'}</TableCell>
                    <TableCell className="hidden md:table-cell">{quotation.company?.email || 'N/A'}</TableCell>
                    <TableCell className="hidden lg:table-cell">{quotation.company?.location || 'N/A'}</TableCell>
                    <TableCell>
                      <Select
                        value={quotation.progress}
                        onValueChange={(value) => handleProgressChange(quotation.id, value as QuotationStatus)}
                      >
                        <SelectTrigger className={cn(
                            "w-full rounded-full border-0 px-2.5 py-0.5 text-xs font-semibold capitalize transition-colors focus:ring-2 focus:ring-ring focus:ring-offset-2 justify-center",
                            {
                                'bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80 dark:bg-yellow-900/70 dark:text-yellow-200': quotation.progress === 'Pending',
                                'bg-green-100 text-green-800 hover:bg-green-100/80 dark:bg-green-900/70 dark:text-green-200': quotation.progress === 'Complete',
                                'bg-red-100 text-red-800 hover:bg-red-100/80 dark:bg-red-900/70 dark:text-red-200': quotation.progress === 'Rejected',
                            }
                        )}>
                          <SelectValue placeholder="Set status" />
                        </SelectTrigger>
                        <SelectContent>
                          {quotationStatuses.map(status => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
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
                            <DropdownMenuItem onClick={() => handleDownloadPdf(quotation)} disabled={!userProfile}>
                              <DownloadIcon className="mr-2 h-4 w-4" /> Download PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/quotations/new?id=${quotation.id}`)}>
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicate(quotation.id)}>
                                {duplicateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Copy className="mr-2 h-4 w-4" />}
                                Duplicate
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
                                    This action cannot be undone. This will permanently delete the quotation "{quotation.quotationNumber}".
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(quotation.id)} className="bg-destructive hover:bg-destructive/90">
                                    {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
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
                  <TableCell colSpan={7} className="text-center h-24">
                    No quotations found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {totalPages > 1 && (
          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
                {filteredQuotations.length} of {totalQuotations} row(s) found.
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

      <Dialog  open={!!selectedQuotation} onOpenChange={() => setSelectedQuotation(null)}>
      <DialogContent className="sm:max-w-3xl my-5 max-h-[80vh] overflow-y-auto">

          <DialogHeader>
            <DialogTitle>Quotation Details: {selectedQuotation?.quotationNumber}</DialogTitle>
            <DialogDescription>
              For {selectedQuotation?.company?.name} - Dated: {selectedQuotation?.date ? new Date(selectedQuotation.date).toLocaleDateString('en-GB') : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4 text-sm">
             <div className="space-y-2">
                <h4 className="font-semibold">Client Information</h4>
                <p><strong>Company:</strong> {selectedQuotation?.company?.name}</p>
                <p><strong>Address:</strong> {selectedQuotation?.company?.address}</p>
                <p><strong>Email:</strong> {selectedQuotation?.company?.email}</p>
                <p><strong>GSTIN:</strong> {selectedQuotation?.company?.gstin}</p>
             </div>
             <div className="space-y-2">
                <h4 className="font-semibold">Additional Details</h4>
                <p><strong>Referenced By:</strong> {selectedQuotation?.referencedBy}</p>
                <p><strong>Created By:</strong> {selectedQuotation?.createdBy}</p>
                <p><strong>Progress:</strong> {selectedQuotation?.progress}</p>
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
             <div className="flex justify-end pt-4 font-bold text-lg">
                <div className="flex justify-between w-1/3">
                    <span>Grand Total:</span>
                    <span>{formatCurrency(selectedQuotation?.grandTotal || 0)}</span>
                </div>
             </div>
             {selectedQuotation?.termsAndConditions && (
                <div className="space-y-2 pt-4 border-t">
                    <h4 className="font-semibold">Terms & Conditions</h4>
                    <p className="text-xs whitespace-pre-wrap">{selectedQuotation?.termsAndConditions}</p>
                </div>
             )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
