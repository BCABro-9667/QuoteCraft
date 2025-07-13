'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import type { Company } from '@/types';
import { getCompany } from '@/lib/actions/company.actions';
import { useCreateCompany, useUpdateCompany } from '@/hooks/use-companies';
import { Loader2 } from 'lucide-react';

const companyFormSchema = z.object({
  name: z.string().min(1, { message: 'Company Name is required' }),
  address: z.string().optional(),
  location: z.string().optional(),
  email: z.string().email({ message: 'Invalid email address' }).optional().or(z.literal('')),
  phone: z.string().optional(),
  contactPerson: z.string().optional(),
  gstin: z.string().optional(),
  remarks: z.string().optional(),
});

type CompanyFormValues = z.infer<typeof companyFormSchema>;

export function CompanyForm({ companyId }: { companyId?: string }) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const createCompanyMutation = useCreateCompany();
  const updateCompanyMutation = useUpdateCompany();
  const isEditMode = !!companyId;
  const [isLoading, setIsLoading] = useState(isEditMode);
  
  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: '', address: '', location: '', email: '',
      phone: '', contactPerson: '', gstin: '', remarks: '',
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (isEditMode && companyId) {
      if (!authLoading && user) {
        const fetchCompany = async () => {
          setIsLoading(true);
          try {
            const company = await getCompany(companyId);
            if (company) {
              form.reset(company);
            } else {
              router.push('/companies');
            }
          } catch (error: any) {
            console.error('Failed to fetch company details:', error);
          } finally {
            setIsLoading(false);
          }
        };
        fetchCompany();
      } else if (!authLoading && !user) {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, [companyId, user, authLoading, isEditMode, form, router]);

  const onSubmit = async (data: CompanyFormValues) => {
    if (!user) return;

    if (isEditMode && companyId) {
        updateCompanyMutation.mutate({ companyId, data }, {
            onSuccess: () => router.push('/companies'),
        });
    } else {
        createCompanyMutation.mutate(data, {
            onSuccess: () => router.push('/companies'),
        });
    }
  };
  
  const isSubmitting = createCompanyMutation.isPending || updateCompanyMutation.isPending;

  if (isLoading) {
    return <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Name *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Innovate Solutions" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. contact@innovate.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 9876543210" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contactPerson"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Person</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Arjun Mehra" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Bangalore" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="gstin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>GSTIN</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 29ABCDE1234F1Z5" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Company's full address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any additional notes" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? 'Update' : 'Save'} Company
          </Button>
        </div>
      </form>
    </Form>
  );
}
