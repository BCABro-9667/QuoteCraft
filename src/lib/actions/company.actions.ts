'use server';

import { revalidatePath } from "next/cache";
import dbConnect from "../mongodb";
import CompanyModel from "@/models/Company.model";
import type { Company } from "@/types";
import { getAuthenticatedUserId } from "../session";

const plain = (obj: any) => JSON.parse(JSON.stringify(obj));

export async function getCompanies(): Promise<Company[]> {
    const userId = await getAuthenticatedUserId();
    await dbConnect();
    const companies = await CompanyModel.find({ userId }).sort({ name: 1 });
    return plain(companies);
}

export async function getCompany(companyId: string): Promise<Company | null> {
    await dbConnect();
    const company = await CompanyModel.findById(companyId);
    return plain(company);
}

export async function createCompany(companyData: Omit<Company, 'id'>) {
    const userId = await getAuthenticatedUserId();
    await dbConnect();
    await CompanyModel.create({ ...companyData, userId });
    revalidatePath('/companies');
}

export async function updateCompany(companyId: string, companyData: Partial<Company>) {
    await dbConnect();
    await CompanyModel.findByIdAndUpdate(companyId, companyData);
    revalidatePath('/companies');
    revalidatePath(`/companies/new?id=${companyId}`);
}

export async function deleteCompany(companyId: string) {
    await dbConnect();
    await CompanyModel.findByIdAndDelete(companyId);
    revalidatePath('/companies');
}

export async function getCompanyCount(): Promise<number> {
    const userId = await getAuthenticatedUserId();
    await dbConnect();
    return CompanyModel.countDocuments({ userId });
}
