'use server';

import { revalidatePath } from "next/cache";
import dbConnect from "../mongodb";
import HsnCodeModel from "@/models/HsnCode.model";
import { getAuthenticatedUserId } from "../session";

export async function getHsnCodes(): Promise<string[]> {
    const userId = await getAuthenticatedUserId();
    if (!userId) return [];
    try {
        await dbConnect();
        const hsnDocs = await HsnCodeModel.find({ userId }).sort({ code: 1 });
        return hsnDocs.map(doc => doc.code);
    } catch (error: any) {
        console.error('Database Error: Failed to get HSN codes.', error);
        throw new Error(`Failed to fetch HSN codes. ${error.message}`);
    }
}

export async function addHsnCode(code: string): Promise<{ success: boolean; message: string }> {
    const userId = await getAuthenticatedUserId();
    if (!userId) return { success: false, message: "Authentication required." };
    
    const trimmedCode = code.trim();
    if (!trimmedCode) return { success: false, message: "HSN code cannot be empty." };

    try {
        await dbConnect();
        await HsnCodeModel.create({ userId, code: trimmedCode });
        revalidatePath('/profile');
        revalidatePath('/quotations/new');
        return { success: true, message: "HSN code added." };
    } catch (error: any) {
        if (error.code === 11000) { // Duplicate key error
            return { success: false, message: "This HSN code already exists." };
        }
        console.error('Database Error: Failed to add HSN code.', error);
        return { success: false, message: `Failed to add HSN code. ${error.message}` };
    }
}

export async function deleteHsnCode(code: string): Promise<{ success: boolean; message: string }> {
    const userId = await getAuthenticatedUserId();
    if (!userId) return { success: false, message: "Authentication required." };

    try {
        await dbConnect();
        const result = await HsnCodeModel.deleteOne({ userId, code });
        if (result.deletedCount === 0) {
            return { success: false, message: "HSN code not found." };
        }
        revalidatePath('/profile');
        revalidatePath('/quotations/new');
        return { success: true, message: "HSN code deleted." };
    } catch (error: any) {
        console.error('Database Error: Failed to delete HSN code.', error);
        return { success: false, message: `Failed to delete HSN code. ${error.message}` };
    }
}
