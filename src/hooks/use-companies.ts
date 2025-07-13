
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCompanies, createCompany, updateCompany, deleteCompany } from '@/lib/actions/company.actions';
import type { Company } from '@/types';
import { useToast } from './use-toast';

const companiesQueryKey = ['companies'];

export function useCompanies() {
    return useQuery({
        queryKey: companiesQueryKey,
        queryFn: () => getCompanies(),
    });
}

export function useCreateCompany() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: (newCompany: Omit<Company, 'id' | '_id'>) => createCompany(newCompany),
        onMutate: async (newCompany) => {
            await queryClient.cancelQueries({ queryKey: companiesQueryKey });
            const previousCompanies = queryClient.getQueryData<Company[]>(companiesQueryKey);

            const optimisticCompany: Company = {
                id: `optimistic-${Date.now()}`,
                ...newCompany
            };

            queryClient.setQueryData<Company[]>(companiesQueryKey, (old) => [...(old || []), optimisticCompany]);
            return { previousCompanies };
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: companiesQueryKey });
            toast({ title: 'Success', description: 'Company created successfully.' });
        },
        onError: (err, newCompany, context) => {
            if (context?.previousCompanies) {
                queryClient.setQueryData(companiesQueryKey, context.previousCompanies);
            }
            toast({ variant: 'destructive', title: 'Error', description: err.message });
        },
    });
}

export function useUpdateCompany() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: ({ companyId, data }: { companyId: string, data: Partial<Company> }) => updateCompany(companyId, data),
        onMutate: async ({ companyId, data }) => {
            await queryClient.cancelQueries({ queryKey: companiesQueryKey });
            const previousCompanies = queryClient.getQueryData<Company[]>(companiesQueryKey);
            
            queryClient.setQueryData<Company[]>(companiesQueryKey, (old) => 
                old?.map(c => c.id === companyId ? { ...c, ...data } : c)
            );
            
            return { previousCompanies };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: companiesQueryKey });
            toast({ title: 'Success', description: 'Company updated successfully.' });
        },
        onError: (err, variables, context) => {
            if (context?.previousCompanies) {
                queryClient.setQueryData(companiesQueryKey, context.previousCompanies);
            }
            toast({ variant: 'destructive', title: 'Error', description: err.message });
        },
    });
}

export function useDeleteCompany() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: (companyId: string) => deleteCompany(companyId),
        onMutate: async (companyId) => {
            await queryClient.cancelQueries({ queryKey: companiesQueryKey });
            const previousCompanies = queryClient.getQueryData<Company[]>(companiesQueryKey);

            queryClient.setQueryData<Company[]>(companiesQueryKey, (old) => 
                old?.filter(c => c.id !== companyId)
            );

            return { previousCompanies };
        },
        onSuccess: () => {
            toast({ title: 'Success', description: 'Company deleted successfully.' });
        },
        onError: (err, companyId, context) => {
            if (context?.previousCompanies) {
                queryClient.setQueryData(companiesQueryKey, context.previousCompanies);
            }
            toast({ variant: 'destructive', title: 'Error', description: err.message });
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: companiesQueryKey });
        },
    });
}
