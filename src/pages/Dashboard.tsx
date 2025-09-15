import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Eye, EyeOff, TrendingUp, TrendingDown, Activity, 
  ArrowRight, DollarSign, Bitcoin, Wallet, MessageSquare,
  Send, X, Bell, Search, Loader
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
// import CryptoChart from '@/components/layout/CryptoChart';
import CryptoAssetsModal from '@/components/layout/CryptoAssetsModal';
import { auth, db } from '@/firebase';
import { 
  doc, getDoc, onSnapshot, collection, 
  addDoc, query, where, orderBy, serverTimestamp,
  updateDoc, arrayUnion, arrayRemove, getDocs
} from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';

interface MarketTrend {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  image?: string;
}

interface DashboardData {
  totalBalance: number;
  portfolioGrowth: number;
  activeWallets: number;
  topPerformer: string;
}

// Commenting out messaging interfaces for now
/*
interface Message {
  id: string;
  senderId: string;
  senderEmail: string;
  senderName: string;
  receiverId: string;
  receiverEmail: string;
  content: string;
  timestamp: any;
  read: boolean;
}

interface User {
  uid: string;
  email: string;
  displayName: string;
}
*/

const Dashboard: React.FC = () => {
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [isAssetsModalOpen, setIsAssetsModalOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  // const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
  const [marketTrends, setMarketTrends] = useState<MarketTrend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalBalance: 0,
    portfolioGrowth: 0,
    activeWallets: 0,
    topPerformer: ''
  });
  const [welcomeMessage, setWelcomeMessage] = useState('');
  // Commenting out messaging states for now
  /*
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  */
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  // Array of welcome messages
  const welcomeMessages = [
    "Welcome back! Your financial progress is our success.",
    "Great to see you! Let's grow your profits together.",
    "Hello again! Your portfolio's progress brings us happiness.",
    "Welcome! We're excited to cooperate on your financial journey.",
    "Good to have you here! Your success is our foremost address.",
    "Hello! Let's continue building wealth and prosperity.",
    "Welcome back! Your financial growth is our shared quest.",
    "Great to see you! Together we'll achieve financial greatness.",
    "Hello again! Your profits and progress truly impress.",
    "Welcome! Let's make your financial dreams manifest."
  ];

  // Set a random welcome message on component mount
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * welcomeMessages.length);
    setWelcomeMessage(welcomeMessages[randomIndex]);
  }, []);

  // Fetch dashboard data from Firestore
  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(
      doc(db, 'users', user.uid, 'dashboard', 'stats'),
      (doc) => {
        if (doc.exists()) {
          setDashboardData(doc.data() as DashboardData);
        } else {
          console.log('No dashboard data found');
        }
      },
      (err) => {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Fetch market trends data
  useEffect(() => {
    const fetchMarketTrends = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=3&page=1&sparkline=false&price_change_percentage=24h'
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch market data');
        }
        
        const data = await response.json();
        setMarketTrends(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching market trends:', err);
        setError('Failed to load market trends');
        // Fallback data
        setMarketTrends([
          { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', current_price: 0, price_change_percentage_24h: 0 },
          { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', current_price: 0, price_change_percentage_24h: 0 },
          { id: 'solana', name: 'Solana', symbol: 'SOL', current_price: 0, price_change_percentage_24h: 0 }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarketTrends();
    const intervalId = setInterval(fetchMarketTrends, 30000);
    return () => clearInterval(intervalId);
  }, []);

  // Commenting out message fetching for now
  /*
  // Fetch messages for current user
  useEffect(() => {
    if (!user) return;

    const messagesQuery = query(
      collection(db, 'messages'),
      where('receiverId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesData: Message[] = [];
      let unread = 0;

      snapshot.forEach((doc) => {
        const message = { id: doc.id, ...doc.data() } as Message;
        messagesData.push(message);
        if (!message.read) unread++;
      });

      setMessages(messagesData);
      setUnreadCount(unread);
    });

    return () => unsubscribe();
  }, [user]);

  // Fetch all users for messaging
  useEffect(() => {
    if (!user) return;

    const usersQuery = query(collection(db, 'users'));

    const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
      const usersData: User[] = [];
      snapshot.forEach((doc) => {
        if (doc.id !== user.uid) { // Exclude current user
          const userData = doc.data();
          usersData.push({
            uid: doc.id,
            email: userData.email,
            displayName: userData.fullName || userData.email
          });
        }
      });
      setUsers(usersData);
    });

    return () => unsubscribe();
  }, [user]);
  */

  const toggleBalanceVisibility = () => {
    setIsBalanceVisible((prev) => !prev);
  };

  // Commenting out messaging functions for now
  /*
  // Search for users by email
  const searchUsers = async () => {
    if (!searchEmail.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Search in the already fetched users first
      const filteredUsers = users.filter(u => 
        u.email.toLowerCase().includes(searchEmail.toLowerCase())
      );
      
      // If not found in local state, query the database directly
      if (filteredUsers.length === 0) {
        const usersRef = collection(db, 'users');
        const q = query(
          usersRef, 
          where('email', '>=', searchEmail.toLowerCase()),
          where('email', '<=', searchEmail.toLowerCase() + '\uf8ff')
        );
        
        const querySnapshot = await getDocs(q);
        const dbUsers: User[] = [];
        
        querySnapshot.forEach((doc) => {
          if (doc.id !== user?.uid) {
            const userData = doc.data();
            dbUsers.push({
              uid: doc.id,
              email: userData.email,
              displayName: userData.fullName || userData.email
            });
          }
        });
        
        setSearchResults(dbUsers);
      } else {
        setSearchResults(filteredUsers);
      }
    } catch (err) {
      console.error('Error searching users:', err);
      setError('Failed to search users');
    } finally {
      setIsSearching(false);
    }
  };

  // Send a new message
  const sendMessage = async () => {
    if (!user || !searchEmail.trim() || !newMessage.trim()) {
      setError('Please enter a valid email and message');
      return;
    }

    try {
      // First, find the user by email
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', searchEmail.trim().toLowerCase()));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setError('User with this email not found');
        return;
      }
      
      const receiverDoc = querySnapshot.docs[0];
      const receiverData = receiverDoc.data();
      
      // Create the message
      await addDoc(collection(db, 'messages'), {
        senderId: user.uid,
        senderEmail: user.email,
        senderName: user.displayName || user.email,
        receiverId: receiverDoc.id,
        receiverEmail: receiverData.email,
        content: newMessage.trim(),
        timestamp: serverTimestamp(),
        read: false
      });

      setNewMessage('');
      setSearchEmail('');
      setSearchResults([]);
      setIsNewMessageOpen(false);
      
      // Show success message
      setError(null);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  };

  // Mark message as read
  const markAsRead = async (messageId: string) => {
    try {
      await updateDoc(doc(db, 'messages', messageId), {
        read: true
      });
    } catch (err) {
      console.error('Error marking message as read:', err);
    }
  };
  */

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatName = (str: string) => {
    return str
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[_\-\.]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\b\w/g, char => char.toUpperCase());
  };

  /*
  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  */

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header with Messages Icon */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">Dashboard</h1>
        <div className="relative">
          <button 
            onClick={() => setIsMessagesOpen(true)}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors relative"
          >
            <MessageSquare size={24} />
            {/* Commenting out unread count for now */}
            {/* {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )} */}
          </button>
        </div>
      </div>

      {/* Welcome Message */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="bg-gradient-to-r from-crypto-indigo to-crypto-blue text-white p-4 rounded-lg shadow-md"
      >
        <h2 className="text-xl font-semibold">
          Welcome back,{' '}
          {user?.displayName
            ? formatName(user.displayName)
            : user?.email
            ? formatName(user.email.split('@')[0])
            : 'User'}
        </h2>
        <p className="text-sm mt-1">{welcomeMessage}</p>
      </motion.div>

      {/* Balance Card */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="balance-card relative p-6 rounded-lg shadow-md bg-white"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-600">Total Balance</h2>
        </div>

        <div className="flex items-center space-x-2">
          <h3 className="text-4xl font-bold text-gray-900">
            {isBalanceVisible ? formatCurrency(dashboardData.totalBalance) : "••••••••"}
          </h3>
          <button 
            onClick={toggleBalanceVisibility}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label={isBalanceVisible ? "Hide balance" : "Show balance"}
          >
            {isBalanceVisible ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {/* Dynamic Percentage Change */}
        <div className="mt-2">
          <PercentageChange 
            value={dashboardData.portfolioGrowth} 
            suffix={`${formatCurrency(dashboardData.totalBalance * (dashboardData.portfolioGrowth / 100))} today`} 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <button 
            className="flex items-center justify-center py-3 px-4 rounded-xl bg-crypto-blue text-white font-medium hover:bg-crypto-blue/90 transition-colors"
            onClick={() => navigate('/wallets')}
          >
            <DollarSign size={18} className="mr-2" />
            <span>Deposit</span>
          </button>

          <button 
            className="flex items-center justify-center py-3 px-4 rounded-xl bg-white text-gray-700 font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
            onClick={() => navigate('/wallets')}
          >
            <Activity size={18} className="mr-2" />
            <span>Transfer</span>
          </button>

          <button className="flex items-center justify-center py-3 px-4 rounded-xl bg-white text-gray-700 font-medium border border-gray-200 hover:bg-gray-50 transition-colors">
            <TrendingUp size={18} className="mr-2" />
            <span>Trade</span>
          </button>
        </div>
      </motion.section>
      
      {/* Stats Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Portfolio Growth"
          value={`${dashboardData.portfolioGrowth >= 0 ? '+' : ''}${dashboardData.portfolioGrowth.toFixed(2)}%`}
          subtitle="Latest Updated"
          trend={dashboardData.portfolioGrowth >= 0 ? "up" : "down"}
          icon={TrendingUp}
        />
        <StatCard 
          title="Active Wallets"
          value={dashboardData.activeWallets.toString()}
          subtitle="Last updated today"
          icon={Wallet}
        />
        <StatCard 
          title="Top Performer"
          value={dashboardData.topPerformer || "None"}
          subtitle={dashboardData.topPerformer ? `${dashboardData.portfolioGrowth >= 0 ? '+' : ''}${dashboardData.portfolioGrowth.toFixed(2)}%` : "No data"}
          trend={dashboardData.portfolioGrowth >= 0 ? "up" : "down"}
          icon={Bitcoin}
        />
      </section>
      
      {/* Market Trends */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="dashboard-card"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Market Trends</h2>
          <button 
            onClick={() => setIsAssetsModalOpen(true)}
            className="text-sm text-crypto-blue font-medium flex items-center hover:underline transition-colors"
          >
            View all <ArrowRight size={16} className="ml-1" />
          </button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-crypto-blue"></div>
          </div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">{error}</div>
        ) : (
          <div className="divide-y">
            {marketTrends.map((coin) => (
              <div key={coin.id} className="py-4 flex items-center justify-between">
                <div className="flex items-center">
                  {coin.image ? (
                    <img 
                      src={coin.image} 
                      alt={coin.name}
                      className="w-10 h-10 rounded-full mr-3"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 mr-3">
                      {coin.symbol.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium">{coin.name}</h3>
                    <p className="text-sm text-gray-500">{coin.symbol}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-medium">${coin.current_price.toLocaleString()}</p>
                  <PercentageChange value={coin.price_change_percentage_24h} />
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.section>

      {/* Crypto Chart - Commented Out */}
      {/* <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="dashboard-card"
      >
        <CryptoChart />
      </motion.section> */}

      {/* Crypto Assets Modal */}
      <CryptoAssetsModal 
        isOpen={isAssetsModalOpen} 
        onClose={() => setIsAssetsModalOpen(false)} 
      />

      {/* Messages Modal - Coming Soon */}
      {isMessagesOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Messages</h3>
              <button 
                onClick={() => setIsMessagesOpen(false)}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-8 text-center">
              <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
              <h4 className="text-xl font-semibold mb-2">Coming Soon</h4>
              <p className="text-gray-500">The messaging feature is currently under development and will be available in a future update.</p>
            </div>
          </div>
        </div>
      )}

      {/* Commenting out the full messaging functionality for now */}
      {/*
      <Messages Modal />
      {isMessagesOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Messages</h3>
              <div className="flex space-x-2">
                <button 
                  onClick={() => {
                    setIsNewMessageOpen(true);
                    setSelectedUser(null);
                    setSearchEmail('');
                    setSearchResults([]);
                  }}
                  className="p-2 rounded-full bg-crypto-blue text-white hover:bg-crypto-blue/90"
                >
                  <MessageSquare size={18} />
                </button>
                <button 
                  onClick={() => setIsMessagesOpen(false)}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[60vh]">
              {messages.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>No messages yet</p>
                  <p className="text-sm mt-2">Send a message to another registered user to start a conversation</p>
                </div>
              ) : (
                <div className="divide-y">
                  {messages.map((message) => (
                    <div 
                      key={message.id} 
                      className={`p-4 hover:bg-gray-50 cursor-pointer ${!message.read ? 'bg-blue-50' : ''}`}
                      onClick={() => {
                        if (!message.read) markAsRead(message.id);
                        setIsNewMessageOpen(true);
                        setSearchEmail(message.senderEmail);
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{message.senderName}</h4>
                          <p className="text-sm text-gray-600 truncate">{message.content}</p>
                        </div>
                        <div className="flex flex-col items-end ml-2">
                          <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
                          {!message.read && (
                            <span className="mt-1 w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <New Message Modal />
      {isNewMessageOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">New Message</h3>
              <button 
                onClick={() => {
                  setIsNewMessageOpen(false);
                  setSearchEmail('');
                  setSearchResults([]);
                  setNewMessage('');
                  setError(null);
                }}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To (Email Address)
                </label>
                <input
                  type="email"
                  placeholder="Enter recipient's email..."
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="w-full border rounded-lg p-3 min-h-[100px] resize-none"
                />
              </div>

              {error && (
                <div className="mb-4 text-red-500 text-sm">{error}</div>
              )}

              <button 
                onClick={sendMessage}
                disabled={!newMessage.trim() || !searchEmail.trim()}
                className="w-full bg-crypto-blue text-white py-2 rounded-lg hover:bg-crypto-blue/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <Send size={16} className="mr-2" />
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}
      */}
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  trend?: 'up' | 'down';
  icon: React.ComponentType<any>;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, trend, icon: Icon }) => {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="dashboard-card"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-gray-600 font-medium">{title}</h3>
          <p className="text-2xl font-bold mt-2">{value}</p>
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>
        <div className={cn(
          "p-3 rounded-full",
          trend === 'up' ? "bg-green-50 text-green-600" : 
          trend === 'down' ? "bg-red-50 text-red-500" : 
          "bg-gray-50 text-gray-600"
        )}>
          <Icon size={20} />
        </div>
      </div>
    </motion.div>
  );
};

interface PercentageChangeProps {
  value: number;
  suffix?: string;
}

const PercentageChange: React.FC<PercentageChangeProps> = ({ value, suffix }) => {
  const isPositive = value >= 0;
  return (
    <div className={cn(
      "flex items-center text-sm font-medium",
      isPositive ? "text-green-600" : "text-red-500"
    )}>
      {isPositive ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
      <span>{isPositive ? '+' : ''}{value.toFixed(2)}%{suffix && ` (${suffix})`}</span>
    </div>
  );
};

export default Dashboard;