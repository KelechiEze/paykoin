import React, { useState, useEffect } from 'react';
import { CreditCard, Trash, Edit, Plus } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Payment method type definition
type PaymentMethod = {
  id: string;
  type: string;
  last4: string;
  expiry: string;
  cardHolder: string;
  isPrimary: boolean;
};

export const PaymentSettings: React.FC = () => {
  const { toast } = useToast();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [methodToDelete, setMethodToDelete] = useState<PaymentMethod | null>(null);
  const [currentMethod, setCurrentMethod] = useState<PaymentMethod | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardType, setCardType] = useState('');

  // Load payment methods from localStorage on mount
  useEffect(() => {
    const savedMethods = localStorage.getItem('paymentMethods');
    if (savedMethods) {
      setPaymentMethods(JSON.parse(savedMethods));
    }
  }, []);

  // Save to localStorage whenever payment methods change
  useEffect(() => {
    localStorage.setItem('paymentMethods', JSON.stringify(paymentMethods));
  }, [paymentMethods]);

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
    setCardHolder(method.cardHolder || '');
    setCardType(method.type);
    // Split the expiry string: "MM/YY"
    const [expMonth, expYear] = method.expiry.split('/');
    setExpiryMonth(expMonth);
    setExpiryYear(`20${expYear}`); // Convert two-digit year to four-digit
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (method: PaymentMethod) => {
    setMethodToDelete(method);
    setIsDeleteDialogOpen(true);
  };

  const handleAddPaymentMethod = async () => {
    setIsSubmitting(true);
    
    try {
      // In a real app, you would send this to your payment processor API
      // Here we'll simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Validate inputs
      if (!cardHolder || cardNumber.length < 16 || !expiryMonth || !expiryYear || !cvv) {
        throw new Error('Please fill all required fields');
      }

      // Auto-detect card type if not already set
      let detectedType = cardType;
      if (!detectedType) {
        detectedType = detectCardType(cardNumber);
      }

      const newMethod: PaymentMethod = {
        id: `card_${Date.now()}`,
        type: detectedType || 'unknown',
        last4: cardNumber.slice(-4),
        expiry: `${expiryMonth}/${expiryYear.slice(-2)}`,
        cardHolder,
        isPrimary: paymentMethods.length === 0
      };

      const updatedMethods = currentMethod
        ? paymentMethods.map(m => m.id === currentMethod.id ? newMethod : m)
        : [...paymentMethods, newMethod];
      
      setPaymentMethods(updatedMethods);
      
      toast({
        title: currentMethod ? 'Payment Method Updated' : 'Payment Method Added',
        description: `Your ${detectedType.toUpperCase()} card ending in ${newMethod.last4} was ${
          currentMethod ? 'updated' : 'added'
        } successfully`,
      });
      
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save payment method',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveCard = () => {
    if (!methodToDelete) return;
    
    const method = paymentMethods.find(m => m.id === methodToDelete.id);
    if (!method) return;
    
    if (method.isPrimary && paymentMethods.length > 1) {
      toast({
        title: 'Cannot remove primary card',
        description: 'Please set another card as primary before removing this one',
        variant: 'destructive',
      });
      setIsDeleteDialogOpen(false);
      return;
    }
    
    const updatedMethods = paymentMethods.filter(m => m.id !== methodToDelete.id);
    setPaymentMethods(updatedMethods);
    
    toast({
      title: 'Payment Method Removed',
      description: `Your card ending in ${method.last4} has been removed`,
    });
    
    setIsDeleteDialogOpen(false);
    setMethodToDelete(null);
  };

  const handleSetPrimary = (id: string) => {
    const updatedMethods = paymentMethods.map(method => ({
      ...method,
      isPrimary: method.id === id
    }));
    
    setPaymentMethods(updatedMethods);
    
    const primaryMethod = updatedMethods.find(m => m.isPrimary);
    if (primaryMethod) {
      toast({
        title: 'Primary Payment Method Updated',
        description: `Your ${primaryMethod.type.toUpperCase()} card ending in ${primaryMethod.last4} is now primary`,
      });
    }
  };

  // Detect card type based on card number patterns
const detectCardType = (number: string): string => {
  const cleaned = number.replace(/\D/g, '');

  if (/^4[0-9]{12}(?:[0-9]{3})?$/.test(cleaned)) {
    return 'visa';
  } else if (/^(5[1-5][0-9]{14}|2(?:22[1-9][0-9]{12}|2[3-9][0-9]{13}|[3-6][0-9]{14}|7[0-1][0-9]{13}|720[0-9]{12}))$/.test(cleaned)) {
    return 'mastercard';
  } else if (/^3[47][0-9]{13}$/.test(cleaned)) {
    return 'amex';
  } else if (/^(6011[0-9]{12}|65[0-9]{14}|64[4-9][0-9]{13}|622(?:12[6-9]|1[3-9][0-9]|[2-8][0-9][0-9]|9[01][0-9]|92[0-5])[0-9]{10})$/.test(cleaned)) {
    return 'discover';
  } else if (/^3(?:0[0-5]|[68][0-9])[0-9]{11}$/.test(cleaned)) {
    return 'diners';
  } else if (/^(?:2131|1800|35\d{3})\d{11}$/.test(cleaned)) {
    return 'jcb';
  } else if (/^62[0-9]{14,17}$/.test(cleaned)) {
    return 'unionpay';
  } 
  
  // ✅ Check Verve before Maestro
  else if (/^(5060(?:[0-9]{2})|5061(?:[0-9]{2})|5062(?:[0-9]{2})|5078(?:[0-9]{2})|5079(?:[0-9]{2})|6500(?:[0-9]{2}))[0-9]{10}$/.test(cleaned)) {
    return 'verve';
  }

  else if (/^(?:5[0-9]{5}|56[0-9]{4}|57[0-9]{4}|6[0-9]{5})[0-9]{6,13}$/.test(cleaned)) {
    return 'maestro';
  } else if (/^(6304|6706|6709|6771)[0-9]{12,15}$/.test(cleaned)) {
    return 'laser';
  } else if (/^(6334|6767)[0-9]{12,15}$/.test(cleaned)) {
    return 'solo';
  } else if (/^(4903|4905|4911|4936|6333|6759)[0-9]{12,15}|564182[0-9]{10,13}|633110[0-9]{10,13}$/.test(cleaned)) {
    return 'switch';
  } else if (/^(6541|6556)[0-9]{12}$/.test(cleaned)) {
    return 'bcglobal';
  } else if (/^389[0-9]{11}$/.test(cleaned)) {
    return 'carteblanche';
  } else if (/^63[7-9][0-9]{13}$/.test(cleaned)) {
    return 'instapayment';
  } else if (/^9[0-9]{15}$/.test(cleaned)) {
    return 'koreanlocal';
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
    
    // Auto-detect card type when enough digits are entered
    if (value.length >= 2) {
      const detectedType = detectCardType(value);
      setCardType(detectedType);
    } else if (value.length === 0) {
      setCardType('');
    }
  };

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
                  ? 'border-crypto-blue bg-blue-50' 
                  : 'border-gray-100'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start">
                  <div className="p-2 rounded-full bg-gray-100 text-gray-600 mr-3">
                    <CreditCard size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{method.type.toUpperCase()} •••• {method.last4}</h4>
                      {method.isPrimary && (
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                          Primary
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      Expires {method.expiry} • {method.cardHolder}
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
              <Label>Cardholder Name</Label>
              <Input
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value)}
                placeholder="John Doe"
              />
            </div>
            
            <div>
              <Label>Card Type</Label>
              <Select 
                value={cardType} 
                onValueChange={setCardType}
                disabled={!cardNumber || cardNumber.length < 2}
              >
                <SelectTrigger>
                  {cardType ? (
                    <div className="flex items-center gap-2">
                      <span className="capitalize">{cardType}</span>
                      {cardType === 'visa' && (
                        <div className="w-6 h-4 bg-blue-900 rounded-sm flex items-center justify-center">
                          <span className="text-white text-xs font-bold">V</span>
                        </div>
                      )}
                      {cardType === 'mastercard' && (
                        <div className="w-6 h-4 bg-orange-500 rounded-sm flex items-center justify-center">
                          <span className="text-white text-xs font-bold">MC</span>
                        </div>
                      )}
                      {cardType === 'amex' && (
                        <div className="w-6 h-4 bg-blue-600 rounded-sm flex items-center justify-center">
                          <span className="text-white text-xs font-bold">AX</span>
                        </div>
                      )}
                      {cardType === 'discover' && (
                        <div className="w-6 h-4 bg-orange-600 rounded-sm flex items-center justify-center">
                          <span className="text-white text-xs font-bold">D</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <span>Detecting card type...</span>
                  )}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="visa">Visa</SelectItem>
                  <SelectItem value="mastercard">Mastercard</SelectItem>
                  <SelectItem value="amex">American Express</SelectItem>
                  <SelectItem value="discover">Discover</SelectItem>
                  <SelectItem value="diners">Diners Club</SelectItem>
                  <SelectItem value="jcb">JCB</SelectItem>
                  <SelectItem value="unionpay">UnionPay</SelectItem>
                </SelectContent>
              </Select>
              {cardNumber.length > 0 && cardNumber.length < 6 && (
                <p className="text-xs text-gray-500 mt-1">
                  Enter more digits to detect card type
                </p>
              )}
            </div>
            
            <div>
              <Label>Card Number</Label>
              <Input
                value={cardNumber}
                onChange={handleCardNumberChange}
                placeholder="4242 4242 4242 4242"
              />
              {cardNumber.length > 0 && cardNumber.length < 19 && (
                <p className="text-xs text-gray-500 mt-1">
                  {19 - cardNumber.replace(/\s/g, '').length} digits remaining
                </p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Expiry Date</Label>
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
                <Label>CVV</Label>
                <Input
                  type="password"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="123"
                />
                {cardType === 'amex' && (
                  <p className="text-xs text-gray-500 mt-1">4 digits for American Express</p>
                )}
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
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddPaymentMethod}
              disabled={isSubmitting}
            >
              {isSubmitting 
                ? (currentMethod ? 'Updating...' : 'Adding...') 
                : (currentMethod ? 'Update Payment Method' : 'Add Payment Method')
              }
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