import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
  Keypair,
} from '@solana/web3.js';
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { BLINK_PROGRAM_ID } from './constants';

// Blink account data structure (this should match your on-chain structure)
interface BlinkAccount {
  owner: PublicKey;
  blinkType: string;
  data: any; // This could be more specific based on your Blink types
  createdAt: number;
  updatedAt: number;
}

export async function fetchBlink(
  connection: Connection,
  blinkAddress: PublicKey
): Promise<BlinkAccount | null> {
  const accountInfo = await connection.getAccountInfo(blinkAddress);
  if (!accountInfo) {
    return null;
  }

  // Deserialize the account data based on your program's data structure
  // This is a placeholder and should be replaced with actual deserialization logic
  const blinkAccount: BlinkAccount = {
    owner: new PublicKey(accountInfo.data.slice(0, 32)),
    blinkType: accountInfo.data.slice(32, 64).toString(),
    data: JSON.parse(accountInfo.data.slice(64).toString()),
    createdAt: accountInfo.data.readUInt32LE(accountInfo.data.length - 8),
    updatedAt: accountInfo.data.readUInt32LE(accountInfo.data.length - 4),
  };

  return blinkAccount;
}

export async function updateBlink(
  connection: Connection,
  payer: Keypair,
  blinkAddress: PublicKey,
  newData: any
): Promise<string> {
  const updateBlinkIx = new TransactionInstruction({
    keys: [
      { pubkey: payer.publicKey, isSigner: true, isWritable: true },
      { pubkey: blinkAddress, isSigner: false, isWritable: true },
    ],
    programId: BLINK_PROGRAM_ID,
    data: Buffer.from(JSON.stringify({ action: 'update', newData }), 'utf-8'),
  });

  const transaction = new Transaction().add(updateBlinkIx);
  const signature = await sendAndConfirmTransaction(connection, transaction, [payer]);

  return signature;
}

export async function deleteBlink(
  connection: Connection,
  payer: Keypair,
  blinkAddress: PublicKey
): Promise<string> {
  const deleteBlinkIx = new TransactionInstruction({
    keys: [
      { pubkey: payer.publicKey, isSigner: true, isWritable: true },
      { pubkey: blinkAddress, isSigner: false, isWritable: true },
    ],
    programId: BLINK_PROGRAM_ID,
    data: Buffer.from(JSON.stringify({ action: 'delete' }), 'utf-8'),
  });

  const transaction = new Transaction().add(deleteBlinkIx);
  const signature = await sendAndConfirmTransaction(connection, transaction, [payer]);

  return signature;
}

export async function transferNFTBlink(
  connection: Connection,
  payer: Keypair,
  blinkAddress: PublicKey,
  recipient: PublicKey
): Promise<string> {
  const blinkAccount = await fetchBlink(connection, blinkAddress);
  if (!blinkAccount || blinkAccount.blinkType !== 'NFT') {
    throw new Error('Invalid NFT Blink');
  }

  const transferNFTBlinkIx = new TransactionInstruction({
    keys: [
      { pubkey: payer.publicKey, isSigner: true, isWritable: true },
      { pubkey: recipient, isSigner: false, isWritable: true },
      { pubkey: blinkAddress, isSigner: false, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    programId: BLINK_PROGRAM_ID,
    data: Buffer.from(JSON.stringify({ action: 'transfer_nft' }), 'utf-8'),
  });

  const transaction = new Transaction().add(transferNFTBlinkIx);
  const signature = await sendAndConfirmTransaction(connection, transaction, [payer]);

  return signature;
}

export async function claimPaymentBlink(
  connection: Connection,
  recipient: Keypair,
  blinkAddress: PublicKey
): Promise<string> {
  const blinkAccount = await fetchBlink(connection, blinkAddress);
  if (!blinkAccount || blinkAccount.blinkType !== 'Payment') {
    throw new Error('Invalid Payment Blink');
  }

  const claimPaymentBlinkIx = new TransactionInstruction({
    keys: [
      { pubkey: recipient.publicKey, isSigner: true, isWritable: true },
      { pubkey: blinkAddress, isSigner: false, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    programId: BLINK_PROGRAM_ID,
    data: Buffer.from(JSON.stringify({ action: 'claim_payment' }), 'utf-8'),
  });

  const transaction = new Transaction().add(claimPaymentBlinkIx);
  const signature = await sendAndConfirmTransaction(connection, transaction, [recipient]);

  return signature;
}

export async function executeReferralBlink(
  connection: Connection,
  user: Keypair,
  blinkAddress: PublicKey
): Promise<string> {
  const blinkAccount = await fetchBlink(connection, blinkAddress);
  if (!blinkAccount || blinkAccount.blinkType !== 'Referral') {
    throw new Error('Invalid Referral Blink');
  }

  const executeReferralBlinkIx = new TransactionInstruction({
    keys: [
      { pubkey: user.publicKey, isSigner: true, isWritable: true },
      { pubkey: blinkAddress, isSigner: false, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    programId: BLINK_PROGRAM_ID,
    data: Buffer.from(JSON.stringify({ action: 'execute_referral' }), 'utf-8'),
  });

  const transaction = new Transaction().add(executeReferralBlinkIx);
  const signature = await sendAndConfirmTransaction(connection, transaction, [user]);

  return signature;
}

export async function fetchUserBlinks(
  connection: Connection,
  userPublicKey: PublicKey
): Promise<BlinkAccount[]> {
  const userBlinks: BlinkAccount[] = [];

  // This is a simplified approach. In a real-world scenario, you'd want to use more
  // efficient methods like getProgramAccounts with filters
  const accounts = await connection.getProgramAccounts(BLINK_PROGRAM_ID);

  for (const account of accounts) {
    const blinkAccount = await fetchBlink(connection, account.pubkey);
    if (blinkAccount && blinkAccount.owner.equals(userPublicKey)) {
      userBlinks.push(blinkAccount);
    }
  }

  return userBlinks;
}

export async function getBlinkBalance(
  connection: Connection,
  blinkAddress: PublicKey
): Promise<number> {
  const blinkAccount = await fetchBlink(connection, blinkAddress);
  if (!blinkAccount) {
    throw new Error('Blink not found');
  }

  if (blinkAccount.blinkType === 'Payment' || blinkAccount.blinkType === 'Donation') {
    const tokenAccount = await Token.getAssociatedTokenAddress(
      TOKEN_PROGRAM_ID,
      new PublicKey(blinkAccount.data.tokenMint),
      blinkAddress,
      true
    );

    const balance = await connection.getTokenAccountBalance(tokenAccount);
    return parseFloat(balance.value.amount);
  } else {
    throw new Error('Blink type does not have a balance');
  }
}

