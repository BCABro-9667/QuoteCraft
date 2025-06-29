'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import type { UserProfile } from '@/types';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { getProfile, updateProfile } from '@/lib/actions/profile.actions';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

const profileFormSchema = z.object({
  companyName: z.string().min(1, { message: 'Company Name is required' }),
  logoUrl: z.string().url({ message: 'Please enter a valid URL' }).optional().or(z.literal('')),
  email: z.string().email({ message: 'Invalid email address' }).optional().or(z.literal('')),
  website: z.string().url({ message: 'Please enter a valid URL' }).optional().or(z.literal('')),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  whatsapp: z.string().optional(),
  address: z.string().optional(),
  gstin: z.string().optional(),
  quotationPrefix: z.string().min(1, { message: 'Quotation prefix is required' }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const defaultProfileValues = {
    companyName: '', logoUrl: '', email: '', website: '', phone: '',
    mobile: '', whatsapp: '', address: '', gstin: '', quotationPrefix: '',
};

export function ProfileForm() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: defaultProfileValues,
    mode: 'onChange',
  });

  const logoUrl = form.watch('logoUrl');

  useEffect(() => {
    if (user?.id) {
        const fetchProfile = async () => {
            setIsLoading(true);
            try {
              const profileData = await getProfile();
              if (profileData) {
                  form.reset(profileData);
              }
            } catch (error) {
               toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch profile.' });
            } finally {
               setIsLoading(false);
            }
        };
        fetchProfile();
    }
  }, [user, form.reset, toast]);


  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
        return;
    }
    setIsSubmitting(true);
    try {
        await updateProfile(data);
        toast({ title: "Success", description: "Profile updated successfully." });
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to update profile.' });
    } finally {
        setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2 flex items-center gap-6">
                    <Skeleton className="h-[100px] w-[100px] rounded-lg" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </div>
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                ))}
            </div>
        </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2 flex items-center gap-6">
                <Image 
                    src={logoUrl || 'https://placehold.co/100x100.png'}
                    alt="Company Logo"
                    width={100}
                    height={100}
                    className="rounded-lg border bg-muted object-contain"
                    data-ai-hint="logo"
                />
                <div className="flex-1">
                    <FormField
                    control={form.control}
                    name="logoUrl"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Company Logo URL</FormLabel>
                        <FormControl>
                            <Input placeholder="https://your-domain.com/logo.png" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
            </div>

            <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Company Name *</FormLabel>
                    <FormControl>
                    <Input placeholder="Your Company Name" {...field} />
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
                    <Input placeholder="contact@yourcompany.com" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                    <Input placeholder="https://yourcompany.com" {...field} />
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
                    <Input placeholder="e.g. 022-23456789" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="mobile"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Mobile Number</FormLabel>
                    <FormControl>
                    <Input placeholder="e.g. 9876543210" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="whatsapp"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>WhatsApp Number</FormLabel>
                    <FormControl>
                    <Input placeholder="e.g. 9876543210" {...field} />
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
             <FormField
                control={form.control}
                name="quotationPrefix"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Quotation Prefix *</FormLabel>
                    <FormControl>
                    <Input placeholder="e.g. Q-" {...field} />
                    </FormControl>
                    <FormDescription>
                        The prefix for your quotation numbers. E.g., 'Q-' becomes 'Q-/2023-24/01'.
                    </FormDescription>
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
                        <Textarea placeholder="Your company's full address" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
        </div>
        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  );
}
