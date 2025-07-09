'use client';

import Dexie, { type Table } from 'dexie';
import type { Company, Quotation, UserProfile } from '@/types';

export class LocalDB extends Dexie {
  companies!: Table<Company, string>; // Key is string (id)
  quotations!: Table<Quotation, string>; // Key is string (id)
  userProfile!: Table<UserProfile, string>; // Key is string (id)
  
  constructor() {
    super('QuoteCraftDB');
    this.version(2).stores({
      companies: 'id, name, location',
      quotations: 'id, quotationNumber, companyId, date, progress',
      userProfile: 'id'
    });
  }
}

export const db = new LocalDB();

export async function syncCompanies() {
  const { getCompanies } = await import('@/lib/actions/company.actions');
  const serverCompanies = await getCompanies();
  await db.transaction('rw', db.companies, async () => {
    await db.companies.clear();
    await db.companies.bulkAdd(serverCompanies);
  });
  return serverCompanies;
}

export async function syncQuotations() {
  const { getQuotations } = await import('@/lib/actions/quotation.actions');
  const serverQuotations = await getQuotations();
  await db.transaction('rw', db.quotations, async () => {
    await db.quotations.clear();
    await db.quotations.bulkAdd(serverQuotations);
  });
  return serverQuotations;
}

export async function syncUserProfile() {
    const { getProfile } = await import('@/lib/actions/profile.actions');
    const serverProfile = await getProfile();
    if (serverProfile) {
        await db.transaction('rw', db.userProfile, async () => {
            await db.userProfile.clear();
            await db.userProfile.put(serverProfile);
        });
    }
    return serverProfile;
}
