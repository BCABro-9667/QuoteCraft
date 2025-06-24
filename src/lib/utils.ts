import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
}

export function generateQuotationNumber(lastQuotationId: number): string {
    const currentYear = new Date().getFullYear();
    const nextYear = String(currentYear + 1).slice(-2);
    const financialYear = `${currentYear}-${nextYear}`;
    const newId = String(lastQuotationId + 1).padStart(2, '0');
    return `ET/${financialYear}/${newId}`;
}
