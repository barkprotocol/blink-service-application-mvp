import { z } from 'zod';
import { 
  NFT_TYPES, 
  BLINK_PURPOSES, 
  MAX_FILE_SIZE, 
  ALLOWED_FILE_TYPES,
  MAX_BLINK_NAME_LENGTH,
  MAX_BLINK_DESCRIPTION_LENGTH,
  MAX_NFT_NAME_LENGTH,
  MAX_NFT_SYMBOL_LENGTH,
  DEFAULT_NFT_SYMBOL,
  DEFAULT_SELLER_FEE_BASIS_POINTS
} from '../constants';

// Define the schema for Blink form data
export const BlinkFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(MAX_BLINK_NAME_LENGTH, `Name must be ${MAX_BLINK_NAME_LENGTH} characters or less`),
  description: z.string().max(MAX_BLINK_DESCRIPTION_LENGTH, `Description must be ${MAX_BLINK_DESCRIPTION_LENGTH} characters or less`),
  purpose: z.enum(Object.values(BLINK_PURPOSES) as [string, ...string[]], {
    errorMap: () => ({ message: "Invalid Blink purpose" }),
  }),
  image: z.string().url("Invalid image URL").optional(),
  expirationDate: z.date().optional(),
  targetAmount: z.number().min(0).optional(),
  recipientAddress: z.string().optional(),
});

// Define the schema for NFT form data
export const NFTFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(MAX_NFT_NAME_LENGTH, `Name must be ${MAX_NFT_NAME_LENGTH} characters or less`),
  symbol: z.string().max(MAX_NFT_SYMBOL_LENGTH, `Symbol must be ${MAX_NFT_SYMBOL_LENGTH} characters or less`).optional(),
  description: z.string().max(1000, "Description must be 1000 characters or less"),
  image: z.string().url("Invalid image URL"),
  type: z.enum(Object.values(NFT_TYPES) as [string, ...string[]], {
    errorMap: () => ({ message: "Invalid NFT type" }),
  }),
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
});

// Types for the form data
export type BlinkFormData = z.infer<typeof BlinkFormSchema>;
export type NFTFormData = z.infer<typeof NFTFormSchema>;

// Function to validate the Blink form data
export function validateBlinkFormData(data: BlinkFormData): BlinkFormData {
  return BlinkFormSchema.parse(data);
}

// Function to validate the NFT form data
export function validateNFTFormData(data: NFTFormData): NFTFormData {
  return NFTFormSchema.parse(data);
}

// Function to prepare metadata for Blink storage
export function prepareBlinkMetadata(data: BlinkFormData): Record<string, any> {
  const metadata: Record<string, any> = {
    name: data.name,
    description: data.description,
    purpose: data.purpose,
  };

  if (data.image) {
    metadata.image = data.image;
  }

  if (data.expirationDate) {
    metadata.expirationDate = data.expirationDate.toISOString();
  }

  if (data.targetAmount !== undefined) {
    metadata.targetAmount = data.targetAmount;
  }

  if (data.recipientAddress) {
    metadata.recipientAddress = data.recipientAddress;
  }

  return metadata;
}

// Function to prepare metadata for NFT storage
export function prepareNFTMetadata(data: NFTFormData): Record<string, any> {
  const metadata: Record<string, any> = {
    name: data.name,
    symbol: data.symbol || DEFAULT_NFT_SYMBOL,
    description: data.description,
    image: data.image,
    attributes: data.attributes || [],
    seller_fee_basis_points: data.sellerFeeBasisPoints,
    type: data.type,
  };

  if (data.collection) {
    metadata.collection = { name: data.collection };
  }

  if (data.externalUrl) {
    metadata.external_url = data.externalUrl;
  }

  if (data.maxSupply) {
    metadata.max_supply = data.maxSupply;
  }

  if (data.isMutable !== undefined) {
    metadata.is_mutable = data.isMutable;
  }

  return metadata;
}

// Function to validate file upload
export function validateFileUpload(file: File): boolean {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds the maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB.`);
  }

  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    throw new Error(`Invalid file type. Allowed types are: ${ALLOWED_FILE_TYPES.join(', ')}`);
  }

  return true;
}

// Function to sanitize input strings
export function sanitizeString(input: string): string {
  return input.replace(/[^\w\s-]/gi, '').trim();
}

// Function to generate a random symbol if not provided
export function generateRandomSymbol(): string {
  return Math.random().toString(36).substring(2, MAX_NFT_SYMBOL_LENGTH).toUpperCase();
}

// Function to convert seller fee from percentage to basis points
export function sellerFeeToBasicPoints(percentage: number): number {
  return Math.round(percentage * 100);
}

// Function to convert basis points to percentage
export function basisPointsToPercentage(basisPoints: number): number {
  return basisPoints / 100;
}

// Function to validate and prepare the Blink form data
export function prepareBlinkFormData(data: Partial<BlinkFormData>): BlinkFormData {
  const sanitizedData = {
    ...data,
    name: data.name ? sanitizeString(data.name) : '',
    description: data.description ? sanitizeString(data.description) : '',
    purpose: data.purpose || BLINK_PURPOSES.GIFT,
  };

  return validateBlinkFormData(sanitizedData as BlinkFormData);
}

// Function to validate and prepare the NFT form data
export function prepareNFTFormData(data: Partial<NFTFormData>): NFTFormData {
  const sanitizedData = {
    ...data,
    name: data.name ? sanitizeString(data.name) : '',
    symbol: data.symbol ? sanitizeString(data.symbol) : generateRandomSymbol(),
    description: data.description ? sanitizeString(data.description) : '',
    type: data.type || NFT_TYPES.STANDARD,
    sellerFeeBasisPoints: data.sellerFeeBasisPoints || DEFAULT_SELLER_FEE_BASIS_POINTS,
  };

  return validateNFTFormData(sanitizedData as NFTFormData);
}
