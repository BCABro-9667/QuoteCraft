'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { mockCompanies, mockQuotations, mockUserProfile } from '@/data/mock';
import useLocalStorage from '@/hooks/use-local-storage';
import type { Company, Product, Quotation, UserProfile, QuotationStatus } from '@/types';
import { quantityTypes, quotationStatuses } from '@/types';
import { formatCurrency, generateQuotationNumber } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { Trash2, PlusCircle } from 'lucide-react';
import { ProductDialog } from './product-dialog';

const quotationSchema = z.object({
  companyId: z.string().min(1, 'Please select a company'),
  products: z.array(z.object({
      id: z.string(),
      srNo: z.number(),
      name: z.string(),
      model: z.string(),
      hsn: z.string(),
      quantity: z.number(),
      quantityType: z.enum(quantityTypes),
      price: z.number(),
      total: z.number()
  })).min(1, "Please add at least one product"),
  termsAndConditions: z.string().optional(),
  referencedBy: z.string().min(1, "Referenced by is required"),
  createdBy: z.string().min(1, "Created by is required"),
  progress: z.enum(quotationStatuses),
});

type QuotationFormValues = z.infer<typeof quotationSchema>;

const predefinedTerms = `Payment: 100% Advance
Tax: 18% GST
Freight: Extra at actual
Packing: Extra at actual
Installation: Extra at actual
Delivery: 2-3 Days confirmation of order with advance.
Validity: 30 Days.
Jurisdiction: All disputes will be referred to Faridabad, Jurisdiction on only`;

