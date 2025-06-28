import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumberForPdf(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function generateQuotationNumber(prefix: string, lastQuotationId: number): string {
    const currentYear = new Date().getFullYear();
    const nextYear = String(currentYear + 1).slice(-2);
    const financialYear = `${currentYear}-${nextYear}`;
    const newId = String(lastQuotationId + 1).padStart(2, '0');
    return `${prefix}/${financialYear}/${newId}`;
}
