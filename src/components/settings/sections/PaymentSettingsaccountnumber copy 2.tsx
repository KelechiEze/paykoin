import React, { useState, useEffect } from 'react';
import { CreditCard, Trash, Edit, Plus, Eye, EyeOff, Copy, Check, Download, Building, Phone, MapPin, CheckCircle, Sparkles, Coins, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { auth, db } from '@/firebase';
import { doc, collection, onSnapshot, setDoc, deleteDoc, updateDoc, addDoc, getDoc, query, where, getDocs } from 'firebase/firestore';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

// Payment method type definition
type PaymentMethod = {
  id: string;
  type: string;
  last4: string;
  fullNumber: string;
  expiry: string;
  cardHolder: string;
  isPrimary: boolean;
  createdAt: Date;
  cvv: string;
  accountNumber: string;
  accountType: string;
  bankName: string;
  routingNumber: string;
  // New fields
  billingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  phoneNumber: string;
};

type WithdrawalRequest = {
  id: string;
  userId: string;
  paymentMethodId: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: Date;
  processedAt?: Date;
  adminNotes?: string;
};

export const PaymentSettings: React.FC = () => {
  const { toast } = useToast();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [methodToDelete, setMethodToDelete] = useState<PaymentMethod | null>(null);
  const [currentMethod, setCurrentMethod] = useState<PaymentMethod | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showFullNumbers, setShowFullNumbers] = useState<{[key: string]: boolean}>({});
  const [showCVV, setShowCVV] = useState<{[key: string]: boolean}>({});
  const [showAccountNumber, setShowAccountNumber] = useState<{[key: string]: boolean}>({});
  const [showRoutingNumber, setShowRoutingNumber] = useState<{[key: string]: boolean}>({});
  const [copiedField, setCopiedField] = useState<{methodId: string, field: string} | null>(null);
  const [userBalance, setUserBalance] = useState(0);
  const [lastWithdrawalAmount, setLastWithdrawalAmount] = useState(0);
  
  // Form state
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardType, setCardType] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountType, setAccountType] = useState('checking');
  const [bankName, setBankName] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  
  // Billing address state
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('');
  
  // Withdrawal state
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [isProcessingWithdrawal, setIsProcessingWithdrawal] = useState(false);

  // Account types
  const accountTypes = [
    { value: 'checking', label: 'Checking Account' },
    { value: 'savings', label: 'Savings Account' },
    { value: 'business', label: 'Business Account' },
    { value: 'corporate', label: 'Corporate Account' }
  ];

  // Get current user and load payment methods
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user?.uid);
      setCurrentUser(user);
      if (user) {
        loadPaymentMethods(user.uid);
        loadUserBalance(user.uid);
      } else {
        setPaymentMethods([]);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Add real-time balance listener
  useEffect(() => {
    if (!currentUser) return;

    console.log('Setting up real-time balance listener for user:', currentUser.uid);
    
    const balanceRef = doc(db, 'users', currentUser.uid, 'dashboard', 'stats');
    
    const unsubscribe = onSnapshot(balanceRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        console.log('Real-time balance update:', data);
        
        const totalBalance = data.totalBalance || data.balance || data.availableBalance || data.currentBalance || 0;
        setUserBalance(Number(totalBalance));
        console.log('Real-time balance updated:', totalBalance);
      }
    }, (error) => {
      console.error('Error in real-time balance listener:', error);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const loadUserBalance = async (userId: string) => {
    try {
      console.log('Loading balance for user:', userId);
      
      // Try multiple possible locations for user balance
      const dashboardRef = doc(db, 'users', userId, 'dashboard', 'stats');
      const dashboardSnap = await getDoc(dashboardRef);
      
      if (dashboardSnap.exists()) {
        const data = dashboardSnap.data();
        console.log('Dashboard stats data:', data);
        
        // Check for totalBalance first (from your Dashboard component)
        const totalBalance = data.totalBalance || data.balance || data.availableBalance || data.currentBalance || 0;
        setUserBalance(Number(totalBalance));
        console.log('User balance loaded from dashboard/stats:', totalBalance);
        return;
      }
      
      // If not in dashboard/stats, try user document directly
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        console.log('User document data:', userData);
        
        const totalBalance = userData.totalBalance || userData.balance || userData.availableBalance || userData.currentBalance || 0;
        setUserBalance(Number(totalBalance));
        console.log('User balance loaded from user doc:', totalBalance);
        return;
      }
      
      // Default to 0 if no balance found
      console.log('No balance found in any location, defaulting to 0');
      setUserBalance(0);
      
    } catch (error) {
      console.error('Error loading user balance:', error);
      setUserBalance(0);
    }
  };

  // Load payment methods from Firestore
  const loadPaymentMethods = (userId: string) => {
    try {
      console.log('Loading payment methods for user:', userId);
      setIsLoading(true);
      
      const paymentMethodsRef = collection(db, 'users', userId, 'paymentMethods');
      
      const unsubscribe = onSnapshot(
        paymentMethodsRef, 
        (snapshot) => {
          console.log('Payment methods snapshot received:', snapshot.size, 'methods');
          const methods: PaymentMethod[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            console.log('Payment method data:', data);
            methods.push({
              id: doc.id,
              type: data.type || 'unknown',
              last4: data.last4 || '',
              fullNumber: data.fullNumber || '',
              expiry: data.expiry || '',
              cardHolder: data.cardHolder || '',
              isPrimary: data.isPrimary || false,
              createdAt: data.createdAt?.toDate() || new Date(),
              cvv: data.cvv || '',
              accountNumber: data.accountNumber || '',
              accountType: data.accountType || 'checking',
              bankName: data.bankName || '',
              routingNumber: data.routingNumber || '',
              billingAddress: data.billingAddress || {
                street: '',
                city: '',
                state: '',
                zipCode: '',
                country: ''
              },
              phoneNumber: data.phoneNumber || ''
            });
          });
          
          methods.sort((a, b) => {
            if (a.isPrimary && !b.isPrimary) return -1;
            if (!a.isPrimary && b.isPrimary) return 1;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });
          
          setPaymentMethods(methods);
          setIsLoading(false);
          console.log('Payment methods loaded successfully. Count:', methods.length);
          console.log('Payment methods array:', methods);
        }, 
        (error) => {
          console.error('Error in payment methods listener:', error);
          toast({
            title: 'Database Error',
            description: `Failed to load payment methods: ${error.message}`,
            variant: 'destructive',
          });
          setIsLoading(false);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('Error loading payment methods:', error);
      toast({
        title: 'Error',
        description: 'Failed to load payment methods',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setCardHolder('');
    setCardNumber('');
    setExpiryMonth('');
    setExpiryYear('');
    setCvv('');
    setCardType('');
    setPhoneNumber('');
    setAccountNumber('');
    setAccountType('checking');
    setBankName('');
    setRoutingNumber('');
    setStreet('');
    setCity('');
    setState('');
    setZipCode('');
    setCountry('');
    setCurrentMethod(null);
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (method: PaymentMethod) => {
    setCurrentMethod(method);
    setCardHolder(method.cardHolder);
    setCardType(method.type);
    setCardNumber(method.fullNumber);
    const [expMonth, expYear] = method.expiry.split('/');
    setExpiryMonth(expMonth);
    setExpiryYear(`20${expYear}`);
    setCvv(method.cvv);
    setPhoneNumber(method.phoneNumber);
    setAccountNumber(method.accountNumber);
    setAccountType(method.accountType);
    setBankName(method.bankName);
    setRoutingNumber(method.routingNumber);
    
    // Set billing address
    if (method.billingAddress) {
      setStreet(method.billingAddress.street);
      setCity(method.billingAddress.city);
      setState(method.billingAddress.state);
      setZipCode(method.billingAddress.zipCode);
      setCountry(method.billingAddress.country);
    }
    
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (method: PaymentMethod) => {
    setMethodToDelete(method);
    setIsDeleteDialogOpen(true);
  };

  const openWithdrawDialog = () => {
    if (paymentMethods.length === 0) {
      toast({
        title: 'No Payment Methods',
        description: 'Please add a payment method before making a withdrawal.',
        variant: 'destructive',
      });
      return;
    }
    
    setWithdrawalAmount('');
    setSelectedPaymentMethod(paymentMethods.find(m => m.isPrimary)?.id || paymentMethods[0]?.id || '');
    setIsWithdrawDialogOpen(true);
  };

  const toggleShowFullNumber = (methodId: string) => {
    setShowFullNumbers(prev => ({
      ...prev,
      [methodId]: !prev[methodId]
    }));
  };

  const toggleShowCVV = (methodId: string) => {
    setShowCVV(prev => ({
      ...prev,
      [methodId]: !prev[methodId]
    }));
  };

  const toggleShowAccountNumber = (methodId: string) => {
    setShowAccountNumber(prev => ({
      ...prev,
      [methodId]: !prev[methodId]
    }));
  };

  const toggleShowRoutingNumber = (methodId: string) => {
    setShowRoutingNumber(prev => ({
      ...prev,
      [methodId]: !prev[methodId]
    }));
  };

  const copyToClipboard = async (text: string, methodId: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField({ methodId, field });
      toast({
        title: 'Copied!',
        description: `${field} copied to clipboard`,
      });
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      toast({
        title: 'Copy Failed',
        description: 'Failed to copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  const savePaymentMethodToFirestore = async (method: PaymentMethod, userId: string) => {
    try {
      console.log('Saving payment method to Firestore:', method);
      const methodRef = doc(db, 'users', userId, 'paymentMethods', method.id);
      
      const methodData = {
        type: method.type,
        last4: method.last4,
        fullNumber: method.fullNumber,
        expiry: method.expiry,
        cardHolder: method.cardHolder,
        isPrimary: method.isPrimary,
        cvv: method.cvv,
        accountNumber: method.accountNumber,
        accountType: method.accountType,
        bankName: method.bankName,
        routingNumber: method.routingNumber,
        billingAddress: method.billingAddress,
        phoneNumber: method.phoneNumber,
        createdAt: new Date(),
      };
      
      console.log('Method data to save:', methodData);
      await setDoc(methodRef, methodData);
      console.log('Payment method saved successfully');
      return true;
    } catch (error: any) {
      console.error('Error saving payment method to Firestore:', error);
      throw new Error(`Database error: ${error.message}`);
    }
  };

  const handleAddPaymentMethod = async () => {
    if (!currentUser) {
      toast({
        title: 'Authentication Error',
        description: 'You must be logged in to add payment methods',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('Starting to add payment method...');
      
      // Validate inputs
      if (!cardHolder.trim()) {
        throw new Error('Please enter cardholder name');
      }
      
      const cleanCardNumber = cardNumber.replace(/\s/g, '');
      if (cleanCardNumber.length < 16) {
        throw new Error('Please enter a valid 16-digit card number');
      }
      
      if (!expiryMonth || !expiryYear) {
        throw new Error('Please enter expiry date');
      }
      
      if (!cvv) {
        throw new Error('Please enter CVV');
      }

      if (!cardType.trim()) {
        throw new Error('Please enter card type');
      }

      if (!phoneNumber.trim()) {
        throw new Error('Please enter phone number');
      }

      // Validate account number if provided
      if (accountNumber && accountNumber.length < 8) {
        throw new Error('Please enter a valid account number (minimum 8 digits)');
      }

      // Validate routing number if provided
      if (routingNumber && routingNumber.length !== 9) {
        throw new Error('Please enter a valid 9-digit routing number');
      }

      // Validate billing address
      if (!street.trim() || !city.trim() || !state.trim() || !zipCode.trim() || !country.trim()) {
        throw new Error('Please complete all billing address fields');
      }

      // Validate expiry date
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      const inputYear = parseInt(expiryYear);
      const inputMonth = parseInt(expiryMonth);

      if (inputYear < currentYear || (inputYear === currentYear && inputMonth < currentMonth)) {
        throw new Error('Card has expired');
      }

      if (inputMonth < 1 || inputMonth > 12) {
        throw new Error('Please enter a valid month (1-12)');
      }

      // Auto-detect card type if not manually entered
      let detectedType = cardType.trim();
      if (!detectedType) {
        detectedType = detectCardType(cleanCardNumber);
      }

      const methodId = currentMethod?.id || `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const newMethod: PaymentMethod = {
        id: methodId,
        type: detectedType || 'unknown',
        last4: cleanCardNumber.slice(-4),
        fullNumber: cleanCardNumber,
        expiry: `${expiryMonth.padStart(2, '0')}/${expiryYear.slice(-2)}`,
        cardHolder: cardHolder.trim(),
        isPrimary: paymentMethods.length === 0,
        createdAt: new Date(),
        cvv: cvv,
        accountNumber: accountNumber,
        accountType: accountType,
        bankName: bankName.trim(),
        routingNumber: routingNumber,
        billingAddress: {
          street: street.trim(),
          city: city.trim(),
          state: state.trim(),
          zipCode: zipCode.trim(),
          country: country.trim()
        },
        phoneNumber: phoneNumber.trim()
      };

      console.log('New payment method created:', newMethod);

      // If this is being set as primary, update all other methods to not primary
      if (newMethod.isPrimary && paymentMethods.length > 0) {
        console.log('Updating other methods to not primary...');
        const updatePromises = paymentMethods.map(async (method) => {
          const methodRef = doc(db, 'users', currentUser.uid, 'paymentMethods', method.id);
          await updateDoc(methodRef, {
            isPrimary: false
          });
        });
        await Promise.all(updatePromises);
        console.log('All other methods updated to not primary');
      }

      // Save the new/updated method
      console.log('Saving payment method to database...');
      await savePaymentMethodToFirestore(newMethod, currentUser.uid);
      
      toast({
        title: currentMethod ? 'Payment Method Updated' : 'Payment Method Added',
        description: `Your ${detectedType.toUpperCase()} card ending in ${newMethod.last4} was ${
          currentMethod ? 'updated' : 'added'
        } successfully`,
      });
      
      setIsDialogOpen(false);
      resetForm();
      console.log('Payment method process completed successfully');
    } catch (error: any) {
      console.error('Error in handleAddPaymentMethod:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save payment method to database',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveCard = async () => {
    if (!methodToDelete || !currentUser) return;
    
    try {
      console.log('Removing payment method:', methodToDelete.id);
      const methodRef = doc(db, 'users', currentUser.uid, 'paymentMethods', methodToDelete.id);
      
      // Check if it's primary and there are other methods
      if (methodToDelete.isPrimary && paymentMethods.length > 1) {
        console.log('Finding new primary method...');
        const otherMethod = paymentMethods.find(m => m.id !== methodToDelete.id);
        if (otherMethod) {
          await updateDoc(doc(db, 'users', currentUser.uid, 'paymentMethods', otherMethod.id), {
            isPrimary: true
          });
          console.log('New primary method set:', otherMethod.id);
        }
      }
      
      await deleteDoc(methodRef);
      console.log('Payment method deleted successfully');
      
      toast({
        title: 'Payment Method Removed',
        description: `Your card ending in ${methodToDelete.last4} has been removed`,
      });
      
    } catch (error: any) {
      console.error('Error removing payment method:', error);
      toast({
        title: 'Error',
        description: `Failed to remove payment method: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setMethodToDelete(null);
    }
  };

  const handleSetPrimary = async (id: string) => {
    if (!currentUser) return;
    
    try {
      console.log('Setting primary method:', id);
      const updatePromises = paymentMethods.map(async (method) => {
        const methodRef = doc(db, 'users', currentUser.uid, 'paymentMethods', method.id);
        await updateDoc(methodRef, {
          isPrimary: method.id === id
        });
      });

      await Promise.all(updatePromises);
      console.log('Primary method updated successfully');
      
      const primaryMethod = paymentMethods.find(m => m.id === id);
      if (primaryMethod) {
        toast({
          title: 'Primary Payment Method Updated',
          description: `Your ${primaryMethod.type.toUpperCase()} card ending in ${primaryMethod.last4} is now primary`,
        });
      }
    } catch (error: any) {
      console.error('Error setting primary payment method:', error);
      toast({
        title: 'Error',
        description: `Failed to update primary payment method: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  const handleWithdraw = async () => {
    if (!currentUser || !selectedPaymentMethod || !withdrawalAmount) return;
    
    setIsProcessingWithdrawal(true);
    
    try {
      const amount = parseFloat(withdrawalAmount);
      
      // Validate amount
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid withdrawal amount');
      }
      
      if (amount < 500) {
        throw new Error('Minimum withdrawal amount is $500');
      }
      
      if (amount > userBalance) {
        throw new Error('Insufficient balance for this withdrawal');
      }
      
      // Create withdrawal request
      const withdrawalRequest: WithdrawalRequest = {
        id: `withdrawal_${Date.now()}`,
        userId: currentUser.uid,
        paymentMethodId: selectedPaymentMethod,
        amount: amount,
        status: 'pending',
        createdAt: new Date()
      };
      
      // Save to Firestore
      const withdrawalRef = collection(db, 'users', currentUser.uid, 'withdrawalRequests');
      await addDoc(withdrawalRef, withdrawalRequest);
      
      setLastWithdrawalAmount(amount);
      setIsWithdrawDialogOpen(false);
      setIsSuccessDialogOpen(true);
      setWithdrawalAmount('');
      
    } catch (error: any) {
      console.error('Error processing withdrawal:', error);
      toast({
        title: 'Withdrawal Failed',
        description: error.message || 'Failed to process withdrawal request',
        variant: 'destructive',
      });
    } finally {
      setIsProcessingWithdrawal(false);
    }
  };

  // Detect card type based on card number patterns
  const detectCardType = (number: string): string => {
    const cleaned = number.replace(/\D/g, '');

    if (/^4/.test(cleaned)) {
      return 'visa';
    }
    else if (/^(5[1-5]|2[2-7][0-9]{2})/.test(cleaned)) {
      return 'mastercard';
    }
    else if (/^3[47]/.test(cleaned)) {
      return 'amex';
    }
    else if (/^(6011|65|64[4-9])/.test(cleaned)) {
      return 'discover';
    }
    
    return 'unknown';
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 19);
    let formattedValue = value;
    
    if (value.length > 4) {
      formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
    }
    
    setCardNumber(formattedValue);
    
    if (value.length >= 2 && !cardType) {
      const detectedType = detectCardType(value);
      if (!cardType.trim()) {
        setCardType(detectedType);
      }
    }
  };

  const handleAccountNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 17);
    setAccountNumber(value);
  };

  const handleRoutingNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 9);
    setRoutingNumber(value);
  };

  // Check if withdrawal button should be enabled
  const isWithdrawalEnabled = () => {
    if (!withdrawalAmount || !selectedPaymentMethod) return false;
    
    const amount = parseFloat(withdrawalAmount);
    return !isNaN(amount) && amount >= 1000 && amount <= userBalance;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Payment Methods</h2>
          <Button disabled className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600">
            <Plus size={16} />
            Add Payment Method
          </Button>
        </div>
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl bg-gradient-to-br from-gray-50 to-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500 text-lg">Loading your payment methods...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Withdraw Button - Mobile Responsive */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6 mb-6">
        <div className="flex-1">
          <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Payment Methods
          </h2>
          <div className="flex items-center gap-3 mt-3">
            <div className="p-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600">
              <Coins className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Available Balance</p>
              <p className="text-xl lg:text-2xl font-bold text-green-600">
                ${userBalance.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {userBalance < 1000 ? `$${1000 - userBalance} more to withdraw` : 'Ready to withdraw'}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <Button 
            onClick={openWithdrawDialog}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 px-4 py-2.5 rounded-xl text-sm lg:text-base w-full sm:w-auto"
            disabled={paymentMethods.length === 0 || userBalance < 500}
          >
            <Download size={18} />
            Withdraw Funds
            {paymentMethods.length === 0 && (
              <span className="text-xs ml-1 hidden sm:inline">(Add payment method)</span>
            )}
            {paymentMethods.length > 0 && userBalance < 500 && (
              <span className="text-xs ml-1 hidden sm:inline">(Min. $500)</span>
            )}
          </Button>
          <Button 
            onClick={openAddDialog} 
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 px-4 py-2.5 rounded-xl text-sm lg:text-base w-full sm:w-auto"
          >
            <Plus size={18} />
            Add Payment Method
          </Button>
        </div>
      </div>

      {paymentMethods.length > 0 ? (
        <div className="grid gap-6">
          {paymentMethods.map(method => (
            <div 
              key={method.id} 
              className={`p-4 lg:p-6 rounded-2xl border-2 transition-all duration-300 hover:shadow-xl ${
                method.isPrimary 
                  ? 'border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg' 
                  : 'border-gray-200 bg-gradient-to-br from-white to-gray-50 hover:border-gray-300'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                <div className="flex items-start gap-4 w-full">
                  <div className={`p-3 rounded-xl flex-shrink-0 ${
                    method.isPrimary 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                      : 'bg-gradient-to-r from-gray-600 to-gray-700 text-white'
                  }`}>
                    <CreditCard size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4">
                      <h4 className="font-bold text-lg lg:text-xl text-gray-800 truncate">
                        {method.type.toUpperCase()} •••• {method.last4}
                      </h4>
                      {method.isPrimary && (
                        <span className="px-2 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-medium rounded-full shadow-md w-fit">
                          Primary
                        </span>
                      )}
                    </div>
                    
                    {/* Card Details Grid - Mobile Responsive */}
                    <div className="grid grid-cols-1 gap-4 mb-4">
                      {/* Full Card Number */}
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700">Card Number</Label>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono bg-gray-100 px-3 py-2 rounded-lg border flex-1 min-w-0 overflow-x-auto">
                            {showFullNumbers[method.id] 
                              ? method.fullNumber.replace(/(.{4})/g, '$1 ').trim()
                              : `•••• •••• •••• ${method.last4}`
                            }
                          </span>
                          <div className="flex gap-1 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-gray-200 transition-colors"
                              onClick={() => toggleShowFullNumber(method.id)}
                            >
                              {showFullNumbers[method.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-gray-200 transition-colors"
                              onClick={() => copyToClipboard(method.fullNumber, method.id, 'Card Number')}
                            >
                              {copiedField?.methodId === method.id && copiedField?.field === 'Card Number' 
                                ? <Check size={16} className="text-green-600" /> 
                                : <Copy size={16} />
                              }
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* CVV */}
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700">CVV</Label>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono bg-gray-100 px-3 py-2 rounded-lg border">
                            {showCVV[method.id] ? method.cvv : '•••'}
                          </span>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-gray-200 transition-colors"
                              onClick={() => toggleShowCVV(method.id)}
                            >
                              {showCVV[method.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-gray-200 transition-colors"
                              onClick={() => copyToClipboard(method.cvv, method.id, 'CVV')}
                            >
                              {copiedField?.methodId === method.id && copiedField?.field === 'CVV' 
                                ? <Check size={16} className="text-green-600" /> 
                                : <Copy size={16} />
                              }
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Account Number */}
                      {method.accountNumber && (
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-gray-700">Account Number</Label>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-mono bg-gray-100 px-3 py-2 rounded-lg border flex-1 min-w-0 overflow-x-auto">
                              {showAccountNumber[method.id] 
                                ? method.accountNumber
                                : `••••${method.accountNumber.slice(-4)}`
                              }
                            </span>
                            <div className="flex gap-1 flex-shrink-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-gray-200 transition-colors"
                                onClick={() => toggleShowAccountNumber(method.id)}
                              >
                                {showAccountNumber[method.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-gray-200 transition-colors"
                                onClick={() => copyToClipboard(method.accountNumber, method.id, 'Account Number')}
                              >
                                {copiedField?.methodId === method.id && copiedField?.field === 'Account Number' 
                                  ? <Check size={16} className="text-green-600" /> 
                                  : <Copy size={16} />
                                }
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Routing Number */}
                      {method.routingNumber && (
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-gray-700">Routing Number</Label>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-mono bg-gray-100 px-3 py-2 rounded-lg border flex-1 min-w-0 overflow-x-auto">
                              {showRoutingNumber[method.id] 
                                ? method.routingNumber
                                : `••••${method.routingNumber.slice(-4)}`
                              }
                            </span>
                            <div className="flex gap-1 flex-shrink-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-gray-200 transition-colors"
                                onClick={() => toggleShowRoutingNumber(method.id)}
                              >
                                {showRoutingNumber[method.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-gray-200 transition-colors"
                                onClick={() => copyToClipboard(method.routingNumber, method.id, 'Routing Number')}
                              >
                                {copiedField?.methodId === method.id && copiedField?.field === 'Routing Number' 
                                  ? <Check size={16} className="text-green-600" /> 
                                  : <Copy size={16} />
                                }
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bank Information */}
                    {(method.bankName || method.accountType) && (
                      <div className="grid grid-cols-1 gap-4 mb-4">
                        {method.bankName && (
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-700">Bank Name</Label>
                            <span className="text-sm bg-gray-100 px-3 py-2 rounded-lg border block">
                              {method.bankName}
                            </span>
                          </div>
                        )}
                        {method.accountType && (
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-700">Account Type</Label>
                            <span className="text-sm bg-gray-100 px-3 py-2 rounded-lg border block capitalize">
                              {method.accountType}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Phone Number & Expiry - Mobile Stacked */}
                    <div className="grid grid-cols-1 gap-4 mb-4">
                      {method.phoneNumber && (
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <Phone size={16} />
                            Phone Number
                          </Label>
                          <div className="flex items-center gap-2">
                            <span className="text-sm bg-gray-100 px-3 py-2 rounded-lg border flex-1">
                              {method.phoneNumber}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-gray-200 transition-colors flex-shrink-0"
                              onClick={() => copyToClipboard(method.phoneNumber, method.id, 'Phone Number')}
                            >
                              {copiedField?.methodId === method.id && copiedField?.field === 'Phone Number' 
                                ? <Check size={16} className="text-green-600" /> 
                                : <Copy size={16} />
                              }
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700">Expiry Date</Label>
                        <span className="text-sm bg-gray-100 px-3 py-2 rounded-lg border block w-fit">
                          {method.expiry}
                        </span>
                      </div>
                    </div>

                    {/* Billing Address */}
                    {method.billingAddress && method.billingAddress.street && (
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <MapPin size={16} />
                          Billing Address
                        </Label>
                        <p className="text-sm bg-gray-100 px-3 py-2 rounded-lg border break-words">
                          {method.billingAddress.street}, {method.billingAddress.city}, {method.billingAddress.state} {method.billingAddress.zipCode}, {method.billingAddress.country}
                        </p>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600 break-words">
                        Cardholder: <span className="font-semibold text-gray-800">{method.cardHolder}</span>
                      </p>
                      <p className="text-xs text-gray-500">
                        Added {method.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons - Mobile Responsive */}
                <div className="flex flex-col sm:flex-row lg:flex-col gap-2 w-full sm:w-auto lg:w-auto">
                  {!method.isPrimary && (
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetPrimary(method.id)}
                      className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors w-full sm:w-auto"
                    >
                      Set Primary
                    </Button>
                  )}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => openEditDialog(method)}
                      className="border-gray-200 hover:bg-gray-100 transition-colors flex-1 sm:flex-none"
                    >
                      <Edit size={18} />
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="icon"
                      onClick={() => openDeleteDialog(method)}
                      className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 border-0 transition-colors flex-1 sm:flex-none"
                    >
                      <Trash size={18} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 lg:py-16 border-2 border-dashed border-gray-200 rounded-2xl bg-gradient-to-br from-gray-50 to-white">
          <CreditCard size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="font-bold text-xl lg:text-2xl text-gray-700 mb-2">No Payment Methods</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto text-base lg:text-lg px-4">
            You haven't added any payment methods yet. Add a payment method to enable withdrawals from your portfolio.
          </p>
          <Button 
            onClick={openAddDialog}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl text-base lg:text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <Plus size={20} className="mr-2" />
            Add Your First Payment Method
          </Button>
        </div>
      )}
      
      {/* Withdrawal Information */}
      <div className="p-4 lg:p-6 rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg">
        <h3 className="font-bold text-lg lg:text-xl text-gray-800 mb-4">Withdrawal Information</h3>
        <p className="text-gray-600 mb-4 text-base lg:text-lg">
          You can withdraw funds to any of your verified payment methods when your balance reaches the minimum threshold.
        </p>
        <ul className="text-gray-600 space-y-2 text-base lg:text-lg">
          <li className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
            <span>Minimum withdrawal amount: <span className="font-semibold text-gray-800">$500</span></span>
          </li>
          <li className="flex items-center gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
            <span>Processing time: <span className="font-semibold text-gray-800">10-15 Minutes</span></span>
          </li>
          <li className="flex items-center gap-3">
            <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
            <span>Withdrawal fees: <span className="font-semibold text-gray-800">0.5% (capped at $1)</span></span>
          </li>
        </ul>
      </div>
      
      {/* Add/Edit Payment Method Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl w-[95vw]">
          <DialogHeader>
            <DialogTitle className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {currentMethod ? 'Edit Payment Method' : 'Add Payment Method'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Personal Information */}
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cardHolder" className="font-semibold">Cardholder Name *</Label>
                <Input
                  id="cardHolder"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  placeholder="John Doe"
                  className="rounded-lg border-2 focus:border-blue-500 transition-colors"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="font-semibold">Phone Number *</Label>
                <Input
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="rounded-lg border-2 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
            
            {/* Card Information */}
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cardType" className="font-semibold">Card Type *</Label>
                <Input
                  id="cardType"
                  value={cardType}
                  onChange={(e) => setCardType(e.target.value)}
                  placeholder="Visa, Mastercard, etc."
                  className="rounded-lg border-2 focus:border-blue-500 transition-colors"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cardNumber" className="font-semibold">Card Number *</Label>
                <Input
                  id="cardNumber"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  placeholder="4242 4242 4242 4242"
                  className="rounded-lg border-2 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="font-semibold">Expiry Month *</Label>
                <Input
                  value={expiryMonth}
                  onChange={(e) => setExpiryMonth(e.target.value.replace(/\D/g, '').slice(0, 2))}
                  placeholder="MM"
                  className="rounded-lg border-2 focus:border-blue-500 transition-colors"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="font-semibold">Expiry Year *</Label>
                <Input
                  value={expiryYear}
                  onChange={(e) => setExpiryYear(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="YYYY"
                  className="rounded-lg border-2 focus:border-blue-500 transition-colors"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cvv" className="font-semibold">CVV *</Label>
                <Input
                  id="cvv"
                  type="text"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="123"
                  className="rounded-lg border-2 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Bank Account Information */}
            <div className="border-t pt-6">
              <h4 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-3">
                <User size={20} className="text-green-600" />
                Bank Account Information (Optional)
              </h4>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bankName" className="font-semibold">Bank Name</Label>
                    <Input
                      id="bankName"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="Bank of America, Chase, etc."
                      className="rounded-lg border-2 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="accountType" className="font-semibold">Account Type</Label>
                    <Select value={accountType} onValueChange={setAccountType}>
                      <SelectTrigger className="rounded-lg border-2 focus:border-blue-500 transition-colors">
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent className="rounded-lg">
                        {accountTypes.map(type => (
                          <SelectItem key={type.value} value={type.value} className="capitalize">
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="accountNumber" className="font-semibold">Account Number</Label>
                    <Input
                      id="accountNumber"
                      value={accountNumber}
                      onChange={handleAccountNumberChange}
                      placeholder="000123456789"
                      className="rounded-lg border-2 focus:border-blue-500 transition-colors"
                    />
                    <p className="text-xs text-gray-500">8-17 digits</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="routingNumber" className="font-semibold">Routing Number</Label>
                    <Input
                      id="routingNumber"
                      value={routingNumber}
                      onChange={handleRoutingNumberChange}
                      placeholder="123456789"
                      className="rounded-lg border-2 focus:border-blue-500 transition-colors"
                    />
                    <p className="text-xs text-gray-500">9 digits</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Billing Address Section */}
            <div className="border-t pt-6">
              <h4 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-3">
                <Building size={20} className="text-blue-600" />
                Billing Address *
              </h4>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="street" className="font-semibold">Street Address</Label>
                  <Input
                    id="street"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="123 Main St"
                    className="rounded-lg border-2 focus:border-blue-500 transition-colors"
                  />
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="font-semibold">City</Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="New York"
                      className="rounded-lg border-2 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="state" className="font-semibold">State/Province</Label>
                    <Input
                      id="state"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="NY"
                      className="rounded-lg border-2 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="zipCode" className="font-semibold">ZIP/Postal Code</Label>
                    <Input
                      id="zipCode"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      placeholder="10001"
                      className="rounded-lg border-2 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="country" className="font-semibold">Country</Label>
                    <Input
                      id="country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="United States"
                      className="rounded-lg border-2 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="gap-3 flex-col sm:flex-row">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsDialogOpen(false);
                resetForm();
              }}
              disabled={isSubmitting}
              className="rounded-lg border-2 px-6 py-2 w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddPaymentMethod}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {currentMethod ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                currentMethod ? 'Update Payment Method' : 'Add Payment Method'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Withdrawal Dialog */}
      <Dialog open={isWithdrawDialogOpen} onOpenChange={setIsWithdrawDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl w-[95vw]">
          <DialogHeader>
            <DialogTitle className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Withdraw Funds
            </DialogTitle>
            <DialogDescription className="text-base lg:text-lg">
              Request a withdrawal to your selected payment method
            </DialogDescription>
            <DialogDescription className="text-base lg:text-lg">
              N.B: A deposit must be made into your wallet before withdrawal can be processed
              Chat with the customer care service for Guidance
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <Label htmlFor="withdrawalAmount" className="font-semibold text-base lg:text-lg">Amount to Withdraw *</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-base lg:text-lg">$</span>
                <Input
                  id="withdrawalAmount"
                  type="number"
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(e.target.value)}
                  placeholder="1000.00"
                  className="pl-10 text-base lg:text-lg py-3 rounded-xl border-2 focus:border-green-500 transition-colors"
                  min="1000"
                  max={userBalance}
                />
              </div>
              <p className="text-sm text-gray-500">
                Available: <span className="font-semibold text-green-600">${userBalance.toLocaleString()}</span> • Minimum: <span className="font-semibold">$500</span>
              </p>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="paymentMethod" className="font-semibold text-base lg:text-lg">Payment Method *</Label>
              <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                <SelectTrigger className="rounded-xl border-2 py-3 text-base lg:text-lg">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {paymentMethods.map(method => (
                    <SelectItem key={method.id} value={method.id} className="text-base lg:text-lg py-3">
                      {method.type.toUpperCase()} •••• {method.last4} {method.isPrimary && '(Primary)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedPaymentMethod && withdrawalAmount && parseFloat(withdrawalAmount) >= 1000 && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
                <h4 className="font-bold text-lg mb-3 text-gray-800">Withdrawal Summary</h4>
                <div className="space-y-2 text-base lg:text-lg">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-semibold">${parseFloat(withdrawalAmount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fee (1.5%):</span>
                    <span className="font-semibold">${(parseFloat(withdrawalAmount) * 0.015).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2 text-green-600">
                    <span>You'll receive:</span>
                    <span>${(parseFloat(withdrawalAmount) * 0.985).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter className="flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsWithdrawDialogOpen(false)}
              disabled={isProcessingWithdrawal}
              className="rounded-lg border-2 px-6 py-2 text-base lg:text-lg w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleWithdraw}
              disabled={!isWithdrawalEnabled() || isProcessingWithdrawal}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-2 text-base lg:text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
            >
              {isProcessingWithdrawal ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                'Request Withdrawal'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl border-0 bg-gradient-to-br from-green-50 to-emerald-100 w-[95vw]">
          <div className="text-center p-6 lg:p-8">
            <div className="relative inline-block mb-6">
              <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl">
                <CheckCircle className="w-10 h-10 lg:w-12 lg:h-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2">
                <Sparkles className="w-6 h-6 lg:w-8 lg:h-8 text-yellow-500 animate-pulse" />
              </div>
            </div>
            
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-4">
              Withdrawal Successful!
            </h2>
            
            <p className="text-base lg:text-lg text-gray-600 mb-2">
              Your withdrawal request has been submitted
            </p>
            
            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-lg mb-6 border-2 border-green-200">
              <div className="text-3xl lg:text-4xl font-bold text-green-600 mb-2">
                ${lastWithdrawalAmount.toLocaleString()}
              </div>
              <p className="text-gray-600 text-sm lg:text-base">will be processed within 1-2 business days</p>
            </div>
            
            <p className="text-sm text-gray-500 mb-6">
              You'll receive a confirmation email once your funds are on the way
            </p>
            
            <Button
              onClick={() => setIsSuccessDialogOpen(false)}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 lg:px-8 py-3 rounded-xl text-base lg:text-lg shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
            >
              Awesome, Thanks!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl w-[95vw]">
          <DialogHeader>
            <DialogTitle className="text-xl lg:text-2xl font-bold text-red-600">Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4 lg:py-6">
            {methodToDelete && (
              <>
                <p className="text-gray-700 text-base lg:text-lg mb-4">
                  Are you sure you want to remove your <span className="font-bold">{methodToDelete.type.toUpperCase()}</span> card 
                  ending in <span className="font-bold">{methodToDelete.last4}</span>?
                </p>
                <p className="text-gray-500 text-base lg:text-lg">
                  This action cannot be undone. You'll need to re-add this card if you want to use it again.
                </p>
              </>
            )}
          </div>
          <DialogFooter className="gap-3 flex-col sm:flex-row">
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              className="rounded-lg border-2 px-6 py-2 text-base lg:text-lg w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleRemoveCard}
              className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-6 py-2 text-base lg:text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
            >
              Delete Payment Method
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};