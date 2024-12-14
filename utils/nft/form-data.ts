import { z } from 'zod';
import { DEFAULT_NFT_SYMBOL, MAX_NFT_NAME_LENGTH, MAX_NFT_SYMBOL_LENGTH } from '../constants';

// Define the schema for NFT form data
export const NFTFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(MAX_NFT_NAME_LENGTH, `Name must be ${MAX_NFT_NAME_LENGTH} characters or less`),
  symbol: z.string().max(MAX_NFT_SYMBOL_LENGTH, `Symbol must be ${MAX_NFT_SYMBOL_LENGTH} characters or less`).optional(),
  description: z.string().max(1000, "Description must be 1000 characters or less"),
  image: z.string().url("Invalid image URL"),
  sellerFeeBasisPoints: z.number().int().min(0).max(10000, "Seller fee basis points must be between 0 and 10000"),
  attributes: z.array(
    z.object({
      trait_type: z.string(),
      value: z.string()
    })
  ).optional(),
  collection: z.string().optional(),
  externalUrl: z.string().url("Invalid external URL").optional(),
  maxSupply: z.number().int().positive().optional(),
  isMutable: z.boolean().optional(),
  creators: z.array(
    z.object({
      address: z.string(),
      share: z.number().int().min(1).max(100)
    })
  ).optional(),
});

// Type for the NFT form data
export type NFTFormData = z.infer<typeof NFTFormSchema>;

// Function to validate the form data
export function validateNFTFormData(data: NFTFormData): NFTFormData {
  return NFTFormSchema.parse(data);
}

// Function to prepare metadata for Pinata or Arweave upload
export function prepareNFTMetadata(data: NFTFormData): Record<string, any> {
  const metadata: Record<string, any> = {
    name: data.name,
    symbol: data.symbol || DEFAULT_NFT_SYMBOL,
    description: data.description,
    image: data.image,
    seller_fee_basis_points: data.sellerFeeBasisPoints,
    attributes: data.attributes || [],
  };

  if (data.collection) {
    metadata.collection = { name: data.collection };
  }

  if (data.externalUrl) {
    metadata.external_url = data.externalUrl;
  }

  if (data.creators) {
    metadata.properties = {
      ...metadata.properties,
      creators: data.creators.map(creator => ({
        address: creator.address,
        share: creator.share,
      })),
    };
  }

  return metadata;
}

// Function to convert seller fee from percentage to basis points
export function sellerFeeToBasicPoints(percentage: number): number {
  return Math.round(percentage * 100);
}

// Function to convert basis points to percentage
export function basisPointsToPercentage(basisPoints: number): number {
  return basisPoints / 100;
}

// Function to generate a random symbol if not provided
export function generateRandomSymbol(): string {
  return Math.random().toString(36).substring(2, MAX_NFT_SYMBOL_LENGTH).toUpperCase();
}

// Function to sanitize the name (remove special characters, trim whitespace)
export function sanitizeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9 ]/g, '').trim();
}

// Function to truncate the description if it's too long
export function truncateDescription(description: string, maxLength: number = 1000): string {
  return description.length > maxLength ? description.slice(0, maxLength - 3) + '...' : description;
}

// Function to validate and prepare the NFT form data
export function prepareNFTFormData(data: Partial<NFTFormData>): NFTFormData {
  const sanitizedData = {
    ...data,
    name: data.name ? sanitizeName(data.name) : '',
    symbol: data.symbol || generateRandomSymbol(),
    description: data.description ? truncateDescription(data.description) : '',
    sellerFeeBasisPoints: data.sellerFeeBasisPoints || 0,
  };

  return validateNFTFormData(sanitizedData as NFTFormData);
}

// Function to format NFT data for display
export function formatNFTDataForDisplay(data: NFTFormData): Record<string, string> {
  return {
    Name: data.name,
    Symbol: data.symbol || DEFAULT_NFT_SYMBOL,
    Description: data.description,
    'Seller Fee': `${basisPointsToPercentage(data.sellerFeeBasisPoints)}%`,
    Collection: data.collection || 'N/A',
    'External URL': data.externalUrl || 'N/A',
    'Max Supply': data.maxSupply ? data.maxSupply.toString() : 'Unlimited',
    Mutable: data.isMutable !== undefined ? (data.isMutable ? 'Yes' : 'No') : 'N/A',
    Attributes: data.attributes ? JSON.stringify(data.attributes) : 'N/A',
    Creators: data.creators ? data.creators.map(c => `${c.address} (${c.share}%)`).join(', ') : 'N/A',
  };
}

// Function to validate creator addresses
export function validateCreatorAddresses(creators: { address: string; share: number }[]): boolean {
  return creators.every(creator => /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(creator.address));
}

// Function to calculate total creator shares
export function calculateTotalCreatorShares(creators: { address: string; share: number }[]): number {
  return creators.reduce((total, creator) => total + creator.share, 0);
}

// Function to validate and normalize creator shares
export function normalizeCreatorShares(creators: { address: string; share: number }[]): { address: string; share: number }[] {
  const totalShares = calculateTotalCreatorShares(creators);
  if (totalShares !== 100) {
    const factor = 100 / totalShares;
    return creators.map(creator => ({
      ...creator,
      share: Math.round(creator.share * factor)
    }));
  }
  return creators;
}

