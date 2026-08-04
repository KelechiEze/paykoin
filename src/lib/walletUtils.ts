// walletUtils.ts

import { randomBytes as browserRandomBytes } from 'crypto-browserify';
import * as bitcoin from 'bitcoinjs-lib';
import ECPairFactory from 'ecpair';
import { ethers } from 'ethers';

// Setup ECPair instance
const ECPair = ECPairFactory(bitcoin);

// Base58 character set for fallback generator
const base58Chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

// Generate a Bitcoin address
export const generateBitcoinAddress = (): string => {
  const network = bitcoin.networks.bitcoin;
  const keyPair = ECPair.makeRandom({ network });

  const pubkey = keyPair.publicKey as Buffer; // 🔧 Cast for TS support
  const { address } = bitcoin.payments.p2pkh({ pubkey, network });

  return address || '1' + generateRandomBase58(33);
};

// Generate an Ethereum address
export const generateEthereumAddress = (): string => {
  const wallet = ethers.Wallet.createRandom();
  return wallet.address;
};

// Generate a USDT address (same format as Ethereum)
export const generateTetherAddress = (): string => {
  return generateEthereumAddress();
};

// Generate a Dogecoin address
export const generateDogecoinAddress = (): string => {
  const network = {
    messagePrefix: '\x19Dogecoin Signed Message:\n',
    bech32: 'doge',
    bip32: {
      public: 0x02facafd,
      private: 0x02fac398,
    },
    pubKeyHash: 0x1e,
    scriptHash: 0x16,
    wif: 0x9e,
  };

  const keyPair = ECPair.makeRandom({ network });
  const pubkey = keyPair.publicKey as Buffer; // 🔧 Explicit cast again
  const { address } = bitcoin.payments.p2pkh({ pubkey, network });

  return address || 'D' + generateRandomBase58(33);
};

// Helper to generate random base58 string
const generateRandomBase58 = (length: number): string => {
  const bytes = browserRandomBytes(length);
  return Array.from(bytes)
    .map((byte) => base58Chars[byte % base58Chars.length])
    .join('');
};

// Wallet color utility
export const getWalletColor = (symbol: string): string => {
  const colors: Record<string, string> = {
    btc: '#F7931A',
    eth: '#627EEA',
    usdt: '#26A17B',
    doge: '#CBAE5B',
    default: '#6B7280',
  };

  return colors[symbol.toLowerCase()] || colors.default;
};
