'use server';

import { revalidatePath } from "next/cache";
import dbConnect from "../mongodb";
import UserProfileModel from "@/models/UserProfile.model";
import type { UserProfile } from "@/types";
import { getAuthenticatedUserId } from "../session";

const plain = (obj: any) => JSON.parse(JSON.stringify(obj));

export async function getProfile(): Promise<UserProfile | null> {
    try {
        const userId = await getAuthenticatedUserId();
        if (!userId) return null;
        await dbConnect();
        const profile = await UserProfileModel.findOne({ userId });
        return plain(profile);
    } catch (error: any) {
        console.error('Database Error: Failed to get profile.', error);
        throw new Error(`Failed to fetch profile. ${error.message}`);
    }
}

export async function updateProfile(profileData: Partial<UserProfile>) {
    const userId = await getAuthenticatedUserId();
    if (!userId) throw new Error("Authentication required.");
    try {
        await dbConnect();
        await UserProfileModel.findOneAndUpdate({ userId }, profileData, { upsert: true });
        revalidatePath('/profile');
    } catch (error: any) {
        console.error('Database Error: Failed to update profile.', error);
        throw new Error(`Failed to update profile. ${error.message}`);
    }
}
