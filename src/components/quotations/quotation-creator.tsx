
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useForm, useFieldArray, FieldArrayWithId } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useAuth } from '@/hooks/use-auth';
import type { Company, Product, Quotation, UserProfile, QuotationStatus } from '@/types';
import { quantityTypes, quotationStatuses } from '@/types';
import { formatCurrency, generateQuotationNumber, cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Trash2, PlusCircle, CalendarIcon, Loader2, Edit, GripVertical } from 'lucide-react';
import { format } from 'date-fns';
import { ProductDialog } from './product-dialog';
import { getCompanies } from '@/lib/actions/company.actions';
import { createQuotation, getQuotation, updateQuotation, getQuotationCountForNumber } from '@/lib/actions/quotation.actions';
import { getProfile } from '@/lib/actions/profile.actions';
import { getHsnCodes } from '@/lib/actions/hsn.actions';
import { Skeleton } from '../ui/skeleton';

const productSchema = z.object({
    id: z.string().optional(),
    _id: z.string().optional(),
    srNo: z.number(),
    name: z.string(),
    model: z.string().optional(),
    hsn: z.string(),
    quantity: z.number(),
    quantityType: z.enum(quantityTypes),
    price: z.number(),
    total: z.number()
});

const quotationSchema = z.object({
  quotationNumber: z.string().min(1, "Quotation number is required"),
  date: z.string({ required_error: "A quotation date is required." }),
  companyId: z.string().min(1, 'Please select a company'),
  products: z.array(productSchema).min(1, "Please add at least one product"),
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

interface SortableProductRowProps {
    product: FieldArrayWithId<QuotationFormValues, 'products', 'id'>;
    onEdit: () => void;
    onRemove: () => void;
    isSubmitting: boolean;
  }
  
  function SortableProductRow({ product, onEdit, onRemove, isSubmitting }: SortableProductRowProps) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: product.id });
  
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
      zIndex: isDragging ? 1 : 0,
    };
  
    return (
      <TableRow ref={setNodeRef} style={style} data-dragging={isDragging} key={product.id}>
        <TableCell className="w-12">
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="cursor-grab active:cursor-grabbing"
                {...attributes}
                {...listeners}
            >
                <GripVertical className="h-4 w-4" />
            </Button>
        </TableCell>
        <TableCell>{product.srNo}</TableCell>
        <TableCell>{product.name}</TableCell>
        <TableCell>{product.model}</TableCell>
        <TableCell>{product.hsn}</TableCell>
        <TableCell>{product.quantity} {product.quantityType}</TableCell>
        <TableCell>{formatCurrency(product.price)}</TableCell>
        <TableCell>{formatCurrency(product.total)}</TableCell>
        <TableCell className="flex gap-2">
            <Button type="button" variant="ghost" size="icon" onClick={onEdit} disabled={isSubmitting}>
                <Edit className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={onRemove} disabled={isSubmitting}>
                <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
        </TableCell>
      </TableRow>
    );
  }

