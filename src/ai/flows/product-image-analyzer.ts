'use server';

/**
 * @fileOverview Extracts product details from an image using Genkit.
 *
 * - analyzeProductImage - A function that analyzes a product image and extracts product details.
 * - ProductImageAnalyzerInput - The input type for the analyzeProductImage function.
 * - ProductImageAnalyzerOutput - The return type for the analyzeProductImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProductImageAnalyzerInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a product or invoice, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});

export type ProductImageAnalyzerInput = z.infer<typeof ProductImageAnalyzerInputSchema>;

const ProductImageAnalyzerOutputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  modelNumber: z.string().describe('The model number of the product.'),
  hsn: z.string().describe('The HSN code of the product.'),
  quantity: z.number().describe('The quantity of the product.'),
  price: z.number().describe('The price of the product.'),
});

export type ProductImageAnalyzerOutput = z.infer<typeof ProductImageAnalyzerOutputSchema>;

export async function analyzeProductImage(
  input: ProductImageAnalyzerInput
): Promise<ProductImageAnalyzerOutput> {
  return productImageAnalyzerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'productImageAnalyzerPrompt',
  input: {schema: ProductImageAnalyzerInputSchema},
  output: {schema: ProductImageAnalyzerOutputSchema},
  prompt: `You are an expert data extraction specialist.

You will receive an image of a product or invoice and extract the product details.

Extract the following information:
- Product Name
- Model Number
- HSN Code
- Quantity
- Price

Image: {{media url=photoDataUri}}`,
});

const productImageAnalyzerFlow = ai.defineFlow(
  {
    name: 'productImageAnalyzerFlow',
    inputSchema: ProductImageAnalyzerInputSchema,
    outputSchema: ProductImageAnalyzerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
