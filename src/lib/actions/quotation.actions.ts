'use server';

import { revalidatePath } from "next/cache";
import dbConnect from "../mongodb";
import QuotationModel from "@/models/Quotation.model";
import CompanyModel from "@/models/Company.model";
import type { Quotation, QuotationStatus } from "@/types";

const plain = (obj: any) => JSON.parse(JSON.stringify(obj));

export async function getQuotations(userId: string): Promise<Quotation[]> {
    await dbConnect();
    const quotations = await QuotationModel.find({ userId }).sort({ date: -1 });
    
    const plainQuotations = plain(quotations);

    // Enrich with company data
    for (const q of plainQuotations) {
        if (q.companyId) {
            q.company = plain(await CompanyModel.findById(q.companyId));
        }
    }
    
    return plainQuotations;
}

export async function getQuotation(quotationId: string): Promise<Quotation | null> {
    await dbConnect();
    const quotation = await QuotationModel.findById(quotationId);
    return plain(quotation);
}

export async function getQuotationCountForNumber(userId: string): Promise<number> {
    await dbConnect();
    return QuotationModel.countDocuments({ userId });
}

export async function createQuotation(quotationData: Omit<Quotation, 'id'>, userId: string) {
    await dbConnect();
    await QuotationModel.create({ ...quotationData, userId });
    revalidatePath('/quotations');
}

export async function updateQuotation(quotationId: string, quotationData: Partial<Quotation>) {
    await dbConnect();
    await QuotationModel.findByIdAndUpdate(quotationId, quotationData);
    revalidatePath('/quotations');
    revalidatePath(`/quotations/new?id=${quotationId}`);
}

export async function deleteQuotation(quotationId: string) {
    await dbConnect();
    await QuotationModel.findByIdAndDelete(quotationId);
    revalidatePath('/quotations');
}

export async function updateQuotationProgress(quotationId: string, progress: QuotationStatus) {
    await dbConnect();
    await QuotationModel.findByIdAndUpdate(quotationId, { progress });
    revalidatePath('/quotations');
}