export function QuotationCreator() {
  const [companies] = useLocalStorage<Company[]>('companies', mockCompanies);
  const [quotations, setQuotations] = useLocalStorage<Quotation[]>('quotations', mockQuotations);
  const [userProfile] = useLocalStorage<UserProfile>('user-profile', mockUserProfile);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [quotationNumber, setQuotationNumber] = useState('');
  const [isProductDialogOpen, setProductDialogOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const quotationId = searchParams.get('id');
  const isEditMode = !!quotationId;

  const form = useForm<QuotationFormValues>({
    resolver: zodResolver(quotationSchema),
    defaultValues: {
      companyId: '',
      products: [],
      termsAndConditions: predefinedTerms,
      referencedBy: '',
      createdBy: '',
      progress: 'Pending',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "products",
  });

  const handleCompanyChange = useCallback((companyId: string) => {
    form.setValue('companyId', companyId, { shouldValidate: true });
    const company = companies.find((c) => c.id === companyId);
    setSelectedCompany(company || null);
  }, [companies, form]);

  useEffect(() => {
    if (isEditMode && quotationId && quotations.length > 0) {
      const quotationToEdit = quotations.find(q => q.id === quotationId);
      if (quotationToEdit) {
        form.reset(quotationToEdit);
        handleCompanyChange(quotationToEdit.companyId);
        setQuotationNumber(quotationToEdit.quotationNumber);
      }
    } else {
      form.reset({
        companyId: '',
        products: [],
        termsAndConditions: predefinedTerms,
        referencedBy: '',
        createdBy: '',
        progress: 'Pending',
      });
      setSelectedCompany(null);
      setQuotationNumber(generateQuotationNumber(userProfile.quotationPrefix, quotations.length));
    }
  }, [quotationId, quotations, companies, form, isEditMode, handleCompanyChange, userProfile]);

  const addProduct = useCallback((product: Omit<Product, 'id' | 'srNo' | 'total'>) => {
    const newProduct: Product = {
      ...product,
      id: new Date().getTime().toString(),
      srNo: fields.length + 1,
      total: product.quantity * product.price,
    };
    append(newProduct);
    setProductDialogOpen(false);
  }, [append, fields.length]);

  const grandTotal = fields.reduce((acc, product) => acc + product.total, 0);

  const onSubmit = (data: QuotationFormValues) => {
    if (isEditMode && quotationId) {
        const originalQuotation = quotations.find(q => q.id === quotationId);
        const updatedQuotation: Quotation = {
            id: quotationId,
            quotationNumber,
            date: originalQuotation?.date || new Date().toLocaleDateString('en-CA'),
            companyId: data.companyId,
            products: data.products,
            grandTotal,
            termsAndConditions: data.termsAndConditions || '',
            referencedBy: data.referencedBy,
            createdBy: data.createdBy,
            progress: data.progress,
        };
        setQuotations(quotations.map(q => (q.id === quotationId ? updatedQuotation : q)));
        toast({ title: "Success!", description: "Quotation updated successfully." });
    } else {
        const newQuotation: Quotation = {
            id: new Date().getTime().toString(),
            quotationNumber,
            date: new Date().toLocaleDateString('en-CA'),
            companyId: data.companyId,
            products: data.products,
            grandTotal,
            termsAndConditions: data.termsAndConditions || '',
            referencedBy: data.referencedBy,
            createdBy: data.createdBy,
            progress: data.progress,
        };
        setQuotations([...quotations, newQuotation]);
        toast({ title: "Success!", description: "Quotation created successfully." });
    }
    router.push('/quotations');
  };
  
  const quotationDate = isEditMode
    ? quotations.find(q => q.id === quotationId)?.date || new Date().toLocaleDateString('en-CA')
    : new Date().toLocaleDateString('en-CA');

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
            <CardHeader>
                <CardTitle>Client Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <FormField
                    control={form.control}
                    name="companyId"
                    render={({ field }) => (
                        <FormItem>
                            <Select onValueChange={handleCompanyChange} value={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a company" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {companies.map((company) => (
                                    <SelectItem key={company.id} value={company.id}>
                                    {company.name}
                                    </SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {selectedCompany && (
                <div className="text-sm text-muted-foreground space-y-2 border p-3 rounded-md">
                    <p><strong>Address:</strong> {selectedCompany.address}</p>
                    <p><strong>Email:</strong> {selectedCompany.email}</p>
                    <p><strong>Phone:</strong> {selectedCompany.phone}</p>
                    <p><strong>GSTIN:</strong> {selectedCompany.gstin}</p>
                </div>
                )}
            </CardContent>
            </Card>
            <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Quotation Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
                <div>
                <label className="text-sm font-medium">Quotation Number</label>
                <Input value={quotationNumber} readOnly disabled />
                </div>
                <div>
                <label className="text-sm font-medium">Quotation Date</label>
                <Input value={quotationDate} readOnly disabled />
                </div>
            </CardContent>
            </Card>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Additional Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                    control={form.control}
                    name="referencedBy"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Referenced By</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. Mr. Fiyaz Ahmed" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="createdBy"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Created By</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. Sales Team" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="progress"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Progress</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {quotationStatuses.map((status) => (
                                        <SelectItem key={status} value={status}>
                                            {status}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle>Products</CardTitle>
                    <CardDescription>Add products to the quotation.</CardDescription>
                </div>
                <Button type="button" onClick={() => setProductDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Product
                </Button>
            </div>
            {form.formState.errors.products && <p className="text-sm font-medium text-destructive mt-2">{form.formState.errors.products.message}</p>}
            </CardHeader>
            <CardContent>
            <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Sr.</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>HSN</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {fields.map((field, index) => (
                    <TableRow key={field.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{field.name}</TableCell>
                        <TableCell>{field.model}</TableCell>
                        <TableCell>{field.hsn}</TableCell>
                        <TableCell>{field.quantity} {field.quantityType}</TableCell>
                        <TableCell>{formatCurrency(field.price)}</TableCell>
                        <TableCell>{formatCurrency(field.total)}</TableCell>
                        <TableCell>
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                        </TableCell>
                    </TableRow>
                    ))}
                    {fields.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={8} className="text-center h-24">
                                No products added yet.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
                </Table>
            </div>
            </CardContent>
            {fields.length > 0 && (
                <CardFooter className="flex flex-col items-end gap-2">
                    <Separator />
                    <div className="w-full md:w-1/3 mt-4">
                        <div className="flex justify-between font-bold text-lg">
                            <span>Grand Total</span>
                            <span>{formatCurrency(grandTotal)}</span>
                        </div>
                    </div>
                </CardFooter>
            )}
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Terms &amp; Conditions</CardTitle>
            </CardHeader>
            <CardContent>
                <FormField
                    control={form.control}
                    name="termsAndConditions"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Textarea {...field} rows={6} placeholder="Enter terms and conditions..." />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit">{isEditMode ? 'Update Quotation' : 'Create Quotation'}</Button>
        </div>

        <ProductDialog 
            isOpen={isProductDialogOpen} 
            onClose={() => setProductDialogOpen(false)} 
            onAddProduct={addProduct}
        />
        </form>
    </Form>
  );
}
