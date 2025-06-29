'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import type { Product, QuantityType } from '@/types';
import { quantityTypes } from '@/types';
import { analyzeProductImage } from '@/lib/actions';
import { Loader2, Upload } from 'lucide-react';

const hsnCodes = ['84678587', '84678586', '84678589', '84678581'] as const;

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  model: z.string().min(1, "Model number is required"),
  hsn: z.enum(hsnCodes, { required_error: "HSN code is required" }),
  quantity: z.coerce.number().min(0.1, "Quantity must be positive"),
  quantityType: z.enum(quantityTypes),
  price: z.coerce.number().min(0, "Price cannot be negative"),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (product: Omit<Product, 'id' | 'srNo' | 'total'>) => void;
}

export function ProductDialog({ isOpen, onClose, onAddProduct }: ProductDialogProps) {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '', model: '', hsn: undefined, quantity: 1, quantityType: 'Nos', price: 0,
    },
  });

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) { // 4MB limit
        toast({ variant: 'destructive', title: 'Error', description: 'Image size cannot exceed 4MB.' });
        return;
    }
    
    setIsAnalyzing(true);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const dataUri = reader.result as string;
      setImagePreview(dataUri);
      const result = await analyzeProductImage({ photoDataUri: dataUri });
      
      if ('error' in result) {
        toast({ variant: 'destructive', title: 'AI Analysis Failed', description: result.error });
      } else {
        form.setValue('name', result.productName, { shouldValidate: true });
        form.setValue('model', result.modelNumber, { shouldValidate: true });
        form.setValue('hsn', result.hsn as any, { shouldValidate: true });
        form.setValue('quantity', result.quantity, { shouldValidate: true });
        form.setValue('price', result.price, { shouldValidate: true });
        toast({ title: 'AI Analysis Complete', description: 'Product details have been populated.' });
      }
      setIsAnalyzing(false);
    };
    reader.onerror = () => {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to read the image file.'});
        setIsAnalyzing(false);
    }
  };

  const onSubmit = (data: ProductFormValues) => {
    onAddProduct(data);
    form.reset();
    setImagePreview(null);
  };

  const handleClose = () => {
    form.reset();
    setImagePreview(null);
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Product</DialogTitle>
          <DialogDescription>
            Enter product details manually or upload an image to auto-fill.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="manual">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            <TabsTrigger value="ai">Analyze from Image</TabsTrigger>
          </TabsList>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <TabsContent value="manual" className="space-y-4 pt-4">
                {/* Manual form fields are also inside the main form */}
              </TabsContent>
              <TabsContent value="ai" className="pt-4">
                <div className="space-y-4">
                    <label htmlFor="image-upload" className="block text-sm font-medium text-gray-700">Product Image</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Product preview" className="mx-auto h-32 w-auto object-contain"/>
                            ) : (
                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                            )}
                            <div className="flex text-sm text-gray-600">
                                <label htmlFor="image-upload" className="relative cursor-pointer bg-background rounded-md font-medium text-primary hover:text-primary-foreground focus-within:outline-none">
                                    <span>Upload a file</span>
                                    <input id="image-upload" name="image-upload" type="file" className="sr-only" onChange={handleImageUpload} accept="image/*" disabled={isAnalyzing} />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 4MB</p>
                        </div>
                    </div>
                    {isAnalyzing && <div className="flex items-center justify-center text-sm"><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Analyzing...</div>}
                </div>
              </TabsContent>
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel>Product Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="model" render={({ field }) => ( <FormItem><FormLabel>Model No.</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                </div>
                <FormField
                  control={form.control}
                  name="hsn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>HSN Code</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an HSN code" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {hsnCodes.map((code) => (
                            <SelectItem key={code} value={code}>
                              {code}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-3 gap-4">
                    <FormField control={form.control} name="quantity" render={({ field }) => ( <FormItem><FormLabel>Quantity</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="quantityType" render={({ field }) => (
                        <FormItem><FormLabel>Unit</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select unit" /></SelectTrigger></FormControl>
                            <SelectContent>{quantityTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                        </Select><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="price" render={({ field }) => ( <FormItem><FormLabel>Price</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )} />
                </div>
              </div>

              <DialogFooter className="pt-6">
                <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
                <Button type="submit">Add Product</Button>
              </DialogFooter>
            </form>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
