'use server';

import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import type { User } from '@/types';

const secretKey = process.env.JWT_SECRET;
if (!secretKey) {
  throw new Error('JWT_SECRET environment variable is not set. Please add it to your .env file.');
}
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d') // Set token to expire in 1 day
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    // This can happen if the token is expired or invalid
    console.error('JWT Verification Error:', error);
    return null;
  }
}

export async function createSession(user: Omit<User, 'password'>) {
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day
    const session = await encrypt({ user, expires });
  
    cookies().set('session', session, { expires, httpOnly: true });
}
  
export async function getSession(): Promise<{ user: Omit<User, 'password'> } | null> {
    const sessionCookie = cookies().get('session')?.value;
    if (!sessionCookie) return null;
  
    const session = await decrypt(sessionCookie);
  
    if (!session?.user) return null;
  
    return { user: session.user };
}

export async function deleteSession() {
    cookies().delete('session');
}

export async function getAuthenticatedUserId(): Promise<string> {
    const session = await getSession();
    if (!session?.user?.id) {
        throw new Error("Authentication required. Please log in.");
    }
    return session.user.id;
}
