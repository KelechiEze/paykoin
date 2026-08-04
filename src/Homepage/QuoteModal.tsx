import React, { useState } from 'react';
import { X, CheckCircle2, ArrowRight, ShieldCheck, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuoteModal: React.FC<QuoteModalProps> = ({ isOpen, onClose }) => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    emailOrWallet: '',
    password: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-[#0f172a] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl text-white overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {submitted ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#61dafb]/20 text-[#61dafb] border border-[#61dafb]/40 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(97,218,251,0.3)]">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold font-['Poppins'] text-white">
                Login Successful!
              </h3>
              <p className="text-sm text-gray-300 font-normal max-w-xs mx-auto leading-relaxed">
                Welcome back to <span className="font-bold text-[#61dafb]">Paycoin Vault</span>. Redirecting to your automated ROI dashboard...
              </p>
              <button
                onClick={handleReset}
                className="mt-6 px-7 py-3 rounded-full bg-[#61dafb] text-slate-950 font-bold text-sm hover:bg-[#4faee3] transition-all shadow-lg shadow-[#61dafb]/25"
              >
                Go to Dashboard
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-[#61dafb]/15 border border-[#61dafb]/40 flex items-center justify-center text-[#61dafb] font-black text-base">
                  P
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#61dafb]">
                  Paycoin Portal
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold font-['Poppins'] mb-1">
                Account Login
              </h3>
              <p className="text-xs sm:text-sm text-gray-400 mb-6 font-normal">
                Access your high-yield Paycoin crypto ROI investment dashboard.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Email Address or Web3 Wallet *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="investor@paycoin.com or 0x..."
                    value={formData.emailOrWallet}
                    onChange={(e) => setFormData({ ...formData, emailOrWallet: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#61dafb] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex justify-between">
                    <span>Password *</span>
                    <a href="#" className="text-[11px] text-[#61dafb] hover:underline" onClick={(e) => e.preventDefault()}>Forgot?</a>
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      placeholder="••••••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#61dafb] transition-colors"
                    />
                    <Lock className="w-4 h-4 text-gray-400 absolute right-3.5 top-3.5" />
                  </div>
                </div>

                <div className="flex items-center gap-2 py-1 text-xs text-gray-400">
                  <ShieldCheck className="w-4 h-4 text-[#61dafb]" />
                  <span>Encrypted 256-bit multi-factor security</span>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-[#61dafb] text-slate-950 font-bold text-sm sm:text-base hover:bg-[#4faee3] transition-all shadow-lg shadow-[#61dafb]/25 cursor-pointer mt-2"
                >
                  <span>Login Now</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
