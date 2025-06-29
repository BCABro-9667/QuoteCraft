'use server';

import { revalidatePath } from "next/cache";
import dbConnect from "../mongodb";
import UserProfileModel from "@/models/UserProfile.model";
import type { UserProfile } from "@/types";
import { getAuthenticatedUserId } from "../session";

const plain = (obj: any) => JSON.parse(JSON.stringify(obj));

export async function getProfile(): Promise<UserProfile | null> {
    const userId = await getAuthenticatedUserId();
    await dbConnect();
    const profile = await UserProfileModel.findOne({ userId });
    return plain(profile);
}

export async function updateProfile(profileData: Partial<UserProfile>) {
    const userId = await getAuthenticatedUserId();
    await dbConnect();
    await UserProfileModel.findOneAndUpdate({ userId }, profileData, { upsert: true });
    revalidatePath('/profile');
}
