'use server';

import { revalidatePath } from "next/cache";
import dbConnect from "../mongodb";
import CompanyModel from "@/models/Company.model";
import type { Company } from "@/types";
import { getAuthenticatedUserId } from "../session";

const plain = (obj: any) => JSON.parse(JSON.stringify(obj));

export async function getCompanies(): Promise<Company[]> {
    try {
        const userId = await getAuthenticatedUserId();
        if (!userId) return [];
        await dbConnect();
        const companies = await CompanyModel.find({ userId }).sort({ name: 1 }).lean();
        return plain(companies);
    } catch (error: any) {
        console.error('Database Error: Failed to get companies.', error);
        throw new Error(`Failed to fetch companies. ${error.message}`);
    }
}

export async function getCompany(companyId: string): Promise<Company | null> {
    try {
        await dbConnect();
        const company = await CompanyModel.findById(companyId).lean();
        return plain(company);
    } catch (error: any) {
        console.error(`Database Error: Failed to get company ${companyId}.`, error);
        throw new Error(`Failed to fetch company details. ${error.message}`);
    }
}

export async function createCompany(companyData: Omit<Company, 'id' | '_id'>): Promise<Company> {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
        throw new Error("Authentication required.");
    }

    const { name } = companyData;
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        throw new Error("Company Name is a required field.");
    }

    try {
        await dbConnect();
        const newCompany = await CompanyModel.create({ ...companyData, userId });
        revalidatePath('/companies');
        return plain(newCompany);
    } catch (error: any) {
        console.error('Database Error: Failed to create company.', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((err: any) => err.message).join(', ');
            throw new Error(`Validation Error: ${messages}`);
        }
        throw new Error(`Failed to create company. ${error.message}`);
    }
}

export async function updateCompany(companyId: string, companyData: Partial<Company>): Promise<Company> {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
        throw new Error("Authentication required.");
    }

    const { name, ...rest } = companyData;
    const updateData: Partial<Omit<Company, 'id' | '_id'>> = rest;

    if (name !== undefined) {
        if (typeof name !== 'string' || name.trim().length === 0) {
            throw new Error("Company Name is a required field.");
        }
        updateData.name = name;
    }

    if (Object.keys(updateData).length === 0 && name === undefined) {
       const existingCompany = await getCompany(companyId);
       if (!existingCompany) throw new Error("Company not found.");
       return existingCompany;
    }
    
    try {
        await dbConnect();
        const companyToUpdate = await CompanyModel.findOne({ _id: companyId, userId });

        if (!companyToUpdate) {
            throw new Error("Company not found or permission denied.");
        }

        const updatedCompany = await CompanyModel.findByIdAndUpdate(companyId, updateData, { new: true }).lean();
        if (!updatedCompany) throw new Error("Failed to update company.");

        revalidatePath('/companies');
        revalidatePath(`/companies/new?id=${companyId}`);

        return plain(updatedCompany);
    } catch (error: any) {
        console.error(`Database Error: Failed to update company ${companyId}.`, error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((err: any) => err.message).join(', ');
            throw new Error(`Validation Error: ${messages}`);
        }
        throw new Error(`Failed to update company. ${error.message}`);
    }
}

export async function deleteCompany(companyId: string): Promise<{ id: string }> {
    const userId = await getAuthenticatedUserId();
    if(!userId) throw new Error("Authentication required.");
    
    try {
        await dbConnect();
        
        const companyToDelete = await CompanyModel.findOne({ _id: companyId, userId });
        if (!companyToDelete) {
            throw new Error("Company not found or permission denied.");
        }

        await CompanyModel.findByIdAndDelete(companyId);
        revalidatePath('/companies');
        return { id: companyId };
    } catch (error: any) {
        console.error(`Database Error: Failed to delete company ${companyId}.`, error);
        throw new Error(`Failed to delete company. ${error.message}`);
    }
}

export async function getCompanyCount(): Promise<number> {
    try {
        const userId = await getAuthenticatedUserId();
        if (!userId) return 0;
        await dbConnect();
        return CompanyModel.countDocuments({ userId });
    } catch (error: any) {
        console.error('Database Error: Failed to get company count.', error);
        throw new Error(`Failed to fetch company count. ${error.message}`);
    }
}
