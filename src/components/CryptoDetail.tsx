import React, { useState } from 'react';
import { ArrowLeft, Copy, Check, ExternalLink, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/firebase';
import {
  doc,
  collection,
  query,
  orderBy,
  onSnapshot
} from 'firebase/firestore';

interface CryptoDetailProps {
  crypto: Cryptocurrency;
  onBack: () => void;
  userId: string;
}

const CryptoDetail: React.FC<CryptoDetailProps> = ({ crypto, onBack, userId }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>(crypto.transactions);
  const { toast } = useToast();

  // Real-time transaction updates
  useEffect(() => {
    if (!userId) return;

    const transactionsRef = collection(
      db,
      'users',
      userId,
      'wallets',
      crypto.id,
      'transactions'
    );
    const q = query(transactionsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updatedTransactions = snapshot.docs
        .filter(doc => doc.id !== 'initial')
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Transaction[];
      setTransactions(updatedTransactions);
    });

    return () => unsubscribe();
  }, [userId, crypto.id]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(crypto.address)
      .then(() => {
        setIsCopied(true);
        toast({
          description: "Wallet address copied to clipboard",
        });
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        toast({
          variant: "destructive",
          description: "Failed to copy address",
        });
      });
  };

  const handleViewOnExplorer = () => {
    let explorerUrl = '';
    switch (crypto.symbol.toLowerCase()) {
      case 'btc': explorerUrl = `https://www.blockchain.com/explorer/addresses/btc/${crypto.address}`; break;
      case 'eth': explorerUrl = `https://etherscan.io/address/${crypto.address}`; break;
      case 'sol': explorerUrl = `https://solscan.io/account/${crypto.address}`; break;
      case 'ada': explorerUrl = `https://cardanoscan.io/address/${crypto.address}`; break;
      default: explorerUrl = `https://www.google.com/search?q=${crypto.name}+blockchain+explorer`;
    }
    window.open(explorerUrl, '_blank');
  };

  return (
    <div className="animate-fade-in">
      <button 
        onClick={onBack}
        className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft size={18} className="mr-2" />
        <span>Back to Wallets</span>
      </button>
      
      <div className="dashboard-card mb-8">
        {/* Wallet header and balance display */}
        <div className="flex items-center mb-6">
          <div 
            className="w-12 h-12 rounded-full mr-4 flex items-center justify-center"
            style={{ backgroundColor: `${crypto.color}20` }}
          >
            <span style={{ color: crypto.color }} className="text-lg font-bold">
              {crypto.symbol.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-2xl font-bold">{crypto.name}</h2>
            <p className="text-gray-500">{crypto.symbol.toUpperCase()}</p>
          </div>
        </div>
        
        {/* Balance and change */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <p className="text-gray-500 mb-1">Balance</p>
            <h3 className="text-3xl font-bold">{crypto.balance.toFixed(8)} {crypto.symbol.toUpperCase()}</h3>
            <p className="mt-1 text-xl">${crypto.usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          
          <div className="flex flex-col justify-center">
            <div className={cn(
              "py-2 px-4 rounded-lg text-center",
              crypto.isUp ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
            )}>
              <p className="font-medium">
                {crypto.isUp ? "+" : ""}{crypto.change.toFixed(2)}% 
                <span className="text-sm font-normal ml-1">last 24h</span>
              </p>
            </div>
          </div>
        </div>
        
        {/* Wallet address */}
        <div className="space-y-6">
          <div>
            <h3 className="text-gray-600 font-medium mb-2">Wallet Address</h3>
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-700 font-mono truncate">
                  {crypto.address}
                </p>
                <button 
                  onClick={copyToClipboard} 
                  className="ml-2 p-2 rounded-full hover:bg-gray-200 transition-colors"
                >
                  {isCopied ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
                </button>
              </div>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => setShowTransferModal(true)}
              className="flex items-center py-2.5 px-4 rounded-lg bg-crypto-blue text-white font-medium hover:bg-crypto-blue/90 transition-colors"
            >
              <DollarSign size={16} className="mr-2" />
              <span>Deposit</span>
            </button>
            <button 
              onClick={handleViewOnExplorer}
              className="flex items-center py-2.5 px-4 rounded-lg border border-gray-200 font-medium hover:bg-gray-50 transition-colors"
            >
              <ExternalLink size={16} className="mr-2" />
              <span>View on Explorer</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Transaction history */}
      <div className="dashboard-card">
        <h3 className="text-xl font-semibold mb-6">Transaction History</h3>
        {transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <p className={`font-medium capitalize ${tx.type === 'deposit' ? 'text-green-600' : 'text-red-500'}`}>
                    {tx.type}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(tx.date).toLocaleDateString()} • {tx.status}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${tx.type === 'deposit' ? 'text-green-600' : 'text-red-500'}`}>
                    {tx.type === "deposit" ? "+" : "-"}{tx.amount} {crypto.symbol.toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {tx.status === "completed" ? 'Completed' : 'Pending'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500">
            <p>No transactions found for this wallet</p>
            <button 
              onClick={() => setShowTransferModal(true)}
              className="mt-4 text-crypto-blue font-medium hover:underline"
            >
              Make your first transaction
            </button>
          </div>
        )}
      </div>
      
      {/* Transfer modal */}
      {showTransferModal && (
        <TransferModal 
          crypto={crypto} 
          onClose={() => setShowTransferModal(false)} 
        />
      )}
    </div>
  );
};

export default CryptoDetail;