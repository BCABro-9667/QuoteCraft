
'use server';

import { revalidatePath } from "next/cache";
import dbConnect from "../mongodb";
import QuotationModel from "@/models/Quotation.model";
import CompanyModel from "@/models/Company.model";
import type { Quotation, QuotationStatus } from "@/types";
import { getAuthenticatedUserId } from "../session";
import { getProfile } from "./profile.actions";
import { generateQuotationNumber } from "../utils";

const plain = (obj: any) => JSON.parse(JSON.stringify(obj));

export async function getQuotations(): Promise<Quotation[]> {
    try {
        const userId = await getAuthenticatedUserId();
        if (!userId) return [];
        await dbConnect();
        const quotations = await QuotationModel.find({ userId }).sort({ quotationNumber: -1 }).lean();
        
        const plainQuotations = plain(quotations);

        // Enrich with company data
        const companyIds = [...new Set(plainQuotations.map(q => q.companyId).filter(Boolean))];
        const companies = await CompanyModel.find({ _id: { $in: companyIds } }).lean();
        const companyMap = new Map(companies.map(c => [c._id.toString(), plain(c)]));

        for (const q of plainQuotations) {
            if (q.companyId) {
                q.company = companyMap.get(q.companyId);
            }
        }
        
        return plainQuotations;
    } catch (error: any) {
        console.error('Database Error: Failed to get quotations.', error);
        throw new Error(`Failed to fetch quotations. ${error.message}`);
    }
}

export async function getQuotation(quotationId: string): Promise<Quotation | null> {
    try {
        await dbConnect();
        const quotation = await QuotationModel.findById(quotationId).lean();
        return plain(quotation);
    } catch (error: any) {
        console.error(`Database Error: Failed to get quotation ${quotationId}.`, error);
        throw new Error(`Failed to fetch quotation details. ${error.message}`);
    }
}

export async function getQuotationCountForNumber(): Promise<number> {
    try {
        const userId = await getAuthenticatedUserId();
        if (!userId) return 0;
        await dbConnect();
        return QuotationModel.countDocuments({ userId });
    } catch (error: any) {
        console.error('Database Error: Failed to get quotation count.', error);
        throw new Error(`Failed to fetch quotation count. ${error.message}`);
    }
}

export async function createQuotation(quotationData: Omit<Quotation, 'id' | '_id'>): Promise<Quotation> {
    const userId = await getAuthenticatedUserId();
    if (!userId) throw new Error("Authentication required.");
    try {
        await dbConnect();
        const newQuotation = await QuotationModel.create({ ...quotationData, userId });
        revalidatePath('/quotations');
        return plain(newQuotation);
    } catch (error: any) {
        console.error('Database Error: Failed to create quotation.', error);
        throw new Error(`Failed to create quotation. ${error.message}`);
    }
}

export async function updateQuotation(quotationId: string, quotationData: Partial<Quotation>): Promise<Quotation> {
    try {
        await dbConnect();
        const updatedQuotation = await QuotationModel.findByIdAndUpdate(quotationId, quotationData, { new: true }).lean();
        if (!updatedQuotation) throw new Error("Failed to update quotation or quotation not found.");
        
        revalidatePath('/quotations');
        revalidatePath(`/quotations/new?id=${quotationId}`);

        return plain(updatedQuotation);
    } catch (error: any) {
        console.error(`Database Error: Failed to update quotation ${quotationId}.`, error);
        throw new Error(`Failed to update quotation. ${error.message}`);
    }
}

export async function deleteQuotation(quotationId: string): Promise<{ id: string }> {
    try {
        await dbConnect();
        await QuotationModel.findByIdAndDelete(quotationId);
        revalidatePath('/quotations');
        return { id: quotationId };
    } catch (error: any) {
        console.error(`Database Error: Failed to delete quotation ${quotationId}.`, error);
        throw new Error(`Failed to delete quotation. ${error.message}`);
    }
}

export async function duplicateQuotation(quotationId: string): Promise<Quotation> {
    const userId = await getAuthenticatedUserId();
    if (!userId) throw new Error("Authentication required.");

    try {
        await dbConnect();
        const originalQuotation = await QuotationModel.findById(quotationId).lean();
        if (!originalQuotation) {
            throw new Error("Original quotation not found.");
        }

        const profile = await getProfile();
        if (!profile) {
            throw new Error("User profile not found, cannot generate new quotation number.");
        }
        
        const quotationCount = await getQuotationCountForNumber();
        const newQuotationNumber = generateQuotationNumber(profile.quotationPrefix, quotationCount);

        const duplicatedQuotation = plain(originalQuotation);
        delete duplicatedQuotation._id;
        delete duplicatedQuotation.id;

        const newQuotationData = {
            ...duplicatedQuotation,
            userId,
            quotationNumber: newQuotationNumber,
            date: new Date().toLocaleDateString('en-CA'),
            progress: 'Pending' as QuotationStatus,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const createdQuotation = await QuotationModel.create(newQuotationData);
        revalidatePath('/quotations');
        return plain(createdQuotation);

    } catch (error: any) {
        console.error('Database Error: Failed to duplicate quotation.', error);
        throw new Error(`Failed to duplicate quotation. ${error.message}`);
    }
}

export async function updateQuotationProgress(quotationId: string, progress: QuotationStatus): Promise<Quotation> {
    try {
        await dbConnect();
        const updatedQuotation = await QuotationModel.findByIdAndUpdate(quotationId, { progress }, { new: true }).lean();
        if (!updatedQuotation) throw new Error("Failed to update quotation progress or quotation not found.");

        revalidatePath('/quotations');
        return plain(updatedQuotation);
    } catch (error: any) {
        console.error(`Database Error: Failed to update quotation progress for ${quotationId}.`, error);
        throw new Error(`Failed to update quotation status. ${error.message}`);
    }
}

export async function getQuotationStats(): Promise<{ total: number; pending: number; completed: number; rejected: number }> {
    try {
        const userId = await getAuthenticatedUserId();
        if (!userId) {
            return { total: 0, pending: 0, completed: 0, rejected: 0 };
        }
        await dbConnect();
        const [total, pending, completed, rejected] = await Promise.all([
            QuotationModel.countDocuments({ userId }),
            QuotationModel.countDocuments({ userId, progress: 'Pending' }),
            QuotationModel.countDocuments({ userId, progress: 'Complete' }),
            QuotationModel.countDocuments({ userId, progress: 'Rejected' })
        ]);
        return { total, pending, completed, rejected };
    } catch (error: any) {
        console.error('Database Error: Failed to get quotation stats.', error);
        throw new Error(`Failed to fetch quotation stats. ${error.message}`);
    }
}
