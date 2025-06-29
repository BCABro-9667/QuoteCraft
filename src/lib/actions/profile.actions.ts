'use server';

import { revalidatePath } from "next/cache";
import dbConnect from "../mongodb";
import UserProfileModel from "@/models/UserProfile.model";
import type { UserProfile } from "@/types";

const plain = (obj: any) => JSON.parse(JSON.stringify(obj));

export async function getProfile(userId: string): Promise<UserProfile | null> {
    await dbConnect();
    const profile = await UserProfileModel.findOne({ userId });
    return plain(profile);
}

export async function updateProfile(userId: string, profileData: Partial<UserProfile>) {
    await dbConnect();
    await UserProfileModel.findOneAndUpdate({ userId }, profileData, { upsert: true });
    revalidatePath('/profile');
}
