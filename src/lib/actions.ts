'use server';

import { analyzeProductImage as analyzeProductImageFlow } from "@/ai/flows/product-image-analyzer";
import type { ProductImageAnalyzerInput, ProductImageAnalyzerOutput } from "@/ai/flows/product-image-analyzer";

export async function analyzeProductImage(input: ProductImageAnalyzerInput): Promise<ProductImageAnalyzerOutput | { error: string }> {
  try {
    const result = await analyzeProductImageFlow(input);
    return result;
  } catch (e) {
    console.error("Error in analyzeProductImage server action:", e);
    return { error: e instanceof Error ? e.message : 'An unknown error occurred during image analysis.' };
  }
}
