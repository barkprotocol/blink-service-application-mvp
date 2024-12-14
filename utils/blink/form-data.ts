import { z } from 'zod';

// Define the schema for Blink form data
export const BlinkFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name must be 50 characters or less"),
  description: z.string().max(200, "Description must be 200 characters or less"),
  blinkType: z.enum(['standard', 'premium', 'limited'], {
    errorMap: () => ({ message: "Invalid Blink type" }),
  }),
  isNFT: z.boolean(),
  isDonation: z.boolean(),
  isGift: z.boolean(),
  isPayment: z.boolean(),
  isPoll: z.boolean(),
  image: z.string().url("Invalid image URL").optional(),
  expirationDate: z.date().optional(),
  targetAmount: z.number().min(0).optional(),
  recipientAddress: z.string().optional(),
});

// Type for the Blink form data
export type BlinkFormData = z.infer<typeof BlinkFormSchema>;

// Function to validate the form data
export function validateBlinkFormData(data: BlinkFormData): BlinkFormData {
  return BlinkFormSchema.parse(data);
}

// Function to prepare metadata for storage or blockchain
export function prepareBlinkMetadata(data: BlinkFormData): Record<string, any> {
  const metadata: Record<string, any> = {
    name: data.name,
    description: data.description,
    blinkType: data.blinkType,
    isNFT: data.isNFT,
    isDonation: data.isDonation,
    isGift: data.isGift,
    isPayment: data.isPayment,
    isPoll: data.isPoll,
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

// Function to sanitize the name (remove special characters, trim whitespace)
export function sanitizeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9 ]/g, '').trim();
}

// Function to truncate the description if it's too long
export function truncateDescription(description: string, maxLength: number = 200): string {
  return description.length > maxLength ? description.slice(0, maxLength - 3) + '...' : description;
}

// Function to generate a unique Blink ID
export function generateBlinkId(): string {
  return `blink_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Constants for Blink types
export const BLINK_TYPES = {
  STANDARD: 'standard',
  PREMIUM: 'premium',
  LIMITED: 'limited',
} as const;

// Function to check if a Blink has expired
export function isBlinkExpired(expirationDate: Date | undefined): boolean {
  if (!expirationDate) return false;
  return new Date() > expirationDate;
}

// Function to calculate progress towards target amount
export function calculateProgress(currentAmount: number, targetAmount: number): number {
  if (targetAmount <= 0) return 0;
  return Math.min((currentAmount / targetAmount) * 100, 100);
}

// Function to validate and prepare the Blink form data
export function prepareBlinkFormData(data: Partial<BlinkFormData>): BlinkFormData {
  const sanitizedData = {
    ...data,
    name: data.name ? sanitizeName(data.name) : '',
    description: data.description ? truncateDescription(data.description) : '',
    blinkType: data.blinkType || BLINK_TYPES.STANDARD,
    isNFT: data.isNFT || false,
    isDonation: data.isDonation || false,
    isGift: data.isGift || false,
    isPayment: data.isPayment || false,
    isPoll: data.isPoll || false,
  };

  return validateBlinkFormData(sanitizedData as BlinkFormData);
}

// Function to format Blink data for display
export function formatBlinkDataForDisplay(data: BlinkFormData): Record<string, string> {
  return {
    Name: data.name,
    Description: data.description,
    Type: data.blinkType,
    'Is NFT': data.isNFT ? 'Yes' : 'No',
    'Is Donation': data.isDonation ? 'Yes' : 'No',
    'Is Gift': data.isGift ? 'Yes' : 'No',
    'Is Payment': data.isPayment ? 'Yes' : 'No',
    'Is Poll': data.isPoll ? 'Yes' : 'No',
    Image: data.image || 'N/A',
    'Expiration Date': data.expirationDate ? data.expirationDate.toLocaleString() : 'N/A',
    'Target Amount': data.targetAmount !== undefined ? `${data.targetAmount} SOL` : 'N/A',
    'Recipient Address': data.recipientAddress || 'N/A',
  };
}

// Function to convert Blink data to a format suitable for blockchain storage
export function convertBlinkDataForBlockchain(data: BlinkFormData): Record<string, any> {
  return {
    ...prepareBlinkMetadata(data),
    id: generateBlinkId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Function to validate recipient address
export function validateRecipientAddress(address: string): boolean {
  // This is a simple check. In a real-world scenario, you'd want to use a more robust validation
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
}

// Function to estimate gas fees for creating a Blink
export function estimateBlinkCreationGasFees(data: BlinkFormData): number {
  // This is a placeholder. In a real-world scenario, you'd want to use actual gas estimation
  let baseFee = 0.001; // Base fee in SOL
  if (data.isNFT) baseFee += 0.002;
  if (data.isDonation || data.isPayment) baseFee += 0.001;
  if (data.isPoll) baseFee += 0.0005;
  return baseFee;
}

