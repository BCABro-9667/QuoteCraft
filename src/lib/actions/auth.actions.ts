'use server';

import type { UserCredentials, User } from '@/types';
import dbConnect from '../mongodb';
import UserModel from '@/models/User.model';
import UserProfileModel from '@/models/UserProfile.model';
import { revalidatePath } from 'next/cache';

// A helper function to convert Mongoose documents to plain objects
const plain = (obj: any) => JSON.parse(JSON.stringify(obj));

export async function register(credentials: UserCredentials): Promise<{ success: boolean; message: string, user?: Omit<User, 'password'> }> {
    await dbConnect();

    if (!credentials.password) {
        return { success: false, message: 'Password is required.' };
    }
    
    const existingUser = await UserModel.findOne({ email: credentials.email });
    if (existingUser) {
        return { success: false, message: 'An account with this email already exists.' };
    }

    try {
        const newUser = await UserModel.create({
            email: credentials.email,
            password: credentials.password, // In a real app, hash this password!
            firstName: credentials.firstName,
            lastName: credentials.lastName,
        });

        // Create a default profile for the new user
        await UserProfileModel.create({
            userId: newUser._id,
            companyName: 'My Company',
            logoUrl: 'https://placehold.co/100x100.png',
            email: newUser.email,
            website: '',
            phone: '',
            mobile: '',
            whatsapp: '',
            address: '',
            gstin: '',
            quotationPrefix: 'Q',
        });
        
        const { password, ...userToReturn } = plain(newUser);
        return { success: true, message: 'User registered successfully', user: userToReturn };

    } catch (error: any) {
        return { success: false, message: error.message || 'An unknown error occurred.' };
    }
}

export async function login(credentials: UserCredentials): Promise<{ success: boolean; message: string, user?: Omit<User, 'password'> }> {
    await dbConnect();
    
    try {
        const user = await UserModel.findOne({ email: credentials.email });

        if (!user || user.password !== credentials.password) {
            return { success: false, message: 'Invalid email or password.' };
        }
        
        const { password, ...userToReturn } = plain(user);
        return { success: true, message: 'Login successful', user: userToReturn };

    } catch (error: any) {
        return { success: false, message: error.message || 'An unknown error occurred.' };
    }
}
