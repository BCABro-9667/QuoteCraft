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
        const companies = await CompanyModel.find({ userId }).sort({ name: 1 });
        return plain(companies);
    } catch (error: any) {
        console.error('Database Error: Failed to get companies.', error);
        throw new Error(`Failed to fetch companies. ${error.message}`);
    }
}

export async function getCompany(companyId: string): Promise<Company | null> {
    try {
        await dbConnect();
        const company = await CompanyModel.findById(companyId);
        return plain(company);
    } catch (error: any) {
        console.error(`Database Error: Failed to get company ${companyId}.`, error);
        throw new Error(`Failed to fetch company details. ${error.message}`);
    }
}

export async function createCompany(companyData: Omit<Company, 'id'>) {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
        throw new Error("Authentication required.");
    }

    const { name, address, location, email, phone, contactPerson, gstin, remarks } = companyData;
    
    try {
        await dbConnect();
        await CompanyModel.create({
            userId,
            name,
            address,
            location,
            email,
            phone,
            contactPerson,
            gstin,
            remarks
        });
        revalidatePath('/companies');
    } catch (error: any) {
        console.error('Database Error: Failed to create company.', error);
        throw new Error(`Failed to create company. ${error.message}`);
    }
}

export async function updateCompany(companyId: string, companyData: Partial<Company>) {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
        throw new Error("Authentication required.");
    }
    try {
        await dbConnect();
        const companyToUpdate = await CompanyModel.findOne({ _id: companyId, userId });

        if (!companyToUpdate) {
            throw new Error("Company not found or permission denied.");
        }

        await CompanyModel.findByIdAndUpdate(companyId, companyData);
        revalidatePath('/companies');
        revalidatePath(`/companies/new?id=${companyId}`);
    } catch (error: any) {
        console.error(`Database Error: Failed to update company ${companyId}.`, error);
        throw new Error(`Failed to update company. ${error.message}`);
    }
}

export async function deleteCompany(companyId: string) {
    try {
        await dbConnect();
        await CompanyModel.findByIdAndDelete(companyId);
        revalidatePath('/companies');
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