export function QuotationCreator({ quotationId }: { quotationId?: string }) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [hsnCodes, setHsnCodes] = useState<string[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isProductDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProductIndex, setEditingProductIndex] = useState<number | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const isEditMode = !!quotationId;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<QuotationFormValues>({
    resolver: zodResolver(quotationSchema),
    defaultValues: {
      quotationNumber: '',
      date: new Date().toLocaleDateString('en-CA'),
      companyId: '',
      products: [],
      termsAndConditions: predefinedTerms,
      referencedBy: 'Kamal Puri',
      createdBy: '',
      progress: 'Pending',
    },
  });

  const { fields, append, remove, update, replace } = useFieldArray({
    control: form.control,
    name: "products",
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
        const oldIndex = fields.findIndex((field) => field.id === active.id);
        const newIndex = fields.findIndex((field) => field.id === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
            const reorderedProducts = arrayMove(fields, oldIndex, newIndex);
            const renumberedProducts = reorderedProducts.map((p, index) => ({
                ...p,
                srNo: index + 1
            }));
            replace(renumberedProducts);
        }
    }
  };

  const handleCompanyChange = useCallback((companyId: string) => {
    form.setValue('companyId', companyId, { shouldValidate: true });
    const company = companies.find((c) => c.id === companyId);
    setSelectedCompany(company || null);
  }, [companies, form]);

  useEffect(() => {
    if (!authLoading && user) {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [fetchedCompanies, fetchedProfile, fetchedHsnCodes] = await Promise.all([
                    getCompanies(),
                    getProfile(),
                    getHsnCodes(),
                ]);
                
                setCompanies(fetchedCompanies);
                setHsnCodes(fetchedHsnCodes);

                const createdByName = user ? `${user.firstName} ${user.lastName}`.trim() : 'Sales Team';

                if (isEditMode && quotationId) {
                    const quotationToEdit = await getQuotation(quotationId);
                    if (quotationToEdit) {
                        form.reset({
                          ...quotationToEdit,
                          date: new Date(quotationToEdit.date).toLocaleDateString('en-CA'),
                          createdBy: quotationToEdit.createdBy || createdByName,
                        });
                        const company = fetchedCompanies.find(c => c.id === quotationToEdit.companyId);
                        setSelectedCompany(company || null);
                    } else {
                        toast({ variant: 'destructive', title: 'Error', description: 'Quotation not found.' });
                        router.push('/quotations');
                    }
                } else if (fetchedProfile) {
                    const quotationCount = await getQuotationCountForNumber();
                    form.reset({
                        quotationNumber: generateQuotationNumber(fetchedProfile.quotationPrefix, quotationCount),
                        date: new Date().toLocaleDateString('en-CA'),
                        companyId: '',
                        products: [],
                        termsAndConditions: predefinedTerms,
                        referencedBy: 'Kamal Puri',
                        createdBy: createdByName,
                        progress: 'Pending',
                    });
                    setSelectedCompany(null);
                }
            } catch (error: any) {
                console.error("Failed to load quotation data:", error);
                toast({ variant: 'destructive', title: 'Error Loading Data', description: error.message });
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    } else if (!authLoading && !user) {
      setIsLoading(false);
    }
  }, [quotationId, user, authLoading, isEditMode, form, router, toast]);

  const handleSaveProduct = useCallback((productData: Omit<Product, 'id' | 'srNo' | 'total'>) => {
    const productWithTotal = {
      ...productData,
      total: productData.quantity * productData.price,
    };

    if (editingProductIndex !== null) {
        const existingProduct = fields[editingProductIndex];
        update(editingProductIndex, {
            ...existingProduct,
            ...productWithTotal
        });
    } else {
        append({
            id: new Date().getTime().toString(),
            srNo: fields.length + 1,
            ...productWithTotal,
        });
    }
    setProductDialogOpen(false);
    setEditingProductIndex(null);
  }, [append, fields, editingProductIndex, update]);
  
  const handleEditProductClick = (index: number) => {
    setEditingProductIndex(index);
    setProductDialogOpen(true);
  };

  const handleAddProductClick = () => {
    setEditingProductIndex(null);
    setProductDialogOpen(true);
  };

  const productToEdit = editingProductIndex !== null ? fields[editingProductIndex] : undefined;
  
  const grandTotal = fields.reduce((acc, product) => acc + product.total, 0);

  const onSubmit = async (data: QuotationFormValues) => {
    if (!user) {
        toast({ variant: 'destructive', title: "Authentication Error", description: "You must be logged in." });
        return;
    }

    setIsSubmitting(true);
    const quotationData = { ...data, grandTotal };

    try {
        if (isEditMode && quotationId) {
            await updateQuotation(quotationId, quotationData);
            toast({ title: "Success!", description: "Quotation updated successfully." });
        } else {
            await createQuotation(quotationData);
            toast({ title: "Success!", description: "Quotation created successfully." });
        }
        router.push('/quotations');
        router.refresh();
    } catch (error: any) {
        toast({ variant: 'destructive', title: "Error Saving Quotation", description: error.message });
    } finally {
        setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Skeleton className="lg:col-span-1 h-48" />
                <Skeleton className="lg:col-span-2 h-48" />
            </div>
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-40 w-full" />
        </div>
    )
  }

  return (
    <>
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
                  <FormField
                      control={form.control}
                      name="quotationNumber"
                      render={({ field }) => (
                          <FormItem>
                              <FormLabel>Quotation Number</FormLabel>
                              <FormControl>
                                  <Input {...field} />
                              </FormControl>
                              <FormMessage />
                          </FormItem>
                      )}
                  />
                  <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                          <FormItem className="flex flex-col pt-2">
                              <FormLabel>Quotation Date</FormLabel>
                              <Popover>
                                  <PopoverTrigger asChild>
                                  <FormControl>
                                      <Button
                                      variant={"outline"}
                                      className={cn(
                                          "w-full pl-3 text-left font-normal",
                                          !field.value && "text-muted-foreground"
                                      )}
                                      >
                                      {field.value ? (
                                          format(new Date(field.value), "PPP")
                                      ) : (
                                          <span>Pick a date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                      </Button>
                                  </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                      mode="single"
                                      selected={field.value ? new Date(field.value) : undefined}
                                      onSelect={(date) => field.onChange(date?.toLocaleDateString('en-CA'))}
                                      initialFocus
                                  />
                                  </PopoverContent>
                              </Popover>
                              <FormMessage />
                          </FormItem>
                      )}
                  />
              </CardContent>
              </Card>
          </div>

          <Card>
              <CardHeader>
              <div className="flex justify-between items-center">
                  <div>
                      <CardTitle>Products</CardTitle>
                      <CardDescription>Add products to the quotation.</CardDescription>
                  </div>
                  <Button type="button" onClick={handleAddProductClick} disabled={isSubmitting}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Product
                  </Button>
              </div>
              {form.formState.errors.products && <p className="text-sm font-medium text-destructive mt-2">{form.formState.errors.products.message}</p>}
              </CardHeader>
              <CardContent>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <div className="overflow-x-auto">
                      <Table>
                      <TableHeader>
                          <TableRow>
                          <TableHead className="w-12"></TableHead>
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
                      <SortableContext items={fields} strategy={verticalListSortingStrategy}>
                          <TableBody>
                              {fields.map((field, index) => (
                                  <SortableProductRow
                                      key={field.id}
                                      product={field}
                                      onEdit={() => handleEditProductClick(index)}
                                      onRemove={() => remove(index)}
                                      isSubmitting={isSubmitting}
                                  />
                              ))}
                              {fields.length === 0 && (
                                  <TableRow>
                                      <TableCell colSpan={9} className="text-center h-24">
                                          No products added yet.
                                      </TableCell>
                                  </TableRow>
                              )}
                          </TableBody>
                      </SortableContext>
                      </Table>
                  </div>
              </DndContext>
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

          <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEditMode ? 'Update Quotation' : 'Create Quotation'}
              </Button>
          </div>
          </form>
      </Form>

      <ProductDialog 
          isOpen={isProductDialogOpen} 
          onClose={() => {
              setProductDialogOpen(false);
              setEditingProductIndex(null);
          }} 
          onSaveProduct={handleSaveProduct}
          productToEdit={productToEdit}
          hsnCodes={hsnCodes}
      />
    </>
  );
}
