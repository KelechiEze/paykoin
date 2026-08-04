import React, { useState, useRef } from 'react';
import { ArrowUpRight, Play, Pause, X, ExternalLink, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';

interface HeroProps {
  onOpenQuote: () => void; // Make it required
}

export const Hero: React.FC<HeroProps> = ({ onOpenQuote }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showPurchaseWidget, setShowPurchaseWidget] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 1000], [0, 280]);
  const backgroundScale = useTransform(scrollY, [0, 1000], [1.08, 1.2]);

  const heroBg = 'https://kelechieze.wordpress.com/wp-content/uploads/2026/08/chatgpt-image-aug-4-2026-08_57_44-pm.png';
  const interiorThumb = '/src/assets/images/pcoin_about_consulting_1785872845989.jpg';
  // High quality crypto technology preview video
  const inlineVideoSrc = 'https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-with-charts-and-data-41584-large.mp4';

  const toggleInlineVideo = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      if (videoRef.current) videoRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      if (videoRef.current) {
        videoRef.current.play().catch(() => {
          // Fallback if autoplay restricted
        });
      }
    }
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen w-full flex flex-col justify-between pt-28 pb-12 px-4 sm:px-6 lg:px-12 overflow-hidden bg-[#070a11]"
    >
      {/* Hero Background Image with Parallax Scroll Effect */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.img
          src={heroBg}
          alt="Paycoin Crypto Investment Platform"
          style={{ y: backgroundY, scale: backgroundScale }}
          className="absolute -top-[10%] inset-x-0 w-full h-[120%] object-cover object-center pointer-events-none brightness-90 transform-gpu"
          referrerPolicy="no-referrer"
        />
        {/* Lighter Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#070a11] via-[#070a11]/40 to-black/40 z-1" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#070a11]/90 via-[#070a11]/50 to-transparent max-w-4xl z-1" />
      </div>

      {/* Main Hero Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto w-full my-auto py-12 flex flex-col justify-center">
        {/* Top Badge: // Guaranteed ROI Crypto Platform */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-[#61dafb]/30 w-fit mb-6 shadow-[0_0_15px_rgba(97,218,251,0.2)]"
        >
          <span className="text-[#61dafb] font-bold text-sm tracking-wider">//</span>
          <span className="text-xs sm:text-sm font-semibold text-white tracking-wide font-['Poppins']">
            Guaranteed ROI Crypto Platform
          </span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white max-w-5xl leading-[1.08] font-['Poppins'] mb-8 drop-shadow-md"
        >
          Multiply Capital with <br className="hidden sm:block" />
          <span className="text-[#61dafb] drop-shadow-[0_0_25px_rgba(97,218,251,0.4)]">Guaranteed ROI</span>
        </motion.h1>

        {/* Subtitle & Inline Video Container Row */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-12 max-w-5xl">
          {/* Subtitle Paragraph */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="text-base sm:text-lg text-gray-200 leading-relaxed font-light max-w-lg font-['Poppins'] drop-shadow"
          >
            Paycoin is the premier cryptocurrency platform. The more you invest, the higher your earnings — backed by automated ROI staking pools and transparent yields.
          </motion.p>

          {/* INLINE VIDEO CONTAINER (Plays video right inside container when clicked) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className={`group relative flex items-center gap-4 p-2 rounded-full bg-black/70 backdrop-blur-xl border transition-all duration-300 w-fit ${
              isPlaying
                ? 'border-[#61dafb] bg-black/90 pr-5 shadow-2xl shadow-[#61dafb]/20'
                : 'border-white/30 hover:border-[#61dafb]/60 pr-5 cursor-pointer'
            }`}
          >
            {/* Inline Video Player Box */}
            <div
              onClick={toggleInlineVideo}
              className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border border-[#61dafb]/40 shrink-0 cursor-pointer bg-black"
            >
              <video
                ref={videoRef}
                src={inlineVideoSrc}
                loop
                muted={isMuted}
                playsInline
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  isPlaying ? 'opacity-100 scale-105' : 'opacity-80'
                }`}
                poster={interiorThumb}
              />

              {!isPlaying && (
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <Play className="w-5 h-5 text-[#61dafb] fill-current ml-0.5" />
                </div>
              )}
            </div>

            {/* Play/Pause & Sound Controls within capsule */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleInlineVideo}
                className="w-10 h-10 rounded-full bg-white/20 border border-[#61dafb]/40 hover:bg-[#61dafb] hover:border-[#61dafb] text-white hover:text-black flex items-center justify-center transition-all duration-300 shadow-md shrink-0 cursor-pointer"
                aria-label={isPlaying ? 'Pause live trading stream' : 'Play live trading stream'}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>

              {/* Text / Status Indicator */}
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold text-white tracking-wide">
                  {isPlaying ? 'Live ROI Dashboard' : 'Watch ROI Trading Stream'}
                </span>
                <span className="text-[11px] text-[#61dafb] flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full bg-[#61dafb] ${isPlaying ? 'animate-ping' : ''}`} />
                  {isPlaying ? 'Automated Yield Stream' : 'Click to Play Stream'}
                </span>
              </div>

              {/* Audio toggle button when playing inline */}
              {isPlaying && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMuted(!isMuted);
                  }}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-[#61dafb] hover:text-black text-gray-300 transition-colors ml-1"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-[#61dafb]" />}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Floating Circular Action Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.6 }}
        className="hidden lg:flex absolute right-12 top-1/2 -translate-y-1/2 z-20 flex-col items-center"
      >
        <button
          onClick={onOpenQuote} // Call the prop
          className="group relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#61dafb] text-slate-950 flex items-center justify-center hover:bg-[#4faee3] transition-all duration-500 shadow-2xl shadow-[#61dafb]/40 hover:scale-110 active:scale-95 cursor-pointer"
          aria-label="Login Now"
          title="Login Now"
        >
          <ArrowUpRight className="w-10 h-10 sm:w-12 sm:h-12 stroke-[2.5] transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
          <span className="absolute inset-0 rounded-full border-2 border-[#61dafb]/50 animate-ping pointer-events-none" />
        </button>
      </motion.div>

      {/* Floating "Paycoin Platform" Card at Bottom Right */}
      <AnimatePresence>
        {showPurchaseWidget && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.4 }}
            className="fixed bottom-12 right-6 z-40 hidden sm:flex items-center gap-3 p-2.5 pr-4 rounded-2xl bg-[#121824]/90 backdrop-blur-xl border border-white/15 shadow-2xl hover:border-[#61dafb]/40 transition-all group"
          >
            <div className="w-12 h-10 rounded-xl overflow-hidden border border-white/10 shrink-0 bg-[#61dafb]/10 flex items-center justify-center text-[#61dafb] font-bold">
              P
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                Paycoin Ecosystem
                <ExternalLink className="w-3 h-3 text-[#61dafb]" />
              </span>
              <span className="text-[10px] text-gray-400">Guaranteed Crypto ROI</span>
            </div>
            <button
              onClick={() => setShowPurchaseWidget(false)}
              className="ml-2 text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Close widget"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Paycoin Status Badge at Bottom Right */}
      <div className="fixed bottom-3 right-4 z-40 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-[#61dafb]/20 text-[11px] font-medium text-gray-200 shadow-lg">
        <span className="w-2 h-2 rounded-full bg-[#61dafb] animate-pulse" />
        Paycoin Live ROI Engine Active
      </div>
    </section>
  );
};