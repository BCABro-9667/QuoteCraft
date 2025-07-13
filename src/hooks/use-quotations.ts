
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getQuotations, createQuotation, updateQuotation, deleteQuotation, duplicateQuotation, updateQuotationProgress } from '@/lib/actions/quotation.actions';
import type { Quotation, QuotationStatus } from '@/types';
import { useToast } from './use-toast';

const quotationsQueryKey = ['quotations'];

export function useQuotations() {
    return useQuery({
        queryKey: quotationsQueryKey,
        queryFn: () => getQuotations(),
    });
}

export function useCreateQuotation() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: (newQuotation: Omit<Quotation, 'id' | '_id'>) => createQuotation(newQuotation),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: quotationsQueryKey });
            toast({ title: 'Success', description: 'Quotation created successfully.' });
        },
        onError: (err) => {
            toast({ variant: 'destructive', title: 'Error', description: err.message });
        },
    });
}


export function useUpdateQuotation() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: ({ quotationId, data }: { quotationId: string, data: Partial<Quotation> }) => updateQuotation(quotationId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: quotationsQueryKey });
            toast({ title: 'Success', description: 'Quotation updated successfully.' });
        },
        onError: (err) => {
            toast({ variant: 'destructive', title: 'Error', description: err.message });
        },
    });
}

export function useDeleteQuotation() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: (quotationId: string) => deleteQuotation(quotationId),
        onMutate: async (quotationId: string) => {
            await queryClient.cancelQueries({ queryKey: quotationsQueryKey });
            const previousQuotations = queryClient.getQueryData<Quotation[]>(quotationsQueryKey);
            queryClient.setQueryData<Quotation[]>(quotationsQueryKey, (old) => old?.filter(q => q.id !== quotationId));
            return { previousQuotations };
        },
        onSuccess: () => {
            toast({ title: 'Success', description: 'Quotation deleted successfully.' });
        },
        onError: (err, quotationId, context) => {
            if (context?.previousQuotations) {
                queryClient.setQueryData(quotationsQueryKey, context.previousQuotations);
            }
            toast({ variant: 'destructive', title: 'Error', description: err.message });
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: quotationsQueryKey });
        },
    });
}


export function useDuplicateQuotation() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: (quotationId: string) => duplicateQuotation(quotationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: quotationsQueryKey });
            toast({ title: 'Success', description: 'Quotation duplicated successfully.' });
        },
        onError: (err: any) => {
            toast({ variant: 'destructive', title: 'Error', description: err.message });
        },
    });
}

export function useUpdateQuotationProgress() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: ({ quotationId, progress }: { quotationId: string, progress: QuotationStatus }) => updateQuotationProgress(quotationId, progress),
        onMutate: async ({ quotationId, progress }) => {
            await queryClient.cancelQueries({ queryKey: quotationsQueryKey });
            const previousQuotations = queryClient.getQueryData<Quotation[]>(quotationsQueryKey);
            queryClient.setQueryData<Quotation[]>(quotationsQueryKey, (old) =>
                old?.map(q => q.id === quotationId ? { ...q, progress } : q)
            );
            return { previousQuotations };
        },
        onSuccess: () => {
            toast({ title: 'Status Updated', description: "Quotation progress has been updated." });
        },
        onError: (err, variables, context) => {
             if (context?.previousQuotations) {
                queryClient.setQueryData(quotationsQueryKey, context.previousQuotations);
            }
            toast({ variant: 'destructive', title: 'Error updating status', description: err.message });
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: quotationsQueryKey });
        }
    });
}
