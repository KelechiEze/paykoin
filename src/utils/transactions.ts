// utils/transactions.ts
import { db } from '@/firebase';
import { doc, collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface Transaction {
  id?: string; // Optional since Firestore will auto-generate
  type: 'deposit' | 'withdrawal';
  amount: number;
  date: string;
  status: 'pending' | 'completed';
}

export const addTransaction = async (
  userId: string,
  walletId: string,
  transaction: Omit<Transaction, 'id'>
) => {
  try {
    const transactionsRef = collection(
      db,
      'users',
      userId,
      'wallets',
      walletId,
      'transactions'
    );

    // Add the transaction with server timestamp
    const docRef = await addDoc(transactionsRef, {
      ...transaction,
      createdAt: serverTimestamp()
    });

    return { ...transaction, id: docRef.id };
  } catch (error) {
    console.error('Error adding transaction:', error);
    throw error;
  }
};