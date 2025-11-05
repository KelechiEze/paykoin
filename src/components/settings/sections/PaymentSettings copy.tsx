import React, { useState, useEffect } from 'react';
import { CreditCard, Trash, Edit, Plus, Eye, EyeOff, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { auth, db } from '@/firebase';
import { doc, collection, onSnapshot, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';

// Payment method type definition
type PaymentMethod = {
  id: string;
  type: string;
  last4: string;
  fullNumber: string; // Store full card number
  expiry: string;
  cardHolder: string;
  isPrimary: boolean;
  createdAt: Date;
  cvv: string; // Store CVV for testing
};

export const PaymentSettings: React.FC = () => {
  const { toast } = useToast();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [methodToDelete, setMethodToDelete] = useState<PaymentMethod | null>(null);
  const [currentMethod, setCurrentMethod] = useState<PaymentMethod | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showFullNumbers, setShowFullNumbers] = useState<{[key: string]: boolean}>({});
  const [showCVV, setShowCVV] = useState<{[key: string]: boolean}>({});
  const [copiedField, setCopiedField] = useState<{methodId: string, field: string} | null>(null);
  
  // Form state
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardType, setCardType] = useState('');

  // Get current user and load payment methods
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user?.uid);
      setCurrentUser(user);
      if (user) {
        loadPaymentMethods(user.uid);
      } else {
        setPaymentMethods([]);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Load payment methods from Firestore
  const loadPaymentMethods = (userId: string) => {
    try {
      console.log('Loading payment methods for user:', userId);
      setIsLoading(true);
      
      const paymentMethodsRef = collection(db, 'users', userId, 'paymentMethods');
      
      // Real-time listener for payment methods
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
              fullNumber: data.fullNumber || '', // Load full number
              expiry: data.expiry || '',
              cardHolder: data.cardHolder || '',
              isPrimary: data.isPrimary || false,
              createdAt: data.createdAt?.toDate() || new Date(),
              cvv: data.cvv || '', // Load CVV
            });
          });
          
          // Sort by primary first, then by creation date
          methods.sort((a, b) => {
            if (a.isPrimary && !b.isPrimary) return -1;
            if (!a.isPrimary && b.isPrimary) return 1;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });
          
          setPaymentMethods(methods);
          setIsLoading(false);
          console.log('Payment methods loaded successfully:', methods.length);
        }, 
        (error) => {
          console.error('Error in payment methods listener:', error);
          console.error('Error code:', error.code);
          console.error('Error message:', error.message);
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
    setCardNumber(method.fullNumber); // Pre-fill full card number
    // Split the expiry string: "MM/YY"
    const [expMonth, expYear] = method.expiry.split('/');
    setExpiryMonth(expMonth);
    setExpiryYear(`20${expYear}`); // Convert two-digit year to four-digit
    setCvv(method.cvv); // Pre-fill CVV
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (method: PaymentMethod) => {
    setMethodToDelete(method);
    setIsDeleteDialogOpen(true);
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
        fullNumber: method.fullNumber, // Store full card number
        expiry: method.expiry,
        cardHolder: method.cardHolder,
        isPrimary: method.isPrimary,
        cvv: method.cvv, // Store CVV
        createdAt: new Date(),
      };
      
      console.log('Method data to save:', methodData);
      
      await setDoc(methodRef, methodData);
      
      console.log('Payment method saved successfully');
      return true;
    } catch (error: any) {
      console.error('Error saving payment method to Firestore:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
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
        fullNumber: cleanCardNumber, // Store full card number
        expiry: `${expiryMonth.padStart(2, '0')}/${expiryYear.slice(-2)}`,
        cardHolder: cardHolder.trim(),
        isPrimary: paymentMethods.length === 0, // First card becomes primary
        createdAt: new Date(),
        cvv: cvv, // Store CVV
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
        // Find another method to set as primary
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
      // Update all methods - set the selected one as primary, others as not primary
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

  // Detect card type based on card number patterns (for auto-detection)
  const detectCardType = (number: string): string => {
    const cleaned = number.replace(/\D/g, '');

    // Visa: starts with 4
    if (/^4/.test(cleaned)) {
      return 'visa';
    }
    // Mastercard: starts with 51-55 or 2221-2720
    else if (/^(5[1-5]|2[2-7][0-9]{2})/.test(cleaned)) {
      return 'mastercard';
    }
    // American Express: starts with 34 or 37
    else if (/^3[47]/.test(cleaned)) {
      return 'amex';
    }
    // Discover: starts with 6011, 65, or 644-649
    else if (/^(6011|65|64[4-9])/.test(cleaned)) {
      return 'discover';
    }
    
    return 'unknown';
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and limit to 23 digits (including spaces)
    const value = e.target.value.replace(/\D/g, '').slice(0, 19);
    let formattedValue = value;
    
    // Add spaces for better readability: XXXX XXXX XXXX XXXX
    if (value.length > 4) {
      formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
    }
    
    setCardNumber(formattedValue);
    
    // Auto-detect card type when enough digits are entered (for suggestion only)
    if (value.length >= 2 && !cardType) {
      const detectedType = detectCardType(value);
      // Only auto-detect if user hasn't manually entered a card type
      if (!cardType.trim()) {
        setCardType(detectedType);
      }
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Payment Methods</h2>
          <Button disabled className="flex items-center gap-2">
            <Plus size={16} />
            Add Payment Method
          </Button>
        </div>
        <div className="text-center py-10 border border-gray-200 rounded-xl">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading your payment methods...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Payment Methods</h2>
        <Button onClick={openAddDialog} className="flex items-center gap-2">
          <Plus size={16} />
          Add Payment Method
        </Button>
      </div>

      {paymentMethods.length > 0 ? (
        <div className="space-y-4">
          {paymentMethods.map(method => (
            <div 
              key={method.id} 
              className={`p-4 rounded-xl border ${
                method.isPrimary 
                  ? 'border-blue-200 bg-blue-50' 
                  : 'border-gray-100 bg-white'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start">
                  <div className="p-2 rounded-full bg-gray-100 text-gray-600 mr-3">
                    <CreditCard size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{method.type.toUpperCase()} •••• {method.last4}</h4>
                      {method.isPrimary && (
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                          Primary
                        </span>
                      )}
                    </div>
                    
                    {/* Full Card Number with Show/Hide Toggle */}
                    <div className="mb-2">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm font-medium text-gray-700">Card Number:</Label>
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                            {showFullNumbers[method.id] 
                              ? method.fullNumber.replace(/(.{4})/g, '$1 ').trim()
                              : `•••• •••• •••• ${method.last4}`
                            }
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => toggleShowFullNumber(method.id)}
                          >
                            {showFullNumbers[method.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyToClipboard(method.fullNumber, method.id, 'Card Number')}
                          >
                            {copiedField?.methodId === method.id && copiedField?.field === 'Card Number' 
                              ? <Check size={14} className="text-green-600" /> 
                              : <Copy size={14} />
                            }
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* CVV with Show/Hide Toggle */}
                    <div className="mb-2">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm font-medium text-gray-700">CVV:</Label>
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                            {showCVV[method.id] ? method.cvv : '•••'}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => toggleShowCVV(method.id)}
                          >
                            {showCVV[method.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyToClipboard(method.cvv, method.id, 'CVV')}
                          >
                            {copiedField?.methodId === method.id && copiedField?.field === 'CVV' 
                              ? <Check size={14} className="text-green-600" /> 
                              : <Copy size={14} />
                            }
                          </Button>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-500">
                      Expires {method.expiry} • {method.cardHolder}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Added {method.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {!method.isPrimary && (
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetPrimary(method.id)}
                    >
                      Set Primary
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => openEditDialog(method)}
                  >
                    <Edit size={16} />
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="icon"
                    onClick={() => openDeleteDialog(method)}
                  >
                    <Trash size={16} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 border border-gray-200 rounded-xl">
          <CreditCard size={40} className="mx-auto text-gray-400 mb-3" />
          <h3 className="font-medium text-gray-700 text-lg">No Payment Methods</h3>
          <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
            You haven't added any payment methods yet. Add a payment method to enable withdrawals from your portfolio.
          </p>
          <Button onClick={openAddDialog}>Add Payment Method</Button>
        </div>
      )}
      
      <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
        <h3 className="font-medium text-gray-700 mb-2">Withdrawal Information</h3>
        <p className="text-sm text-gray-600 mb-3">
          When your portfolio reaches the minimum withdrawal threshold, you can withdraw funds to any of your verified payment methods.
        </p>
        <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
          <li>Minimum withdrawal amount: $1000</li>
          <li>Processing time: 1-2 business days</li>
          <li>Withdrawal fees: 1.5% (capped at $10)</li>
        </ul>
      </div>
      
      {/* Add/Edit Payment Method Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {currentMethod ? 'Edit Payment Method' : 'Add Payment Method'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="cardHolder">Cardholder Name *</Label>
              <Input
                id="cardHolder"
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value)}
                placeholder="John Doe"
              />
            </div>
            
            <div>
              <Label htmlFor="cardType">Card Type *</Label>
              <Input
                id="cardType"
                value={cardType}
                onChange={(e) => setCardType(e.target.value)}
                placeholder="Visa, Mastercard, American Express, etc."
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter your card type (e.g., Visa, Mastercard, American Express, Discover, etc.)
              </p>
            </div>
            
            <div>
              <Label htmlFor="cardNumber">Card Number *</Label>
              <Input
                id="cardNumber"
                value={cardNumber}
                onChange={handleCardNumberChange}
                placeholder="4242 4242 4242 4242"
              />
              {cardNumber.length > 0 && cardNumber.replace(/\s/g, '').length < 16 && (
                <p className="text-xs text-gray-500 mt-1">
                  {16 - cardNumber.replace(/\s/g, '').length} digits remaining
                </p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Expiry Date *</Label>
                <div className="flex gap-2">
                  <Input
                    value={expiryMonth}
                    onChange={(e) => setExpiryMonth(e.target.value.replace(/\D/g, '').slice(0, 2))}
                    placeholder="MM"
                  />
                  <Input
                    value={expiryYear}
                    onChange={(e) => setExpiryYear(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="YYYY"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="cvv">CVV *</Label>
                <Input
                  id="cvv"
                  type="text"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="123"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {cardType.toLowerCase().includes('amex') || cardType.toLowerCase().includes('american') 
                    ? '4 digits for American Express' 
                    : '3 digits for most cards'
                  }
                </p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsDialogOpen(false);
                resetForm();
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddPaymentMethod}
              disabled={isSubmitting}
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
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {methodToDelete && (
              <>
                <p className="text-gray-700 mb-4">
                  Are you sure you want to remove your {methodToDelete.type.toUpperCase()} card 
                  ending in <span className="font-medium">{methodToDelete.last4}</span>?
                </p>
                <p className="text-sm text-gray-500">
                  This action cannot be undone. You'll need to re-add this card if you want to use it again.
                </p>
              </>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleRemoveCard}
            >
              Delete Payment Method
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};